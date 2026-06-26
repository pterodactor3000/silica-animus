# GitHub Packages AI Toolkit Implementation Plan

## Overview

Scaffold `@pterodactor3000/silica-animus` at the silica-animus repo root: a distributable npm package containing a `rites-of-code-review` Agent Skill, team rules derived from M5L4 conventions, dual-target installers (Cursor + Claude Code), and a GitHub Actions workflow that validates and publishes to GitHub Packages.

## Current State Analysis

The repo is spec + template only. M5L4 prompts and config templates exist under `.cursor/`; no deliverable files at repo root. Research (`context/changes/github-silica-animus/research.md`) mapped all gaps and recommended `@pterodactor3000` scope from `git remote`.

### Key Discoveries:

- `.cursor/config-templates/m5l4-github-packages-*` are the implementation starters — adapt, do not copy verbatim
- `pack-init` / `setup-cicd` skills target CodeArtifact (Model 2) — out of scope
- Install template uses Claude-only paths; this plan implements **dual Cursor + Claude** per planning decision
- `npm ci` in CI requires `package-lock.json`
- Workflow template lacks full spec validation — add shell frontmatter checks

## Desired End State

A consumer repo can:

1. Add `@pterodactor3000:registry=https://npm.pkg.github.com` to `.npmrc` (no token committed)
2. Run `npm install @pterodactor3000/silica-animus`
3. Receive `rites-of-code-review` skill in `.cursor/skills/` and `.claude/skills/`
4. Receive conventions block in `AGENTS.md` and `CLAUDE.md` between sentinel markers
5. See manifest at `.cursor/.silica-animus-manifest.json` tracking all installed paths

Publisher repo (silica-animus):

- Pushes to `main` trigger validate + publish via GitHub Actions
- `npm pack --dry-run` succeeds locally
- Package version `0.1.0` on GitHub Packages

### Verification

- Local: `npm pack --dry-run`, `node install.js` with `PROJECT_ROOT` in a temp dir, workflow YAML syntax valid
- CI: validate job passes on PR; publish job runs on push to `main`
- Manual: install package in a scratch consumer repo, confirm dual paths and sentinel idempotency

## What We're NOT Doing

- AWS CodeArtifact, Terraform, or OIDC AWS roles
- Monorepo `packages/silica-animus/` layout
- Consumer `preinstall` GH_PKG_TOKEN helper in consumer `package.json` (document in README only)
- Replacing or removing existing `.cursor/` lesson skills in the publisher repo
- Publishing to npmjs.org public registry
- Automated tests beyond CI validation steps (no Jest/Mocha suite in v0.1.0)

## Implementation Approach

Greenfield scaffold in dependency order: content artifacts → package shell → installers → CI. Adapt templates from `.cursor/config-templates/`, replacing `@twoj-zespol` → `@pterodactor3000`. Read package version from `package.json` at install time instead of hardcoding.

## Critical Implementation Details

**Dual manifest contract:** Use `.cursor/.silica-animus-manifest.json` as the canonical manifest. It must list every managed relative path including `.claude/skills/*` entries so uninstall can remove both tool trees without guessing.

**Rules source file:** Package ships `rules/AGENTS.md` (per M5L4 pack spec). Installer reads that file and merges identical content into consumer `AGENTS.md` and `CLAUDE.md` using the same `@pterodactor3000/silica-animus` sentinels.

**Non-fatal postinstall:** Top-level try/catch in `install.js` must log warnings only — never `process.exit(1)`.

## Phase 1: AI Content Artifacts

### Overview

Create the distributable skill and rules content that the package publishes.

### Changes Required:

#### 1. Code-review skill

**File**: `skills/rites-of-code-review/SKILL.md`

**Intent**: Generate the M5L4 code-review Agent Skill from `m5l4-shared-conventions.md`, implementing all six review categories with severity-ordered output and a final APPROVE / REQUEST CHANGES / NEEDS DISCUSSION verdict.

**Contract**: YAML frontmatter with `name: rites-of-code-review` and `description: Review code changes against team engineering conventions, testing standards and security expectations.` Trigger phrases: "review code", "check this PR", "review my changes", "code review". Body sections for Naming, Error handling, TypeScript, Function design, Security, Testing — each with concrete checks derived from the conventions handout, not invented rules. Skill title line uses `// [rites-of-code-review INVOKED] :: <by-whom-if-data-available> //`; output section headers use `// [<header>] //`.

#### 2. Team rules bundle

**File**: `rules/AGENTS.md`

**Intent**: Ship the full engineering conventions handout as the managed rules block consumers receive in AGENTS.md and CLAUDE.md.

**Contract**: Content adapted from `.cursor/prompts/m5l4-shared-conventions.md` (all six categories). Markdown suitable for sentinel wrapping — no YAML frontmatter required in the rules file itself.

### Success Criteria:

#### Automated Verification:

- `test -f skills/rites-of-code-review/SKILL.md`
- `test -f rules/AGENTS.md`
- `grep -q '^name: rites-of-code-review' skills/rites-of-code-review/SKILL.md`
- `grep -q '^description:' skills/rites-of-code-review/SKILL.md`

#### Manual Verification:

- Skill reads as actionable review instructions, not a copy-paste of conventions without review workflow
- Rules file covers all six convention categories from the handout

**Implementation Note**: Pause for human confirmation after manual checks before Phase 2.

---

## Phase 2: Package Shell and Installers

### Overview

Create the npm package manifest, lockfile, publisher `.npmrc`, package README, and dual-target install/uninstall scripts.

### Changes Required:

#### 1. Package manifest

**File**: `package.json`

**Intent**: Define `@pterodactor3000/silica-animus@0.1.0` as a GitHub Packages publishable package with correct `files`, `postinstall`, and `bin` entry.

**Contract**: `name`, `version`, `publishConfig.registry`, `files` array (`skills/`, `rules/`, `install.js`, `uninstall.js`, `README.md`), `scripts.postinstall`, `engines.node >=20`, `bin.silica-animus` → `./install.js`. Adapt from `.cursor/config-templates/m5l4-github-packages-package.json.template` (replace `@twoj-zespol/ai-toolkit` with `@pterodactor3000/silica-animus`, `bin.silica-animus`).

#### 2. Lockfile

**File**: `package-lock.json`

**Intent**: Enable `npm ci` in GitHub Actions.

**Contract**: Generated by `npm install` at repo root with no runtime dependencies beyond Node built-ins used by install scripts. Must be committed to version control (`git add package-lock.json`) — `npm ci` in CI will fail without it.

#### 3. Publisher registry mapping

**File**: `.npmrc`

**Intent**: Map `@pterodactor3000` scope to GitHub Packages for local publish/dev. No auth token committed.

**Contract**: Single line `@pterodactor3000:registry=https://npm.pkg.github.com` per consumer template pattern.

#### 4. Package README

**File**: `README.md` (expand existing README)

**Intent**: Preserve the existing project tagline ("Abominable intelligence for cogitation purposes across machine spirits"); add npm package documentation below it covering package purpose, consumer setup (`npm login` / user `.npmrc`), CI auth via `GH_PKG_TOKEN`, dual-tool install behavior, and manual `npx @pterodactor3000/silica-animus` usage.

**Contract**: Sections for install, auth, uninstall, and what gets installed where. Link to GitHub Packages docs. No secrets in examples.

#### 5. Dual-target installer

**File**: `install.js`

**Intent**: On postinstall, copy skills to `.cursor/skills/` and `.claude/skills/`, merge rules into `AGENTS.md` and `CLAUDE.md`, write manifest to `.cursor/.silica-animus-manifest.json`.

**Contract**: `PACKAGE_NAME = "@pterodactor3000/silica-animus"`. `MANIFEST = ".silica-animus-manifest.json"`. Read version from adjacent `package.json`. Sentinels `<!-- BEGIN @pterodactor3000/silica-animus -->` / `<!-- END ... -->`. Idempotent sentinel replacement. Manifest `files` array includes all managed paths. Non-fatal top-level catch.

#### 6. Dual-target uninstaller

**File**: `uninstall.js`

**Intent**: Read manifest, remove tracked skill dirs, strip sentinel blocks from both `AGENTS.md` and `CLAUDE.md`, delete manifest.

**Contract**: Skip missing files gracefully. Handle `AGENTS.md` and `CLAUDE.md` separately with same sentinel markers. Do not remove untracked user content outside the manifest.

### Success Criteria:

#### Automated Verification:

- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`
- `npm pack --dry-run` lists `skills/`, `rules/`, `install.js`, `uninstall.js`, `README.md`, and `package.json` (npm always includes `package.json` in every tarball regardless of the `files` array)
- `node --check install.js && node --check uninstall.js`

#### Manual Verification:

- `PROJECT_ROOT=/tmp/silica-animus-test node install.js` installs to both `.cursor/skills/rites-of-code-review/` and `.claude/skills/rites-of-code-review/`
- Re-running install updates sentinels without duplication
- `PROJECT_ROOT=/tmp/silica-animus-test node uninstall.js` cleans managed files

**Implementation Note**: Pause for human confirmation after manual install/uninstall smoke test before Phase 3.

---

## Phase 3: CI/CD Pipeline

### Overview

Add GitHub Actions workflow with full M5L4 validation and publish to GitHub Packages on push to `main`.

### Changes Required:

#### 1. Publish workflow

**File**: `.github/workflows/publish-silica-animus.yml`

**Intent**: Validate package on PR and push; publish on push to `main`/`master` only.

**Contract**: Adapt from `.cursor/config-templates/m5l4-github-packages-publish-ai-toolkit.yml.template` (output as `publish-silica-animus.yml`) with scope `@pterodactor3000`. Permissions `contents: read`, `packages: write`. Node 20. Validate job steps:

1. `npm ci`
2. Verify `package.json` has `name`, `version`, `publishConfig.registry`:
   `node -e "const p=require('./package.json'); ['name','version'].forEach(k=>{if(!p[k])throw new Error(k+' missing')}); if(!p.publishConfig?.registry)throw new Error('publishConfig.registry missing')"`
3. `test -f skills/rites-of-code-review/SKILL.md`
4. Verify frontmatter `name: rites-of-code-review` and `description:` present (shell grep)
5. Verify frontmatter `name` matches directory `rites-of-code-review` (shell)
6. `npm pack --dry-run`

Publish job: `npm publish` with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`, `if: github.event_name == 'push'`.

### Success Criteria:

#### Automated Verification:

- `test -f .github/workflows/publish-silica-animus.yml`
- `grep -q 'packages: write' .github/workflows/publish-silica-animus.yml`
- `grep -q '@pterodactor3000' .github/workflows/publish-silica-animus.yml`
- `grep -q 'npm pack --dry-run' .github/workflows/publish-silica-animus.yml`

#### Manual Verification:

- Workflow YAML is valid (GitHub Actions tab or `actionlint` if available)
- After merge to `main`, package appears at `https://github.com/pterodactor3000/silica-animus/packages`

**Implementation Note**: Pause for human confirmation after first successful publish or dry-run on PR before considering change complete.

---

## Testing Strategy

### Unit Tests:

Not in scope for v0.1.0 — validation is CI shell checks + manual smoke tests.

### Integration Tests:

- `npm pack --dry-run` end-to-end
- Install/uninstall cycle in temp directory with `PROJECT_ROOT`

### Manual Testing Steps:

1. Clone scratch repo, add consumer `.npmrc` with scope mapping
2. `npm install` from local tarball (`npm pack` + `npm install ./pterodactor3000-silica-animus-0.1.0.tgz`)
3. Verify `.cursor/skills/rites-of-code-review/SKILL.md` and `.claude/skills/rites-of-code-review/SKILL.md` exist
4. Verify sentinel blocks in `AGENTS.md` and `CLAUDE.md`
5. Re-run install — no duplicate blocks
6. Run uninstall — managed files removed, sentinels stripped

## Performance Considerations

None — small static file copy on postinstall. No network calls in installer.

## Migration Notes

Greenfield — no migration. Existing `.cursor/` lesson content in publisher repo is untouched; package installs into consumer repos, not into silica-animus itself during development.

## References

- Research: `context/changes/github-silica-animus/research.md`
- Change: `context/changes/github-silica-animus/change.md`
- `.cursor/prompts/m5l4-shared-conventions.md`
- `.cursor/prompts/m5l4-shared-spec-skill.md`
- `.cursor/prompts/m5l4-github-packages-spec-pack.md`
- `.cursor/prompts/m5l4-github-packages-spec-cicd.md`
- `.cursor/config-templates/m5l4-github-packages-*.template`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: AI Content Artifacts

#### Automated

- [x] 1.1 `test -f skills/rites-of-code-review/SKILL.md` — 9e30ddc
- [x] 1.2 `test -f rules/AGENTS.md` — 9e30ddc
- [x] 1.3 `grep -q '^name: rites-of-code-review' skills/rites-of-code-review/SKILL.md` — 9e30ddc
- [x] 1.4 `grep -q '^description:' skills/rites-of-code-review/SKILL.md` — 9e30ddc

#### Manual

- [x] 1.5 Skill reads as actionable review instructions — 9e30ddc
- [x] 1.6 Rules file covers all six convention categories — 9e30ddc

### Phase 2: Package Shell and Installers

#### Automated

- [x] 2.1 `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`
- [x] 2.2 `npm pack --dry-run` lists only expected files
- [x] 2.3 `node --check install.js && node --check uninstall.js`

#### Manual

- [x] 2.4 Dual-path install smoke test in temp directory
- [x] 2.5 Re-run install idempotency check
- [x] 2.6 Uninstall cleans managed files

### Phase 3: CI/CD Pipeline

#### Automated

- [ ] 3.1 `test -f .github/workflows/publish-silica-animus.yml`
- [ ] 3.2 `grep -q 'packages: write' .github/workflows/publish-silica-animus.yml`
- [ ] 3.3 `grep -q '@pterodactor3000' .github/workflows/publish-silica-animus.yml`
- [ ] 3.4 `grep -q 'npm pack --dry-run' .github/workflows/publish-silica-animus.yml`

#### Manual

- [ ] 3.5 Workflow YAML valid in GitHub Actions
- [ ] 3.6 Package visible on GitHub Packages after push to main
