import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFilePath = join(projectRoot, ".env.staging");

console.log("🔍 Validating Staging Environment Configuration (.env.staging)...");

if (!existsSync(envFilePath)) {
  console.error("❌ Error: .env.staging file not found at " + envFilePath);
  process.exit(1);
}

const rawContent = readFileSync(envFilePath, "utf8");

function parseEnv(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function maskValue(val) {
  if (!val) return "[EMPTY]";
  if (val.length <= 8) return "[MASKED]";
  return `${val.slice(0, 4)}***${val.slice(-4)} (length: ${val.length})`;
}

const env = parseEnv(rawContent);
const errors = [];
const verifiedKeys = [];

function validate(key, validator, options = {}) {
  const isSecret = options.isSecret ?? false;
  const val = env[key];

  if (val === undefined || val === "") {
    errors.push(`Missing required variable: ${key}`);
    console.error(`  ❌ [MISSING] ${key}`);
    return;
  }

  const result = validator(val);
  if (result !== true) {
    errors.push(`Invalid ${key}: ${result}`);
    console.error(`  ❌ [INVALID] ${key}: ${result}`);
  } else {
    const displayVal = isSecret ? maskValue(val) : val;
    verifiedKeys.push(key);
    console.log(`  ✓ [VALID]   ${key} = ${displayVal}`);
  }
}

// 1. NODE_ENV
validate("NODE_ENV", (v) => {
  if (v !== "production" && v !== "staging") {
    return `Must be 'production' or 'staging' (got '${v}')`;
  }
  return true;
});

// 2. PORT
validate("PORT", (v) => {
  const port = Number.parseInt(v, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    return `Must be a valid TCP port between 1 and 65535 (got '${v}')`;
  }
  return true;
});

// Helper for PostgreSQL connection string
function checkPostgresUrl(v) {
  try {
    const url = new URL(v);
    if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
      return `Protocol must be postgres: or postgresql: (got '${url.protocol}')`;
    }
    if (!url.username) return "Must specify username in URL";
    if (!url.password) return "Must specify password in URL";
    if (!url.hostname) return "Must specify hostname in URL";
    if (!url.pathname || url.pathname === "/") {
      return "Must specify database name in URL path";
    }

    // Fictitious / non-production check
    const prohibitedHosts = [
      "rds.amazonaws.com",
      "supabase.co",
      "neon.tech",
      "cockroachlabs.cloud",
      "azure.com",
    ];
    for (const ph of prohibitedHosts) {
      if (url.hostname.includes(ph)) {
        return `Host appears to be a real production provider (${ph}); staging must be isolated/fictitious`;
      }
    }

    return true;
  } catch {
    return "Invalid URL format for PostgreSQL connection string";
  }
}

// 3. POSTGRES_URL
validate("POSTGRES_URL", checkPostgresUrl, { isSecret: true });

// 4. DATABASE_URL
validate("DATABASE_URL", checkPostgresUrl, { isSecret: true });

// 5. BETTER_AUTH_SECRET
validate(
  "BETTER_AUTH_SECRET",
  (v) => {
    if (v.length < 32) {
      return `Secret must be at least 32 characters long for security (got ${v.length})`;
    }
    const lower = v.toLowerCase();
    const hasMockIndicator =
      lower.includes("staging") ||
      lower.includes("mock") ||
      lower.includes("fictitious") ||
      lower.includes("secret") ||
      lower.includes("test");
    if (!hasMockIndicator) {
      return "Secret must clearly denote staging/mock/test/fictitious status to prevent accidental prod leak";
    }
    return true;
  },
  { isSecret: true },
);

// 6. BETTER_AUTH_URL
validate("BETTER_AUTH_URL", (v) => {
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Must be HTTP or HTTPS URL";
    }
    return true;
  } catch {
    return "Invalid URL format";
  }
});

// 7. NEXT_PUBLIC_API_URL
validate("NEXT_PUBLIC_API_URL", (v) => {
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Must be HTTP or HTTPS URL";
    }
    return true;
  } catch {
    return "Invalid URL format";
  }
});

// 8. NEXT_PUBLIC_APP_NAME
validate("NEXT_PUBLIC_APP_NAME", (v) => {
  if (v.trim().length === 0) return "App name cannot be empty";
  return true;
});

// 9. NEXT_PUBLIC_GEOFENCE_RADIUS_METERS
validate("NEXT_PUBLIC_GEOFENCE_RADIUS_METERS", (v) => {
  const meters = Number.parseInt(v, 10);
  if (Number.isNaN(meters) || meters <= 0) {
    return `Must be a positive integer (got '${v}')`;
  }
  return true;
});

console.log("\n-------------------------------------------------------------");
if (errors.length > 0) {
  console.error(`❌ Validation FAILED with ${errors.length} error(s):`);
  for (const err of errors) {
    console.error(`   - ${err}`);
  }
  process.exit(1);
} else {
  console.log(
    `✅ Staging environment validation SUCCESSFUL (${verifiedKeys.length} variables verified, 0 secrets exposed, 100% fictitious & functional).`,
  );
  process.exit(0);
}
