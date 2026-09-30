import "dotenv/config";

const databaseUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: Database URL is not configured.");
  process.exit(1);
}

const url = new URL(databaseUrl);
const database = decodeURIComponent(url.pathname.slice(1));
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

if (localHosts.has(url.hostname)) {
  console.error(
    "Refusing production operation: target database host cannot be localhost/127.0.0.1.",
  );
  process.exit(1);
}

// Credentials intentionally never appear in logs
console.log(`Validated target database: ${url.hostname}:${url.port || "5432"}/${database}`);
