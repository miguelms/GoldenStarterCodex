import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const agentsRoot = join(projectRoot, ".agents", "agents");
const allowedTools = new Set([
  "view_file",
  "grep_search",
  "replace_file_content",
  "run_command",
  "invoke_subagent",
]);
const expectedAgents = new Set([
  "backend-agent",
  "change-planner-agent",
  "debugger-regression-agent",
  "devops-agent",
  "docs-agent",
  "frontend-agent",
  "infra-data-agent",
  "mobile-agent",
  "orchestrator-agent",
  "platform-release-agent",
  "product-manager-agent",
  "qa-agent",
  "repo-explorer-agent",
  "security-agent",
  "sre-agent",
  "test-engineer-agent",
  "ui-ux-designer-agent",
]);
const expectedMainAgents = new Set([
  "orchestrator-agent",
  "product-manager-agent",
  "ui-ux-designer-agent",
]);
const expectedSkills = new Map([
  ["devops-agent", ["skills/production-deployment"]],
  ["product-manager-agent", ["skills/live-product-qa"]],
  ["ui-ux-designer-agent", ["skills/live-design-review"]],
]);
const strictReaders = new Set(["qa-agent", "repo-explorer-agent"]);

function parseScalar(value) {
  const unquoted = value.replace(/^(["'])(.*)\1$/, "$2");
  if (unquoted === "true") return true;
  if (unquoted === "false") return false;
  return unquoted;
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: falta frontmatter YAML delimitado por ---`);

  const data = {};
  let listKey = null;
  for (const rawLine of match[1].split("\n")) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const listItem = rawLine.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      data[listKey].push(parseScalar(listItem[1].trim()));
      continue;
    }

    const entry = rawLine.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/);
    if (!entry) throw new Error(`${file}: línea YAML no soportada: ${rawLine}`);
    const [, key, value = ""] = entry;
    if (value === "") {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = parseScalar(value.trim());
      listKey = null;
    }
  }

  return { data, body: match[2].trim() };
}

const errors = [];
const seenNames = new Set();
const files = readdirSync(agentsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(agentsRoot, entry.name, "agent.md"))
  .sort();

for (const file of files) {
  if (!existsSync(file)) {
    errors.push(`${file}: falta agent.md`);
    continue;
  }

  try {
    const { data, body } = parseFrontmatter(readFileSync(file, "utf8"), file);
    const directoryName = dirname(file).split("/").at(-1);
    for (const key of [
      "name",
      "description",
      "model",
      "subagent",
      "mainAgent",
      "commandExecutionPolicy",
      "tools",
    ]) {
      if (data[key] === undefined) errors.push(`${file}: falta ${key}`);
    }

    if (data.name !== directoryName) errors.push(`${file}: name debe coincidir con el directorio`);
    if (seenNames.has(data.name)) errors.push(`${file}: name duplicado ${data.name}`);
    seenNames.add(data.name);
    if (data.model !== "inherit") errors.push(`${file}: model debe ser inherit en el piloto`);
    if (data.subagent !== true) errors.push(`${file}: subagent debe ser true`);
    if (data.mainAgent !== expectedMainAgents.has(data.name)) {
      errors.push(`${file}: mainAgent no coincide con el registro del proyecto`);
    }
    if (!["off", "sandbox"].includes(data.commandExecutionPolicy)) {
      errors.push(`${file}: commandExecutionPolicy debe ser off o sandbox`);
    }
    if (!Array.isArray(data.tools) || data.tools.length === 0) {
      errors.push(`${file}: tools debe ser una lista no vacía`);
    } else {
      for (const tool of data.tools) {
        if (!allowedTools.has(tool)) errors.push(`${file}: tool no aprobada: ${tool}`);
      }
    }
    if (data.commandExecutionPolicy === "off" && data.tools?.includes("run_command")) {
      errors.push(`${file}: run_command contradice commandExecutionPolicy off`);
    }
    if (strictReaders.has(data.name)) {
      for (const forbidden of ["replace_file_content", "run_command"]) {
        if (data.tools?.includes(forbidden))
          errors.push(`${file}: lector estricto no puede usar ${forbidden}`);
      }
    }
    for (const skill of data.skills ?? []) {
      const skillFile = join(projectRoot, ".agents", skill, "SKILL.md");
      if (!existsSync(skillFile)) errors.push(`${file}: skill inexistente: ${skill}`);
    }
    const actualSkills = [...(data.skills ?? [])].sort();
    const requiredSkills = [...(expectedSkills.get(data.name) ?? [])].sort();
    if (JSON.stringify(actualSkills) !== JSON.stringify(requiredSkills)) {
      errors.push(`${file}: skills no coincide con el registro del proyecto`);
    }
    if (body.length < 120) errors.push(`${file}: cuerpo de instrucciones insuficiente`);
  } catch (error) {
    errors.push(error.message);
  }
}

for (const name of expectedAgents) {
  if (!seenNames.has(name)) errors.push(`falta agente esperado: ${name}`);
}
for (const name of seenNames) {
  if (!expectedAgents.has(name)) errors.push(`agente no registrado: ${name}`);
}

if (errors.length > 0) {
  console.error(`Configuración Antigravity inválida (${errors.length} problema(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Configuración Antigravity válida: ${files.length} agentes, ${expectedMainAgents.size} principales.`,
);
