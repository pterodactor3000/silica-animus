#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_NAME = "@pterodactor3000/silica-animus";
const BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const END = `<!-- END ${PACKAGE_NAME} -->`;
const MANIFEST = ".silica-animus-manifest.json";

function readPackageVersion() {
  const pkgPath = path.join(__dirname, "package.json");
  return JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
}

function findProjectRoot() {
  if (process.env.PROJECT_ROOT) return process.env.PROJECT_ROOT;

  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (path.basename(dir) === "node_modules") return path.dirname(dir);
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function copyDir(source, target, installedFiles, root) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name);
    const dst = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dst, installedFiles, root);
    } else {
      fs.copyFileSync(src, dst);
      installedFiles.push(path.relative(root, dst));
    }
  }
}

function installSkills(projectRoot, installedFiles) {
  const source = path.join(__dirname, "skills");
  if (!fs.existsSync(source)) return;

  const targetRoots = [
    path.join(projectRoot, ".cursor", "skills"),
    path.join(projectRoot, ".claude", "skills"),
  ];

  for (const targetRoot of targetRoots) {
    fs.mkdirSync(targetRoot, { recursive: true });

    for (const skill of fs.readdirSync(source, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      const target = path.join(targetRoot, skill.name);
      fs.rmSync(target, { recursive: true, force: true });
      copyDir(path.join(source, skill.name), target, installedFiles, projectRoot);
    }
  }
}

function applyRulesBlock(existing, teamRules) {
  const block = `${BEGIN}\n${teamRules.trim()}\n${END}`;
  const start = existing.indexOf(BEGIN);
  const end = existing.indexOf(END);

  if (start !== -1 && end !== -1 && end > start) {
    return existing.slice(0, start) + block + existing.slice(end + END.length);
  }

  return existing.trimEnd() + "\n\n" + block + "\n";
}

function installRules(projectRoot, installedFiles) {
  const rulesFile = path.join(__dirname, "rules", "AGENTS.md");
  if (!fs.existsSync(rulesFile)) return;

  const teamRules = fs.readFileSync(rulesFile, "utf8");
  const targets = ["AGENTS.md", "CLAUDE.md"];

  for (const name of targets) {
    const target = path.join(projectRoot, name);
    const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    fs.writeFileSync(target, applyRulesBlock(existing, teamRules));
    if (!installedFiles.includes(name)) {
      installedFiles.push(name);
    }
  }
}

function writeManifest(projectRoot, installedFiles) {
  const manifestDir = path.join(projectRoot, ".cursor");
  fs.mkdirSync(manifestDir, { recursive: true });
  fs.writeFileSync(
    path.join(manifestDir, MANIFEST),
    JSON.stringify(
      {
        package: PACKAGE_NAME,
        version: readPackageVersion(),
        installedAt: new Date().toISOString(),
        files: installedFiles,
      },
      null,
      2,
    ) + "\n",
  );
}

function main() {
  const projectRoot = findProjectRoot();
  const installedFiles = [];

  installSkills(projectRoot, installedFiles);
  installRules(projectRoot, installedFiles);
  writeManifest(projectRoot, installedFiles);

  console.log(`${PACKAGE_NAME}: installed ${installedFiles.length} file(s)`);
}

try {
  main();
} catch (error) {
  console.warn(`${PACKAGE_NAME}: postinstall warning: ${error.message}`);
}
