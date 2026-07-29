# Pre-Merge Checklist

Use this checklist before merging any PR to a protected branch.

## Automated (run via CI)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with zero errors
- [ ] `pnpm audit` — no high/critical vulnerabilities
- [ ] Bundle size within budget

## AI Review
- [ ] `devx review` ran — no Critical Issues
- [ ] `devx security` ran — no Critical/High issues
- [ ] `devx analytics` ran (if analytics changes present)

## Manual Review
- [ ] PR description is complete
- [ ] Code is self-documenting or has necessary comments
- [ ] No sensitive data in logs or responses
- [ ] Error handling is present for all async operations
- [ ] Loading and error states handled in UI
- [ ] Accessibility requirements met
- [ ] Mobile responsive (if UI change)

## Deployment
- [ ] Feature flag created if gradual rollout needed
- [ ] Rollback plan documented for high-risk changes
- [ ] Monitoring/alerts updated if new services added
- [ ] README / docs updated if public-facing behavior changed
