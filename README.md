# silica-animus

Abominable intelligence for cogitation purposes across machine spirits

## npm package

`@pterodactor3000/silica-animus` distributes team AI artifacts — Agent Skills and engineering conventions — to consumer repositories through [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

### What gets installed

On `npm install`, the postinstall script copies managed content into your project:

| Artifact | Cursor | Claude Code |
| -------- | ------ | ----------- |
| Skills | `.cursor/skills/<skill-name>/` | `.claude/skills/<skill-name>/` |
| Conventions | sentinel block in `AGENTS.md` | sentinel block in `CLAUDE.md` |
| Manifest | `.cursor/.silica-animus-manifest.json` | (listed in manifest) |

Current skills: `rites-of-code-review`.

Sentinel markers:

```html
<!-- BEGIN @pterodactor3000/silica-animus -->
<!-- END @pterodactor3000/silica-animus -->
```

Re-running install replaces managed blocks idempotently — no duplication.

### Consumer setup

1. Add scope mapping to the consumer repo `.npmrc` (no token in git):

   ```ini
   @pterodactor3000:registry=https://npm.pkg.github.com
   ```

2. Authenticate locally with `npm login` (or a user-level `~/.npmrc` token).

3. Install:

   ```bash
   npm install @pterodactor3000/silica-animus
   ```

### CI authentication

In GitHub Actions (or other CI), set `GH_PKG_TOKEN` to a PAT or `GITHUB_TOKEN` with `read:packages`. Configure npm before install:

```bash
echo "//npm.pkg.github.com/:_authToken=${GH_PKG_TOKEN}" >> .npmrc
npm install @pterodactor3000/silica-animus
```

Never commit `_authToken` to the repository.

### Manual install / reinstall

From a consumer project root:

```bash
npx @pterodactor3000/silica-animus
```

Or run the installer directly:

```bash
node node_modules/@pterodactor3000/silica-animus/install.js
```

### Uninstall

```bash
PROJECT_ROOT=/path/to/your/project node node_modules/@pterodactor3000/silica-animus/uninstall.js
```

Removes tracked skill directories, strips sentinel blocks from `AGENTS.md` and `CLAUDE.md`, and deletes `.cursor/.silica-animus-manifest.json`. User content outside the manifest is untouched.

### Publisher registry (this repo)

Local publish/dev uses `.npmrc`:

```ini
@pterodactor3000:registry=https://npm.pkg.github.com
```

Authenticate with `npm login` before `npm publish`.
