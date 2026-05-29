# Review Rubric

Evaluate against these dimensions in order of priority:

## 1. Correctness
- Does the code do what it's supposed to do?
- Are there edge cases that aren't handled?
- Are there off-by-one errors, null/undefined risks, or type unsafety?

## 2. Functional Purity & FP Conventions
- Are functions pure where they should be?
- Is there any hidden mutation of inputs or shared state?
- Could this be composed more cleanly?
- Are side effects properly isolated to the edges?

## 3. TypeScript Quality
- Is `any` used? Should it be `unknown` with narrowing?
- Are types descriptive and accurate, or just structural noise?
- Are discriminated unions used where state is modelled?

## 4. Tests
- Are the changed/added functions covered?
- Do the tests assert behaviour or implementation details?
- If a test was changed, was the behaviour change intentional and documented?

## 5. Readability & Intent
- Does the code read clearly without comments?
- Are names accurate and consistent with the domain language?
- Is there dead code, commented-out code, or debug logging?

## 6. Architecture & Scope
- Does this change belong in the layer it's in?
- Is it doing too much? Should it be split?
- Does it introduce any unwanted coupling?
