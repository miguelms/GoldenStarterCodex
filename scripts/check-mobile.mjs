import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../apps/mobile/package.json", import.meta.url)),
);
const required = ["expo", "expo-router", "react", "react-native"];
const missing = required.filter((name) => !packageJson.dependencies?.[name]);

if (missing.length > 0) {
  console.error(`Missing mobile dependencies: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Mobile package manifest OK (${packageJson.version})`);
