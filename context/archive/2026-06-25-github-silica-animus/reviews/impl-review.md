<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: GitHub Packages AI Toolkit Implementation Plan

- **Plan**: context/changes/github-silica-animus/plan.md
- **Scope**: Full plan (Phases 1–3)
- **Date**: 2026-06-26
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | WARNING |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — Postinstall artifacts committed in publisher repo

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Scope Discipline
- **Location**: dc6d141 — `AGENTS.md`, `CLAUDE.md`, `.cursor/`, `.claude/`
- **Detail**: Commit `dc6d141` tracks consumer install output at the publisher repo root: sentinel-wrapped `AGENTS.md`/`CLAUDE.md`, `.cursor/.silica-animus-manifest.json`, and duplicate skill copies under `.cursor/skills/` and `.claude/skills/`. Plan Migration Notes state the package installs into consumer repos; publisher `.cursor/` lesson skills should remain untouched. Package source of truth is `skills/` and `rules/` at repo root (from Phase 1). Running `npm install` at publisher root created these paths; committing them blurs publisher vs consumer boundaries and duplicates `skills/rites-of-code-review/`.
- **Fix A ⭐ Recommended**: Remove tracked postinstall paths from git (`git rm --cached`), add `.gitignore` entries for `AGENTS.md`, `CLAUDE.md`, `.cursor/.silica-animus-manifest.json`, and installed skill copies under `.cursor/skills/rites-of-*` / `.claude/skills/rites-of-*` if not dogfooding intentionally.
  - Strength: Restores clean publisher/consumer separation aligned with plan intent.
  - Tradeoff: Publisher repo no longer dogfoods installed paths in git (local postinstall still works).
  - Confidence: HIGH — matches plan Migration Notes.
  - Blind spot: Team may want committed dogfooding for demo purposes.
- **Fix B**: Document intentional dogfooding in README/plan and keep committed paths
  - Strength: Preserves current layout; agents see installed layout in-repo.
  - Tradeoff: Duplication and merge noise on every package bump/reinstall.
  - Confidence: MEDIUM — viable if documented explicitly.
  - Blind spot: Future installs may drift from committed copies silently.
- **Decision**: FIXED via Fix A

### F2 — Unrelated context scaffolding bundled with workflow commit

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: dc6d141 — `context/archive/README.md`, `context/changes/README.md`, `context/foundation/README.md`
- **Detail**: Phase 3 deliverable was `.github/workflows/publish-silica-animus.yml`. Same commit added universal context directory README stubs not listed in any phase's Changes Required.
- **Fix**: Move to separate commit or leave as-is if accepted as repo bootstrap; avoid bundling with feature commits going forward.
- **Decision**: SKIPPED

### F3 — Skill entry invocation banner omitted

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: skills/rites-of-code-review/SKILL.md:7
- **Detail**: Plan Phase 1 contract documents `// [rites-of-code-review INVOKED] :: ... //` entry banner. Shipped skill uses output-format headers only; Phase 1 triage explicitly skipped entry banner per user preference.
- **Fix**: No action required if output-only pattern is the team standard; otherwise add entry banner.
- **Decision**: SKIPPED

### F4 — LICENSE auto-included in npm tarball

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: npm pack output
- **Detail**: Tarball includes root `LICENSE` beyond `package.json` `files` array. All planned artifacts present. npm default behavior; skipped in Phase 2 triage.
- **Fix**: Accept npm default.
- **Decision**: SKIPPED

### F5 — No publisher .gitignore for install side effects

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Architecture
- **Location**: repo root (missing `.gitignore`)
- **Detail**: `npm install` at publisher root runs postinstall and recreates tracked install artifacts. Without `.gitignore`, future reinstalls risk dirty working tree or accidental re-commit of consumer paths.
- **Fix**: Add `.gitignore` covering postinstall outputs (fold into F1 Fix A).
- **Decision**: FIXED via Fix A (folded into F1)
