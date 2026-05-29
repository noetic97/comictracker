---
name: adr
description: Create an Architecture Decision Record for a technical decision. Use when making or documenting a significant architectural choice.
allowed-tools: Read, Write, Bash
model: sonnet
---

# /adr

Create an Architecture Decision Record (ADR) for a technical decision.

## Instructions

Ask me for the following if not already provided:
1. **Decision title** — short noun phrase (e.g. "Use Drizzle over Prisma")
2. **Context** — what situation or problem forced this decision?
3. **Options considered** — what alternatives were on the table?
4. **Decision** — what did we choose?
5. **Rationale** — why this option over the others?
6. **Consequences** — what does this make easier? harder? what are we accepting?

If I give you a rough brain-dump, extract the structure from it — don't make me repeat myself in a form.

## Output Format

Create the file at `docs/adr/{{NNN}}-{{kebab-case-title}}.md` where NNN is the next sequential number.
If the `docs/adr/` directory doesn't exist, create it.

```markdown
# ADR-{{NNN}}: {{Title}}

**Date:** {{YYYY-MM-DD}}
**Status:** Accepted

## Context

{{Why this decision needed to be made}}

## Options Considered

### Option A: {{Name}}
{{Description}}
**Pros:** ...
**Cons:** ...

### Option B: {{Name}}
{{Description}}
**Pros:** ...
**Cons:** ...

## Decision

{{What we chose and a one-line summary of why}}

## Rationale

{{Detailed reasoning — what tipped the scales}}

## Consequences

**Easier:** {{what this unlocks}}
**Harder:** {{what this complicates}}
**Accepted tradeoffs:** {{what we're consciously living with}}
```

## Rules

- Be direct and specific — no vague language like "it's better" or "more scalable"
- Consequences must include at least one thing that becomes harder — no decision is free
- Status options: `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-NNN`
