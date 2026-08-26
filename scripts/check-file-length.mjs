import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const MAX_LINES = 499;
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".mjs"]);
const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  "dist",
  "playwright-report",
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      paths.push(...(await collectFiles(join(directory, entry.name))));
      continue;
    }

    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    if (entry.isFile() && EXTENSIONS.has(extension)) {
      paths.push(join(directory, entry.name));
    }
  }

  return paths;
}

function lineCount(contents) {
  if (contents.length === 0) return 0;
  const lines = contents.split(/\r?\n/);
  return lines.at(-1) === "" ? lines.length - 1 : lines.length;
}

const requestedRoots = process.argv.slice(2);
const roots = requestedRoots.length > 0
  ? requestedRoots
  : ["src", "tests", "e2e", "scripts"];
const files = [];

for (const root of roots) {
  try {
    files.push(...(await collectFiles(resolve(root))));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const violations = [];
for (const file of files.sort()) {
  const count = lineCount(await readFile(file, "utf8"));
  if (count > MAX_LINES) {
    violations.push(`${file}: ${count} lines exceeds ${MAX_LINES}`);
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} source files (max ${MAX_LINES} lines).`);
}
