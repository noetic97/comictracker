# Debug Phases

## Phase 1 — Understand

Ask the user to describe the buggy behavior. Clarifying questions to ask (only the relevant ones):

- What is the expected behavior? What is the actual behavior?
- Is this consistently reproducible, or intermittent?
- When did it start? Was anything changed recently?
- What inputs or conditions trigger it?
- Has this ever worked correctly?
- Are there any error messages, stack traces, or console output already visible?

Stop when you have a clear enough picture to instrument the suspected code path.

## Phase 2 — Instrument

Add temporary debug logging before touching any logic.

**Instrument at:**
- Entry to any function in the suspected path (log inputs)
- Decision points: conditionals, early returns, branching logic (log which branch was taken)
- Data transformations (log before and after)
- Boundaries: I/O operations, external calls, database queries (log request and response)
- Exit points (log what is being returned)

**Logging rules:**
- Prefix all debug logs with `[bug-hunter]` so they are easy to find and remove later
- Log the actual values, not just "reached here" — the data is what matters
- Keep instrumentation minimal — only the suspected path, not the whole codebase

## Phase 3 — Hypothesize

Based on log output:
- State what the logs reveal about where behavior diverges from expectation
- Identify the root cause (not just the symptom)
- If multiple hypotheses are plausible, rank them by likelihood and state why

## Phase 4 — Fix

Fix the root cause, not the symptom:
- State what you are changing and why the log evidence points here
- Keep the fix minimal — do not refactor surrounding code unless it is directly causing the bug
- If the fix requires a larger change, surface that explicitly rather than silently expanding scope

## Phase 5 — Clean up

1. Remove all `[bug-hunter]` debug logs
2. Write a regression test that would have caught this bug
3. Note in `.claude/CONTEXT.md` under Known Gotchas if this reveals a systemic issue
