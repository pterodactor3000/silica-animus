# GitHub Packages AI Toolkit — Plan Brief

> Full plan: `context/changes/github-silica-animus/plan.md`
> Research: `context/changes/github-silica-animus/research.md`

## What & Why

Package silica-animus team AI artifacts — a `code-review` skill, engineering conventions rules, and install/uninstall scripts — as `@pterodactor3000/silica-animus` on GitHub Packages. Consumer repos install via `npm install` and receive managed skills and rules without manual copying.

## Starting Point

Repo has M5L4 specs and config templates under `.cursor/` but zero deliverables at root: no `package.json`, no `skills/`, no `.github/workflows/`. Research confirmed `@pterodactor3000` scope from git remote and package-at-root layout.

## Desired End State

Push to `main` publishes `@pterodactor3000/silica-animus@0.1.0` to GitHub Packages. Consumers add scope registry mapping, install the package, and get `code-review` in both `.cursor/skills/` and `.claude/skills/` plus conventions blocks in `AGENTS.md` and `CLAUDE.md` — idempotent, manifest-tracked, uninstallable.

## Key Decisions Made

| Decision | Choice | Why | Source |
| -------- | ------ | --- | ------ |
| npm scope / package name | `@pterodactor3000/silica-animus` | Matches repo identity; scope from GitHub owner | Plan |
| Package layout | Repo root (not monorepo) | M5L4 default; no workspace structure exists | Research |
| Install targets | Dual Cursor + Claude | User choice; cross-tool consumers supported | Plan |
| Rules content | Full conventions handout | Single source aligned with code-review skill | Plan |
| CI frontmatter validation | Shell grep in workflow | No extra deps; meets full M5L4 spec | Plan |
| Manifest location | `.cursor/.silica-animus-manifest.json` | Package-branded manifest listing all paths including `.claude/*` | Plan |
| Package short name | `silica-animus` (not `ai-toolkit`) | Aligns with repo name; overrides M5L4 lesson placeholder | Plan |
| Delivery path | GitHub Packages only | Change scope; CodeArtifact skills excluded | Research |

## Scope

**In scope:**
- `skills/code-review/SKILL.md` from M5L4 conventions
- `rules/AGENTS.md` (full conventions)
- `package.json`, lockfile, `.npmrc`, README
- Dual-target `install.js` / `uninstall.js`
- `.github/workflows/publish-silica-animus.yml` with shell validation

**Out of scope:**
- AWS CodeArtifact / Terraform
- Consumer preinstall token injection into `package.json`
- Automated unit test suite
- Modifying `.cursor/` lesson skills in publisher repo

## Architecture / Approach

```
silica-animus (publisher)
├── skills/code-review/SKILL.md
├── rules/AGENTS.md
├── package.json → postinstall → install.js
└── .github/workflows/publish-silica-animus.yml → GitHub Packages

consumer repo
npm install @pterodactor3000/silica-animus
  → .cursor/skills/code-review/
  → .claude/skills/code-review/
  → AGENTS.md + CLAUDE.md (sentinel blocks)
  → .cursor/.silica-animus-manifest.json
```

Templates in `.cursor/config-templates/` are adapted (scope, dual paths, AGENTS.md rules source).

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. AI Content Artifacts | `code-review` skill + `rules/AGENTS.md` | Skill too generic vs conventions — must stay actionable |
| 2. Package Shell and Installers | package.json, dual install/uninstall, README | Dual-path manifest drift if paths not all tracked |
| 3. CI/CD Pipeline | validate + publish workflow | First publish needs repo `packages: write` permission |

**Prerequisites:** GitHub repo `pterodactor3000/silica-animus` with Actions enabled; push access to `main`.
**Estimated effort:** ~1 session across 3 phases.

## Open Risks & Assumptions

- GitHub Packages publish assumes package scope matches repo owner (`pterodactor3000`)
- No runtime npm dependencies — install scripts use Node built-ins only
- Consumer CI auth documented in README but not automated via preinstall helper
- First workflow run may need GitHub repo settings for Actions package permissions

## Success Criteria (Summary)

- `npm pack --dry-run` succeeds; tarball contains only specified files
- Install in scratch repo populates dual skill paths and both rules files
- Push to `main` publishes package visible on GitHub Packages
- Re-install is idempotent; uninstall removes managed content cleanly
