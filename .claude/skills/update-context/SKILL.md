---
name: update-context
description: Refresh .claude/CONTEXT.md with current project state. Use at the end of a session or when focus shifts.
allowed-tools: Read, Write, Bash
model: sonnet
---

# /update-context

Refresh `.claude/CONTEXT.md` to reflect the current state of the project.

## Instructions

Read the current `.claude/CONTEXT.md` first, then ask the following questions one at a time.
Use the answers to rewrite the relevant sections. Do not touch sections the user does not mention.

---

## Questions to ask

1. **Current focus** — What are you actively building right now? What is stable and should not be touched?

2. **Active decisions** — Any decisions made recently that affect how work should proceed? These don't need a full ADR yet — just enough to avoid relitigating them.

3. **In progress** — What work is started but not complete? Include rough percentage or status if known.

4. **Known gotchas** — Anything that will bite Claude if it doesn't know about it? New constraints, legacy quirks, things that broke recently?

5. **Next up** — What is queued after the current focus, in rough priority order?

Skip any question the user says is unchanged or not applicable.

---

## Writing rules

- Rewrite only the sections with new information — preserve everything else verbatim
- Be concise — bullet points, not prose
- If the user's answer is vague, write it as a placeholder comment so it's clear it needs filling in
- Never clear Session Notes unless the user explicitly asks
- After writing, show a diff of every section that will change — old content then new content — and wait for explicit confirmation before writing to the file. Do not save unless the user says yes.
