# DevX Code Review — Examples

## Example A: Redundant guard (Hygiene, Approve with minor comments)

**Bot claim:** Always run YoY when `priorYearDate` exists; remove truthy checks on snapshots.

**Pre-flight:**
1. Observable bug? Often **no** if helpers already handle missing data
2. Types allow null snapshots? Readers return `{ exists: false }`, not null → **no**
3. Already covered? `combineYoyStatus` / Mixpanel-only already in diff → **yes**

→ Hygiene. Not Request changes.

```markdown
# Summary
Safe refactor/UI wiring; snapshot semantics and optional Mixpanel path already handled.

# Findings

### Critical / High (Behavioral Bugs) — Must Fix
None

### Medium / Low (Behavioral Bugs)
None

### Hygiene & Cleanups (Optional / Non-blocking)
- `lib/admin/cache-inspect.ts:696` — hygiene: simplify YoY guard to `priorYearDate` only.
  Reachable: no reachable case found (sentinels + combineYoyStatus).
  Confidence: Medium. Patch: derive YoY when `priorYearDate` is set; pass snapshots through.

### Skipped external findings
- CodeRabbit `cache-inspect.ts` YoY guard — no reachable failure; Mixpanel-only already in `combineYoyStatus`.

# Merge Recommendation
**Approve with minor comments**

# Confidence
High
```

## Example B: Real Must Fix → Request changes

**Claim:** Route handler updates DB with no auth check.

**Pre-flight:** yes / yes / no → Behavioral Critical.

```markdown
# Summary
Mutation route lacks auth; unsafe to merge until gated.

# Findings

### Critical / High (Behavioral Bugs) — Must Fix
- `app/api/orders/[id]/route.ts:42` — unauthenticated PATCH can mutate orders.
  Reachable when: unauthenticated client calls PATCH with a valid id.
  Confidence: High. Patch: add `requireSession()` before the update.

### Medium / Low (Behavioral Bugs)
None

### Hygiene & Cleanups (Optional / Non-blocking)
None

# Merge Recommendation
**Request changes**

# Confidence
High
```
