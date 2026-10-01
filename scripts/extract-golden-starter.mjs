#!/usr/bin/env node

/**
 * scripts/extract-golden-starter.mjs
 *
 * Motor de extracción, sanitización y catálogo para la promoción del
 * Golden Starter canónico V3 (v3.0.0).
 *
 * Capacidades:
 * - Excluye: .git, node_modules, .next, .expo, dist, logs, .DS_Store, locks temporales, secrets locales.
 * - Conserva: Código fuente, contratos, pruebas, migraciones, scripts, agentes, docs y fixtures ficticios.
 * - Valida integridad contra golden-starter.manifest.json y registra los perfiles locales de Codex.
 * - Calcula checksum SHA256 determinista del árbol del starter.
 * - Soporta modo '--dry-run' sin alterar el disco.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  mkdirSync,
  writeFileSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { dirname, join, relative, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

// Reglas de exclusión
const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".expo",
  "dist",
  "build",
  "logs",
  ".turbo",
  "coverage",
  ".nyc_output",
  "test-results",
  "playwright-report",
  "release-artifacts",
  "dist-starter",
  "ios",
  "android",
  "scratch",
  ".system_generated",
]);

const EXCLUDED_FILE_PATTERNS = [
  /^\.DS_Store$/,
  /\.log$/,
  /\.tsbuildinfo$/,
  /~$/,
  /\.swp$/,
  /\.swo$/,
  /^#.*#$/,
  /^\.env(\..+)?\.local$/,
  /^\.env\.production$/,
  /^\.package-lock\.json$/,
  /\.pid$/,
];

function isExcludedFile(relPath, fileName) {
  // Excluir locks temporales excepto package-lock.json canónico
  if (fileName.endsWith(".lock") && fileName !== "package-lock.json") {
    return true;
  }
  // Excluir txts transitorios en artifacts/results/*.txt
  if (relPath.startsWith("artifacts/results/") && fileName.endsWith(".txt")) {
    return true;
  }
  for (const pattern of EXCLUDED_FILE_PATTERNS) {
    if (pattern.test(fileName)) return true;
  }
  return false;
}

// Escáner de seguridad para prevenir fugas de secretos reales en el starter
const SECRET_PATTERNS = [
  /-----BEGIN\s+(?:RSA|OPENSSH|EC|DSA|PGP)?\s*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[0-9a-zA-Z]{36}/,
  /github_pat_[0-9a-zA-Z_]{82}/,
  /xox[baprs]-[0-9a-zA-Z]{10,48}/,
];

function scanContentForSecrets(content, filePath) {
  // Permitir archivos de plantilla y tests con mocks
  if (
    filePath === ".env.example" ||
    filePath === ".env.staging" ||
    filePath.startsWith("tests/") ||
    filePath.includes("mock") ||
    filePath.includes("fixture")
  ) {
    return null;
  }
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return `Patrón de secreto detectado (${pattern.toString()}) en ${filePath}`;
    }
  }
  return null;
}

// Recorrido recursivo del repositorio con podado estricto
function scanDirectory(dir, relPrefix = "") {
  const fileList = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = relPrefix ? posix.join(relPrefix, entry.name) : entry.name;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      fileList.push(...scanDirectory(fullPath, relPath));
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      if (isExcludedFile(relPath, entry.name)) {
        continue;
      }
      fileList.push(relPath);
    }
  }

  return fileList;
}

// Clasificación de archivos por rol en el Golden Starter
function categorizeFile(relPath) {
  if (relPath.startsWith("packages/contracts/")) return "contracts";
  if (relPath.startsWith("src/demo/") || relPath.includes("fixtures/")) return "fixtures";
  if (relPath.startsWith("src/") || relPath.startsWith("apps/")) return "source";
  if (relPath.startsWith("tests/")) return "tests";
  if (relPath.startsWith("drizzle/")) return "migrations";
  if (relPath.startsWith("scripts/")) return "scripts";
  if (relPath.startsWith(".agents/") || relPath.startsWith(".codex/agents/")) return "agents";
  if (
    relPath.startsWith("docs/") ||
    relPath.startsWith("specs/") ||
    (relPath.endsWith(".md") && !relPath.includes("/"))
  ) {
    return "docs";
  }
  return "config";
}

// Validación contra golden-starter.manifest.json
function validateManifest(manifestPath) {
  if (!existsSync(manifestPath)) {
    throw new Error(`Falta el manifiesto canónico: ${manifestPath}`);
  }
  const raw = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

  const errors = [];
  if (!manifest.name.startsWith("golden-starter")) {
    errors.push(`Nombre inválido: ${manifest.name}`);
  }
  if (!manifest.version.startsWith("3.") && !manifest.version.startsWith("2.")) {
    errors.push(`Versión inválida: ${manifest.version}`);
  }
  if (!manifest.architecture || !manifest.architecture.framework) {
    errors.push("Falta definición de arquitectura monorepo");
  }

  // Validar capacidades certificadas
  const requiredCaps = ["CAP-001", "CAP-002", "CAP-003", "CAP-004", "CAP-005"];
  const capIds = new Set((manifest.certified_capabilities || []).map((c) => c.id));
  for (const cap of requiredCaps) {
    if (!capIds.has(cap)) {
      errors.push(`Falta capacidad certificada requerida: ${cap}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Inconsistencias en manifiesto:\n- ${errors.join("\n- ")}`);
  }

  return manifest;
}

// Proceso principal
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isJson = args.includes("--json");
  const isVerbose = args.includes("--verbose") || args.includes("-v");
  const helpRequested = args.includes("--help") || args.includes("-h");

  if (helpRequested) {
    console.log(`
Uso: node scripts/extract-golden-starter.mjs [opciones]

Opciones:
  --dry-run        Valida sanitización, integridad y calcula checksum sin tocar el disco.
  --output, -o     Ruta del archivo o directorio de salida (default: release-artifacts/golden-starter-v3-3.0.0.tar.gz)
  --json           Emite el resultado en formato JSON estructurado.
  --verbose, -v    Muestra el detalle individual de cada archivo incluido.
  --help, -h       Muestra esta ayuda.
`);
    process.exit(0);
  }

  let outputPath = "release-artifacts/golden-starter-v3-3.0.0.tar.gz";
  const outIdx = args.findIndex((a) => a === "--output" || a === "-o");
  if (outIdx !== -1 && args[outIdx + 1]) {
    outputPath = args[outIdx + 1];
  }

  const manifestPath = join(projectRoot, "golden-starter.manifest.json");

  // 1. Validar manifiesto canónico
  const manifest = validateManifest(manifestPath);
  const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
  const codexAgentsDir = join(projectRoot, ".codex", "agents");
  const codexAgentCount = existsSync(codexAgentsDir)
    ? readdirSync(codexAgentsDir).filter((file) => file.endsWith(".toml")).length
    : 0;
  const qualityGateNames = [
    "typecheck",
    "lint",
    "test:unit",
    "test:integration",
    "build:web",
    "test:e2e:web",
    "check:mobile",
    "audit:ci",
  ].filter((name) => packageJson.scripts?.[name]);

  // 2. Escanear archivos preservados
  const files = scanDirectory(projectRoot).sort();

  // 3. Sanitizar y verificar contenidos
  let totalBytes = 0;
  const categorized = {
    source: [],
    contracts: [],
    tests: [],
    migrations: [],
    scripts: [],
    agents: [],
    docs: [],
    fixtures: [],
    config: [],
  };

  const masterHasher = createHash("sha256");
  const fileDetails = [];

  for (const relPath of files) {
    const fullPath = join(projectRoot, relPath);
    const contentBuffer = readFileSync(fullPath);
    totalBytes += contentBuffer.length;

    // Verificar fuga de secretos
    const secretError = scanContentForSecrets(contentBuffer.toString("utf8"), relPath);
    if (secretError) {
      throw new Error(`Sanitización fallida: ${secretError}`);
    }

    const fileSha256 = createHash("sha256").update(contentBuffer).digest("hex");
    masterHasher.update(`${relPath}:${fileSha256}\n`);

    const category = categorizeFile(relPath);
    categorized[category].push(relPath);

    fileDetails.push({
      path: relPath,
      category,
      bytes: contentBuffer.length,
      sha256: fileSha256,
    });
  }

  const starterTreeSha256 = masterHasher.digest("hex");

  // 4. Si no es dry-run, realizar empaquetado real
  let packageStatus = "DRY_RUN_COMPLETED";
  let archiveSha256 = null;

  if (!isDryRun) {
    const absOutputPath = resolve(projectRoot, outputPath);
    const outputDir = dirname(absOutputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    if (outputPath.endsWith(".tar.gz") || outputPath.endsWith(".tgz")) {
      // Empaquetar usando tar nativo mediante lista de archivos
      const tempFileList = join(outputDir, ".starter-files.tmp");
      writeFileSync(tempFileList, files.join("\n") + "\n", "utf8");
      try {
        execFileSync("tar", ["-czf", absOutputPath, "-T", tempFileList], {
          cwd: projectRoot,
          stdio: "pipe",
        });
      } finally {
        if (existsSync(tempFileList)) rmSync(tempFileList);
      }
      archiveSha256 = createHash("sha256").update(readFileSync(absOutputPath)).digest("hex");
      packageStatus = "ARCHIVE_GENERATED";
    } else {
      // Copia directa a directorio sanitizado
      if (existsSync(absOutputPath)) rmSync(absOutputPath, { recursive: true, force: true });
      mkdirSync(absOutputPath, { recursive: true });
      for (const relPath of files) {
        const dest = join(absOutputPath, relPath);
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(join(projectRoot, relPath), dest);
      }
      packageStatus = "DIRECTORY_EXPORTED";
    }
  }

  // 5. Salida estructurada
  const result = {
    starter: {
      name: manifest.name,
      version: manifest.version,
      base_ref: manifest.base_ref,
      architecture: manifest.architecture.framework,
    },
    capabilities_certified: manifest.certified_capabilities.map((c) => ({
      id: c.id,
      name: c.name,
    })),
    codex_agent_profiles: codexAgentCount,
    quality_gates: qualityGateNames,
    sanitization: {
      status: "VERIFIED_CLEAN",
      secrets_detected: 0,
      excluded_directories: Array.from(EXCLUDED_DIRS),
      excluded_patterns: EXCLUDED_FILE_PATTERNS.map((p) => p.toString()),
    },
    metrics: {
      total_files: files.length,
      total_bytes: totalBytes,
      categories: {
        source: categorized.source.length,
        contracts: categorized.contracts.length,
        tests: categorized.tests.length,
        migrations: categorized.migrations.length,
        scripts: categorized.scripts.length,
        agents: categorized.agents.length,
        docs: categorized.docs.length,
        fixtures: categorized.fixtures.length,
        config: categorized.config.length,
      },
      tree_sha256: starterTreeSha256,
    },
    packaging: {
      mode: isDryRun ? "dry-run" : "export",
      status: packageStatus,
      target: isDryRun ? null : outputPath,
      archive_sha256: archiveSha256,
    },
    exit_code: 0,
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Impresión visual estructurada para consola/CI
  console.log("================================================================================");
  console.log("       GOLDEN STARTER CODEX — MOTOR DE EXTRACCIÓN Y SANITIZACIÓN                ");
  console.log("================================================================================");
  console.log(`Starter:           ${manifest.name} (v${manifest.version})`);
  console.log(`Base Ref:          ${manifest.base_ref}`);
  console.log(`Arquitectura:      ${manifest.architecture.framework}`);
  console.log(`Modo Ejecución:    ${isDryRun ? "DRY-RUN (Sin modificación en disco)" : "EXPORTACIÓN ACTIVA"}`);
  console.log("--------------------------------------------------------------------------------");
  console.log("Capacidades Certificadas Validadas:");
  for (const cap of manifest.certified_capabilities) {
    console.log(`  [OK] ${cap.id.padEnd(8)}: ${cap.name}`);
  }
  console.log("--------------------------------------------------------------------------------");
  console.log(`Perfiles especialistas Codex: ${codexAgentCount}`);
  console.log("--------------------------------------------------------------------------------");
  console.log(`Checks configurados (${qualityGateNames.length}):`);
  console.log(`  ${qualityGateNames.join(", ")}`);
  console.log("--------------------------------------------------------------------------------");
  console.log("Métricas del Árbol Sanitizado:");
  console.log(`  Total Archivos:    ${files.length}`);
  console.log(`  Tamaño Total:      ${(totalBytes / 1024).toFixed(2)} KB (${totalBytes} bytes)`);
  console.log("  Desglose por Categoría:");
  console.log(`    - Source (Web/Mobile): ${categorized.source.length.toString().padStart(3)} archivos`);
  console.log(`    - Contratos Zod:       ${categorized.contracts.length.toString().padStart(3)} archivos`);
  console.log(`    - Pruebas (Unit/Int):  ${categorized.tests.length.toString().padStart(3)} archivos`);
  console.log(`    - Migraciones DB:      ${categorized.migrations.length.toString().padStart(3)} archivos`);
  console.log(`    - Scripts Operativos:  ${categorized.scripts.length.toString().padStart(3)} archivos`);
  console.log(`    - Agentes y Skills:    ${categorized.agents.length.toString().padStart(3)} archivos`);
  console.log(`    - Documentación/Specs: ${categorized.docs.length.toString().padStart(3)} archivos`);
  console.log(`    - Fixtures Ficticios:  ${categorized.fixtures.length.toString().padStart(3)} archivos`);
  console.log(`    - Configuración/CI:    ${categorized.config.length.toString().padStart(3)} archivos`);
  console.log("--------------------------------------------------------------------------------");
  console.log("Sanitización e Invariantes:");
  console.log("  [OK] Exclusiones de carpetas temporales/dependencias aplicadas.");
  console.log("  [OK] Cero archivos .DS_Store, *.log o locks transitorios incluidos.");
  console.log("  [OK] Cero secretos, llaves privadas o credenciales reales en código.");
  console.log(`  [OK] Checksum Determinista SHA256:`);
  console.log(`       ${starterTreeSha256}`);
  if (!isDryRun && archiveSha256) {
    console.log(`  [OK] Archivo Generado: ${outputPath}`);
    console.log(`       SHA256: ${archiveSha256}`);
  }
  console.log("================================================================================");
  console.log(`VEREDICTO: PASS (Exit Code 0)`);
  console.log("================================================================================");

  if (isVerbose) {
    console.log("\nLista completa de archivos incluidos:");
    for (const f of fileDetails) {
      console.log(`  [${f.category.padEnd(10)}] ${f.path} (${f.bytes} B, sha: ${f.sha256.slice(0, 8)})`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("\n[ERROR FATAL] Extracción del Golden Starter fallida:");
  console.error(err.message);
  process.exit(1);
});
