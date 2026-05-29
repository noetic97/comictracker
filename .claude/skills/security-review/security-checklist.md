# Security Checklist

## 1. Input Validation
- Is all external input (user-supplied, environment variables, HTTP requests, file reads) validated at the boundary before use?
- Are there unchecked assumptions about input shape, length, or encoding?

## 2. Secrets Exposure
- Are there hardcoded secrets, tokens, API keys, or passwords anywhere in the diff?
- Could any value be accidentally logged, serialised to a response, or written to a file?
- Are sensitive fields excluded from error messages and stack traces returned to callers?

## 3. Injection Vectors
- SQL injection: is all database input parameterised — never string-concatenated into queries?
- Shell injection: is any user input passed to `exec`, `spawn`, or shell interpolation?
- Path traversal: is any user-supplied path sanitised before use in file operations?
- Prompt injection: if LLM calls are involved, is user content clearly delimited from instructions?

## 4. Auth & Authorisation
- Are authentication checks applied before any sensitive operation?
- Are there IDOR risks — can a user access or modify another user's data by guessing an ID?
- Are privilege escalation paths possible (e.g. role checks missing on state transitions)?

## 5. Dependency Risk
- Are any new dependencies added? Are they pinned to specific versions?
- Are added packages well-maintained and not known to be compromised?
- Note any packages that introduce native bindings or broad filesystem/network access.

## 6. Error Handling & Information Disclosure
- Do error responses leak internal paths, stack traces, database schema, or system details?
- Are errors logged with enough detail internally while exposing minimal detail externally?
