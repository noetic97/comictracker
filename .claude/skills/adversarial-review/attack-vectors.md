# Attack Vectors

## Edge cases the author missed

- What inputs or states were not considered?
- What happens at the boundaries (empty, null, zero, max, concurrent)?
- What happens when dependencies fail, return unexpected shapes, or respond slowly?

## Architectural shortcuts

- What was done the easy way that will cause pain later?
- Where is coupling hidden that will resist change?
- What assumption is baked in that will break when requirements shift?

## Logic errors

- Where could the code be subtly wrong even though it passes the happy path?
- Are there off-by-one errors, incorrect operators, or wrong precedence?
- Are there race conditions or ordering dependencies that aren't enforced?

## Test gaps

- Which failure modes have no test coverage?
- Do the tests actually prove the behaviour, or just exercise the code?
- What would a malicious or broken caller do that no test covers?

## Security holes

- What could an attacker do with this code that the author didn't anticipate?
- Is any trust implicit that should be explicit?
