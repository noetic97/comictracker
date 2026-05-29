#!/bin/bash
# PostToolUse hook: run tests after Write or Edit tool calls.
# Guards: only fires if (a) bun is available, (b) package.json has a test script,
# and (c) test files exist. This prevents noisy runs during scaffolding.

if ! command -v bun &> /dev/null; then exit 0; fi
if [ ! -f package.json ]; then exit 0; fi
if ! grep -q '"test"' package.json; then exit 0; fi
if ! find . -name "*.test.ts" -not -path "*/node_modules/*" -not -path "*/.claude/*" | grep -q .; then exit 0; fi

echo "[hook] Running tests after file write..."
bun test --bail 2>&1 | tail -20
