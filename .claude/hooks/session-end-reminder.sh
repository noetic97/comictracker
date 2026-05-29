#!/bin/bash
# Stop hook: remind user to run /update-context when a session made meaningful changes.
# Fires after every model turn — guards suppress noise on clean or already-updated sessions.

if ! git rev-parse --git-dir > /dev/null 2>&1; then exit 0; fi

if git diff --name-only 2>/dev/null | grep -q "CONTEXT.md"; then exit 0; fi
if git diff --cached --name-only 2>/dev/null | grep -q "CONTEXT.md"; then exit 0; fi

if git diff --quiet && git diff --cached --quiet; then exit 0; fi

echo ""
echo "─────────────────────────────────────────"
echo "  Changes made this session. If focus"
echo "  shifted or decisions landed, run"
echo "  /update-context before closing."
echo "─────────────────────────────────────────"
echo ""
