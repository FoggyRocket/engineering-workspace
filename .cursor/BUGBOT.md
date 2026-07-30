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
- Redundant guard simplifications with no reachable failure mode
- Requests for behavior already implemented elsewhere in the same diff
- Assumed null/Option bugs when helpers return sentinel objects (e.g. `{ exists: false }`)

## Comment quality
- State the failure mode: what breaks, under what input/state — or say "hygiene / no observable change"
- Cite file and line when possible
- Suggest a concrete minimal fix (1–3 lines when possible)
- Prefer fewer high-confidence findings over many low-confidence nits
- Before Must Fix: prove reachability and check return types/API, not assumptions
