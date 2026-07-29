# Security Standards

## Authentication & Authorization
- JWT tokens must expire within 15 minutes (use refresh tokens)
- All API routes are private by default — opt-in to public
- Use middleware-level auth, never inline per-route checks
- Enforce RBAC with a centralized permission checker

## Input Validation
```ts
// ✅ Every API route input validated with Zod
import { z } from 'zod';

const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
  shippingAddress: AddressSchema,
});

export async function POST(req: Request) {
  const body = CreateOrderSchema.parse(await req.json());
  // ...
}
```

## Secrets Management
- Never commit secrets (enforced via `git-secrets` pre-commit hook)
- Use environment variables; document in `.env.example`
- Rotate credentials every 90 days
- Use a secrets manager (Vault, AWS Secrets Manager) in production

## SQL / Database
- Always use parameterized queries or ORM
- No raw string interpolation in queries
- Principle of least privilege on DB users

## Dependencies
- Run `pnpm audit` in CI — fail on high/critical
- Review `package.json` changes in all PRs
- Prefer well-maintained packages with recent activity
- Lock file committed and never manually edited

## Logging
```ts
// ✅ Good — structured, no PII
logger.info({ userId, orderId, action: 'order_placed' });

// ❌ Bad — contains PII, hard to query
console.log(`User ${email} placed order for ${cardLast4}`);
```
