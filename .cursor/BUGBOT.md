# Bugbot rules for this repository
# Aligns Cursor Bugbot with DevX AI Review: flag real bugs, not style nits.
# Docs: https://cursor.com/docs/bugbot

## Always flag
- Hardcoded secrets, API keys, tokens, or credentials in source
- SQL/command injection via string concatenation of user input
- Missing auth on routes/handlers that create, update, or delete data
- Unvalidated user input used in queries, shell, HTML, or redirects
- Secrets, tokens, or PII written to logs or client-visible responses
- Server-only env vars or secrets leaked into Client Components / browser bundles
- Concrete race conditions, null crashes, or broken invariants introduced by the diff
- Unbounded retries/loops/queries that will fail under realistic load

## Never flag
- Formatting, indentation, import order, or naming taste
- Missing JSDoc or documentation-only gaps
- Compiler or linter warnings already covered by CI
- Framework preferences (e.g. Server Components, next/image, metadata) unless they cause a real bug
- Speculative refactors or "might be nicer" suggestions without a failure mode
- Duplicate comments already present on the PR

## Comment quality
- State the failure mode: what breaks, under what input/state
- Cite file and line when possible
- Suggest a concrete fix
- Prefer fewer high-confidence findings over many low-confidence nits
