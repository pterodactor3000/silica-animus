#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_NAME = "@pterodactor3000/silica-animus";
const BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const END = `<!-- END ${PACKAGE_NAME} -->`;
const MANIFEST = ".silica-animus-manifest.json";
const RULES_FILES = new Set(["AGENTS.md", "CLAUDE.md"]);

function findProjectRoot() {
  if (process.env.PROJECT_ROOT) return process.env.PROJECT_ROOT;

  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (path.basename(dir) === "node_modules") return path.dirname(dir);
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function removeRulesBlock(content) {
  const start = content.indexOf(BEGIN);
  const end = content.indexOf(END);
  if (start === -1 || end === -1 || end < start) return content;
  return (content.slice(0, start) + content.slice(end + END.length)).replace(/\n{3,}/g, "\n\n");
}

function skillDirsFromManifest(files) {
  const dirs = new Set();
  for (const relPath of files || []) {
    const match = relPath.match(/^(\.(?:cursor|claude)\/skills\/[^/]+)/);
    if (match) dirs.add(match[1]);
  }
  return dirs;
}

function main() {
  const projectRoot = findProjectRoot();
  const manifestPath = path.join(projectRoot, ".cursor", MANIFEST);
  if (!fs.existsSync(manifestPath)) {
    console.log(`${PACKAGE_NAME}: no manifest found, nothing to uninstall`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const managedFiles = manifest.files || [];

  for (const relPath of managedFiles) {
    if (RULES_FILES.has(relPath)) continue;
    fs.rmSync(path.join(projectRoot, relPath), { recursive: true, force: true });
  }

  for (const relDir of skillDirsFromManifest(managedFiles)) {
    fs.rmSync(path.join(projectRoot, relDir), { recursive: true, force: true });
  }

  for (const name of RULES_FILES) {
    const rulesPath = path.join(projectRoot, name);
    if (!fs.existsSync(rulesPath)) continue;
    fs.writeFileSync(rulesPath, removeRulesBlock(fs.readFileSync(rulesPath, "utf8")));
  }

  fs.rmSync(manifestPath, { force: true });
  console.log(`${PACKAGE_NAME}: uninstalled managed files`);
}

main();
