# PR Review Workflow

## Before Opening a PR

Run the full pre-check locally:
```bash
devx pr-check --base main
```

Review the generated report and resolve all **Must Fix** findings before opening.
Standards and Suggestions can be addressed separately and should not block the PR alone.

## PR Title Format
```
type(scope): description

feat(checkout): add discount code validation
fix(auth): resolve token refresh race condition
chore(deps): upgrade Next.js to 15.2
docs(api): update rate limit documentation
refactor(cart): extract useCartTotal hook
test(checkout): add edge case coverage for empty cart
```

## PR Description Template
```md
## What
<!-- What does this PR change? -->

## Why
<!-- Why is this change needed? -->

## How
<!-- Key technical decisions or approach -->

## Testing
<!-- How was this tested? -->

## Checklist
- [ ] `devx pr-check` ran and report reviewed
- [ ] Tests added/updated
- [ ] Documentation updated if needed
- [ ] No console.log or debug code
- [ ] Analytics events checked if applicable
```

## Review SLAs
| PR Size | Review SLA |
|---|---|
| Small (< 200 lines) | 4 hours |
| Medium (200–500 lines) | 1 business day |
| Large (500+ lines) | 2 business days |

## Approval Requirements
- 1 approval for bug fixes and chores
- 2 approvals for features and refactors
- Tech Lead approval for architecture changes
- Security team approval for auth/payment changes

## Merge Strategy
- **Squash merge** for features and fixes
- **Merge commit** for release branches
- Delete branch after merge
- Never force-push to `main` or `develop`
