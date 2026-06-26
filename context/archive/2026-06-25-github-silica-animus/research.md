---
date: 2026-06-25T18:58:18+02:00
researcher: Composer
git_commit: de2e90722193e19c05466e7eb45da64683082f72
branch: main
repository: silica-animus
topic: "Package code-review skill, npm installer, and GitHub Actions publish pipeline"
tags: [research, codebase, github-packages, silica-animus, code-review, m5l4]
status: complete
last_updated: 2026-06-25
last_updated_by: Composer
---

# Research: Package code-review skill, npm installer, and GitHub Actions publish pipeline

**Date**: 2026-06-25T18:58:18+02:00
**Researcher**: Composer
**Git Commit**: de2e90722193e19c05466e7eb45da64683082f72
**Branch**: main
**Repository**: silica-animus

## Research Question

What exists in the silica-animus repository today, and what must be built to deliver a GitHub Packages AI toolkit (`code-review` skill, npm installer/uninstaller, and GitHub Actions publish pipeline) per the M5L4 lesson specs?

## Summary

> **Naming note (2026-06-25):** Planning superseded research recommendation of `@pterodactor3000/ai-toolkit`. Package short name is **`silica-animus`** — full name `@pterodactor3000/silica-animus`, manifest `.silica-animus-manifest.json`, workflow `publish-silica-animus.yml`.

The repo is at **spec + template stage only**. No deliverable artifacts exist yet — no `package.json`, no `skills/code-review/SKILL.md`, no `.github/workflows/`, no installer scripts at repo root. Lesson material is present under `.cursor/prompts/` and `.cursor/config-templates/` (applied 2026-06-25 per `.cursor/.10x-cli-manifest.json`).

Implementation is a greenfield scaffold from templates with these key decisions:

1. **Package name**: `@pterodactor3000/silica-animus` (scope from `git remote` owner; short name matches repo)
2. **Layout**: package-at-root (M5L4 GitHub Packages default); no monorepo structure exists.
3. **Target paths**: adapt install templates from `.claude/` + `CLAUDE.md` to `.cursor/skills/` + `AGENTS.md` to match spec and this repo's Cursor-first tooling.
4. **CI gaps**: workflow template needs frontmatter validation steps from the full spec.
5. **Existing 10x skills** (`pack-init`, `setup-cicd`) target the CodeArtifact path — do not use them verbatim for this change.

## Detailed Findings

### Repository baseline

The repo root is minimal:

- `README.md` — project title only, no package metadata
- `LICENSE` — MIT, copyright individual (Mikołaj Grygorcewicz)
- `.cursor/` — lesson skills, prompts, config templates
- `context/` — 10x change tracking (this change at `context/changes/github-silica-animus/`)

No application code, no `package.json`, no `.github/` directory.

### Change status

`context/changes/github-silica-animus/change.md` exists with `status: new`. No `plan.md`, `frame.md`, or prior research until this document.

### M5L4 specs (requirements source of truth)

| Spec file | Defines |
|-----------|---------|
| `.cursor/prompts/m5l4-shared-conventions.md` | Six review categories: Naming, Error handling, TypeScript, Functions, Security, Testing |
| `.cursor/prompts/m5l4-shared-spec-skill.md` | `skills/code-review/SKILL.md` with frontmatter, trigger phrases, severity output, APPROVE/REQUEST CHANGES/NEEDS DISCUSSION |
| `.cursor/prompts/m5l4-github-packages-spec-pack.md` | Package layout, `package.json` shape, installer idempotency, AGENTS.md sentinels, consumer `.npmrc` |
| `.cursor/prompts/m5l4-github-packages-spec-cicd.md` | `.github/workflows/publish-ai-toolkit.yml`, validation rules, GITHUB_TOKEN publish |

### Config templates (implementation starters)

Five templates in `.cursor/config-templates/` map directly to deliverables:

| Template | Purpose |
|----------|---------|
| `m5l4-github-packages-package.json.template` | Package manifest with `postinstall`, `files`, `publishConfig` |
| `m5l4-github-packages-install.js.template` | Project-root discovery, skill copy, sentinel-based rules merge, manifest |
| `m5l4-github-packages-uninstall.js.template` | Manifest-driven cleanup |
| `m5l4-github-packages-publish-ai-toolkit.yml.template` | Validate + publish workflow |
| `m5l4-github-packages-consumer.npmrc.template` | Consumer registry mapping (no token) |

### Gap matrix: EXISTS vs MISSING

| Artifact | Status |
|----------|--------|
| `skills/code-review/SKILL.md` | **MISSING** |
| `rules/AGENTS.md` | **MISSING** |
| `package.json` | **MISSING** |
| `package-lock.json` | **MISSING** (required for `npm ci` in workflow) |
| `install.js` / `uninstall.js` | **MISSING** |
| `README.md` (package) | **MISSING** (root README exists but is not package docs) |
| `.github/workflows/publish-silica-animus.yml` | **MISSING** |
| `.npmrc` (publisher/consumer) | **MISSING** |

### Package naming and layout

**Git remote**: `https://github.com/pterodactor3000/silica-animus.git`

| Placeholder | Recommended value |
|-------------|-------------------|
| npm scope | `@pterodactor3000` |
| Package name | `@pterodactor3000/silica-animus` |
| Consumer `.npmrc` | `@pterodactor3000:registry=https://npm.pkg.github.com` |
| Layout | **Package-at-root** per M5L4 GitHub spec |

Do not use `@silica-animus` as scope — GitHub Packages requires scope to match the GitHub user/org owner.

### Template vs spec mismatches (must resolve during implementation)

1. **Rules target file**: spec says `rules/AGENTS.md` → consumer `AGENTS.md`; install template uses `rules/CLAUDE.md` → consumer `CLAUDE.md` (`.cursor/config-templates/m5l4-github-packages-install.js.template:64-72`).

2. **Skills install path**: template copies to `.claude/skills/`; this repo and Cursor consumers use `.cursor/skills/` (`.cursor/config-templates/m5l4-github-packages-install.js.template:41`).

3. **Manifest location**: template writes `.claude/.ai-toolkit-manifest.json`; should align with chosen AI config dir (`.cursor/config-templates/m5l4-github-packages-install.js.template:76-79`).

4. **Version duplication**: `install.js` hardcodes `PACKAGE_VERSION = "0.1.0"` — should read from `package.json` at runtime.

5. **CI validation gaps**: workflow template only checks `test -f skills/code-review/SKILL.md`; full spec also requires frontmatter `name`/`description` validation and explicit `package.json` field checks (`.cursor/prompts/m5l4-github-packages-spec-cicd.md:33-38`).

6. **Optional preinstall auth**: spec allows GH_PKG_TOKEN preinstall helper for consumer CI — not in templates.

### Related skills (reference only, not deliverables)

| Skill | Path | Relevance |
|-------|------|-----------|
| `pack-init` | `.cursor/skills/pack-init/SKILL.md` | CodeArtifact / `packages/ai-toolkit/` path — wrong delivery model |
| `setup-cicd` | `.cursor/skills/setup-cicd/SKILL.md` | AWS OIDC + CodeArtifact — wrong delivery model |
| `10x-impl-review` | `.cursor/skills/10x-impl-review/SKILL.md` | Reviews plan implementation, not team code conventions |
| `10x-rule-review` | `.cursor/skills/10x-rule-review/SKILL.md` | Scores AGENTS.md files — different purpose |
| `10x-agents-md` | `.cursor/skills/10x-agents-md/SKILL.md` | Could inform `rules/AGENTS.md` content |

### code-review skill content requirements

From `m5l4-shared-spec-skill.md`, the skill must:

- Live at `skills/code-review/SKILL.md`
- Frontmatter: `name: code-review`, description per spec
- Trigger on: "review code", "check this PR", "review my changes", "code review"
- Review against six categories from `m5l4-shared-conventions.md`
- Output: Critical → Warning → Suggestion with `file:line` references
- Final verdict: `APPROVE`, `REQUEST CHANGES`, or `NEEDS DISCUSSION`
- Must not invent standards beyond the conventions handout

## Code References

- `context/changes/github-silica-animus/change.md:1-12` — change identity and intent
- `.cursor/prompts/m5l4-shared-conventions.md:7-43` — convention categories for skill content
- `.cursor/prompts/m5l4-shared-spec-skill.md:13-40` — code-review skill requirements
- `.cursor/prompts/m5l4-github-packages-spec-pack.md:22-96` — package structure and installer behavior
- `.cursor/prompts/m5l4-github-packages-spec-cicd.md:12-90` — CI/CD workflow requirements
- `.cursor/config-templates/m5l4-github-packages-package.json.template:1-26` — package.json starter
- `.cursor/config-templates/m5l4-github-packages-install.js.template:6-108` — installer logic (needs path adaptation)
- `.cursor/config-templates/m5l4-github-packages-uninstall.js.template:6-41` — uninstaller logic
- `.cursor/config-templates/m5l4-github-packages-publish-ai-toolkit.yml.template:1-47` — workflow starter
- `.cursor/config-templates/m5l4-github-packages-consumer.npmrc.template:1` — consumer registry line
- `.cursor/skills/pack-init/SKILL.md:10-51` — CodeArtifact alternative (not applicable)
- `.cursor/skills/setup-cicd/SKILL.md:3-35` — CodeArtifact CI alternative (not applicable)
- `README.md:1-2` — repo identity only
- `.cursor/.10x-cli-manifest.json` — m5l4 templates applied 2026-06-25

## Architecture Insights

1. **Dual delivery paths in lesson**: Model 1 (GitHub Packages, this change) vs Model 2 (CodeArtifact + Terraform). Repo ships both prompt sets; this change follows the GitHub Packages path exclusively.

2. **Template-driven scaffold**: Implementation should copy/adapt `.cursor/config-templates/m5l4-github-packages-*` to repo root, replacing `@twoj-zespol` → `@pterodactor3000` and fixing path mismatches.

3. **Single-purpose repo**: No monorepo signals (no workspaces, no `packages/`). Package-at-root keeps CI simple — workflow runs from repo root without `working-directory`.

4. **Idempotent install contract**: Sentinel markers (`<!-- BEGIN @pterodactor3000/silica-animus -->` / `<!-- END ... -->`) + `.silica-animus-manifest.json` enable safe re-install and uninstall without guessing paths.

5. **Non-fatal postinstall**: Installer catches errors and warns — consumer `npm install` must not fail on postinstall issues (spec requirement).

## Historical Context (from prior changes)

No archived or sibling changes exist. This is the first change in `context/changes/`. Foundation docs are scaffold-only (`context/foundation/README.md`).

## Related Research

None — first research artifact in this repo.

## Open Questions

1. **Rules content**: Should `rules/AGENTS.md` mirror `m5l4-shared-conventions.md` verbatim, or be a condensed agent-onboarding doc? Spec requires the file; content shape is team choice.

2. **Multi-tool support**: Should installer support both `.cursor/` and `.claude/` paths, or Cursor-only for silica-animus?

3. **Package README**: What consumer setup docs to include (auth via `npm login`, `GH_PKG_TOKEN` for CI, manual `npx @pterodactor3000/silica-animus` usage)?

4. **Validation script**: Add explicit CI steps for frontmatter validation (shell + grep/yq) or a small Node validation script?

5. **Publisher `.npmrc`**: Does this repo need a committed `.npmrc` with scope mapping, or only consumer repos?
