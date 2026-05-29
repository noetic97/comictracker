---
name: init-project
description: Scan the repo to fill in empty sections of .claude/CLAUDE.md. Use once when bootstrapping a new project, or re-run when stale.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# /init-project

Populate the empty sections of `.claude/CLAUDE.md` by scanning the codebase, then asking targeted questions only for what code alone can't answer.

## Instructions

Work in three phases: **Scan**, **Interview**, **Write**. Do not write anything to disk until Phase 3 is complete and the user has confirmed.

---

## Phase 1 — Scan

Read `.claude/CLAUDE.md` and identify every section that is empty or contains only `<!-- TODO` comments or placeholder HTML comments. These are your targets. Sections with real content should be left alone — do not propose changes to them.

Then run the scans below to draft fills for each target section. Adapt based on what's actually present in the project — not every project has every artifact.

### Architecture

```bash
find . -maxdepth 3 -type d \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/coverage/*' \
  -not -path '*/.vite/*' \
  | sort
```

Read the top-level directories and a few key entry-point files (e.g. `server/index.ts`, `client/src/main.tsx`) to understand the layering. Draft a concise directory map with one-line descriptions of each layer's responsibility. Focus on the architectural split — not every subdirectory needs a line.

### Key Data Models

Look for the primary schema or type definitions:

```bash
find . -name "schema.prisma" -not -path '*/node_modules/*'
find . -path '*/types/*.ts' -not -path '*/node_modules/*'
find . -path '*/models/*.ts' -not -path '*/node_modules/*'
```

Read the schema file(s) and/or shared type files. Draft a summary of each core domain model: its name, key fields (skip `id`, `createdAt`, `updatedAt`), and relationships. Keep it scannable — this is a reference, not a transcript of the schema.

### Other key dependencies

```bash
cat package.json
```

Also check workspace sub-packages if the project is a monorepo. List significant runtime dependencies — the ones that represent architectural choices (ORM, HTTP framework, UI library, utility libraries). Skip obvious defaults (TypeScript, Prettier, ESLint, testing framework, Vite) — those are already documented in the global CLAUDE.md.

### External Integrations

```bash
cat .env.example
```

Also grep for outbound HTTP calls and external service clients:

```bash
grep -r "fetch(" api/ server/ --include="*.ts" -l 2>/dev/null
grep -r "fetch(" api/ server/ --include="*.ts" | grep -v "node_modules" | head -20
```

For each integration found: service name, what it's used for, whether it's optional (i.e. the app works without it).

### Security Posture

**Auth mechanism** — look for auth middleware and session handling:

```bash
grep -r "jwt\|session\|cookie\|passport\|bearer\|Authorization" \
  server/ api/ --include="*.ts" -l 2>/dev/null
```

If nothing is found, the auth mechanism is "none (single-tenant, no login required)" — note that explicitly rather than leaving it blank.

**Input trust boundary** — identify where untrusted input enters the system. Typically the route handlers:

```bash
find . \( -path '*/routes/*.ts' -o -path '*/handlers/*.ts' \) \
  -not -path '*/node_modules/*'
```

Note the layer name and path pattern where external requests arrive.

**Secret management** — check `.env.example` and how secrets are consumed:

```bash
grep -r "process\.env\." server/ api/ --include="*.ts" -h 2>/dev/null \
  | grep -oP 'process\.env\.\w+' | sort -u
```

Note whether secrets are consumed via `process.env` directly, a config module, or a secrets manager.

### Protected paths

From the directory scan and schema scan, identify files or directories that should never be modified without explicit instruction. The migration directory is likely already listed — look for additional candidates: generated files, vendored code, lock files, deploy configs.

---

## Phase 2 — Interview

For sections where the scan couldn't produce confident content, ask targeted questions. Ask one at a time. Stop when all gaps are closed.

Common gaps — check whether the scan already answered each before asking:

**Domain Language** — code rarely makes vocabulary choices explicit. Ask:
> "What are the key terms I should use consistently in this project? For example: is it 'comic' or 'issue'? Is 'pull list' a purchase intent list, a subscription tracker, something else? Any terms that have a specific meaning here that differs from the casual usage?"

**Conventions & Exceptions** — ask only if the codebase shows patterns that deviate from the global CLAUDE.md (e.g. classes in use, non-standard file layout). Ask:
> "Are there places in this project where you've knowingly bent the global CLAUDE.md rules — classes used for a specific reason, a naming convention that differs, something the ORM or framework forced? Anything you want me to know about before I start writing code?"

Do not ask about things the scan already answered. Do not ask generic "is there anything else?" questions.

---

## Phase 3 — Write

Show all proposed changes at once before touching the file. Format each changed section as:

```
### <Section Name>
BEFORE:
<current placeholder content>

AFTER:
<proposed content>
```

Then ask: "Confirm to write these changes, or tell me which sections to revise."

Wait for explicit confirmation.

On confirmation:
- Use Edit to replace only the targeted placeholder content in each approved section
- Do not touch sections the user did not approve
- Do not reformat or rewrite surrounding content
- Do not add new sections that aren't already in the file
- After writing, report which sections were updated
