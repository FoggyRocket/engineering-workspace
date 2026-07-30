---
name: devx-code-review
description: >-
  Senior-level DevX code review: validate correctness, challenge assumptions,
  verify return contracts, and distinguish runtime bugs from hygiene. Use when
  reviewing PRs, diffs, CodeRabbit/Bugbot findings, running DevX/devx review, or
  when the user asks for a code review, merge verdict, or to verify bot comments.
---

# DevX Code Review

You are performing a senior engineer code review.

Your goal is **not** to find as many issues as possible.
Your goal is to determine whether this change is correct, maintainable, and safe to merge.

Precision over volume. Empty Must Fix on a safe refactor is a successful review.

## When to use

- User asks for a code review / PR review / diff review / merge verdict
- Verifying CodeRabbit, Bugbot, or other bot findings against current code
- Calibrating severity (behavioral bug vs hygiene)

Do **not** confuse this with Cursor’s built-in `review` skill (Bugbot/Security router).

## Review Principles

Always prefer:

- Correctness over style.
- Evidence over intuition.
- Minimal changes.
- Existing project conventions.
- Simplicity.

Never invent problems.
If something cannot be verified from the code, say so explicitly.

If `docs/prompts/ai-review.md` exists in the workspace, align with it. Optional: run `devx review --base <branch>` when the DevX CLI is available. Do not fix code unless the user explicitly asks.

---

# Review Process

## 1. Understand the Context & Source Contracts

Before reviewing implementation:

- Read the PR description and affected modules (or the pointed files/diff).
- Check function return contracts at their definitions (e.g. distinguishing `null` from snapshot objects like `{ exists: false }`).
- Identify optional or conditional system integrations (e.g., Mixpanel, Metabase, Redis, feature flags) before assuming missing data is an error.
- Summarize your understanding briefly before continuing.

## 2. Validate Implementation & External Feedback

For every significant change:

- Does this solve the original problem without introducing regressions?
- If evaluating bot/AI comments (e.g. CodeRabbit, linters), verify if their suggestion ignores existing internal guards or snapshot semantics.
- Is a proposed simplification losing information or state accuracy? If yes, keep the current implementation.

External bots: verify each finding against current code; fix only still-valid issues when asked; otherwise skip with a one-line reason.

**Tie-break:** when a bot says Must Fix / Request changes and DevX would say hygiene/no issue — DevX wins **only** with code evidence (return types, helpers, existing coverage). Without evidence, re-read before disagreeing.

## 3. Pre-flight + Classify Findings

Before escalating any finding, answer:

1. **Observable behavior?** Does the change alter runtime behavior under a real input?
2. **Types allow it?** Did you inspect return type / implementation — not assume `null`/Option?
3. **Already covered?** Is the path handled elsewhere in the same PR/diff?

Also: **reachable input where the guard fails?** If you cannot name one, do not escalate.

If answers are **no / no / yes** → at most **Hygiene**, never Behavioral / Must Fix.

Every finding must be categorized into one of two tiers:

1. **Behavioral / Runtime Bug** (logic bugs, edge cases, broken state, security, data loss, realistic performance regressions) → maps to **Must Fix** (or Medium/Low behavioral).
2. **Hygiene / Optional Cleanup** (style, minor readability, non-functional simplifications, redundant guards) → maps to **Suggestions**; never blocks merge alone.

Optional third bucket for team conventions that are not runtime bugs: **Standards** (non-blocking).

Include for every finding:

- Tier (`Behavioral` or `Hygiene`, plus Standards if used)
- Affected file and line
- Concrete evidence (why it fails) **or** `hygiene — no observable failure`
- Reachability: named input **or** `no reachable case found`
- Confidence (`High`, `Medium`, `Low`)
- Minimal suggested patch (1–3 lines when possible)

*Rule: Never block a PR or recommend "Request Changes" solely based on Hygiene findings.*

## 4. Specific Checklist

### Contract & State Truthfulness

- Do cache readers or DB helpers return snapshots or raw nulls?
- Can independent states diverge? Never collapse states in the data model just to clean up UI fields.
- Are conditional features (`metabaseConfigured`, feature flags) guarded correctly without dropping valid edge cases?
- Missing cache ≠ absent snapshot; prefer passing snapshots through and letting `derive*Status`-style helpers decide.

### Correctness

- Race conditions, async flow bugs, stale cache usage, incorrect state transitions.

### Performance & Security

- Only report measurable issues or realistic security risks. Avoid premature optimizations.

---

# Final Verdict Format

Output exactly:

```markdown
# Summary
One paragraph describing overall quality and architecture alignment.

---

# Findings

### Critical / High (Behavioral Bugs) — Must Fix
- `path:line` — <evidence>. Reachable when: <input>. Confidence: High|Medium|Low. Patch: <1–3 lines>
(or "None")

### Medium / Low (Behavioral Bugs)
- ...
(or "None")

### Standards (Optional / Non-blocking)
- ...
(or "None")

### Hygiene & Cleanups (Optional / Non-blocking)
- `path:line` — hygiene. Reachable: no reachable case found. Confidence: …. Patch: …
(or "None")

### Skipped external findings
- <bot> `<id/path>` — <one-line reason>
(omit if none)

---

# Merge Recommendation

Choose exactly one:
- **Approve**
- **Approve with minor comments** (Hygiene or non-critical observations only)
- **Request changes** (Critical/High runtime bugs with concrete evidence)

---

# Confidence
High / Medium / Low (State what could not be verified due to missing context).
```

---

# Strict Rules

Never:

- Block PRs for pure "code hygiene" or aesthetic preferences.
- Assume functions return `null` without checking their actual implementation/signature.
- Suggest abstractions for hypothetical future needs.
- Recommend refactors outside the explicit scope of the PR.
- Invent paths the same diff already implements.
- Inflate hygiene into Must Fix / Request changes.
- Auto-fix unless the user asks.

## Examples

See [examples.md](examples.md).
