# TypeScript Engineering Standards

## Strictness
- `strict: true` is required in all `tsconfig.json` files
- `noUncheckedIndexedAccess: true` — always guard array/object access
- `exactOptionalPropertyTypes: true` — never conflate `undefined` with missing

## Types
```ts
// ✅ Good — explicit, branded types prevent misuse
type UserId = string & { readonly _brand: 'UserId' };
type ProductId = string & { readonly _brand: 'ProductId' };

// ❌ Bad — raw strings everywhere invite bugs
function getUser(id: string) {}
```

## No `any`
- `any` is a lint error. Use `unknown` and narrow it.
- Exception: third-party library boundaries where types are unavailable.

## Type Imports
```ts
// ✅ Always use type imports for type-only imports
import type { User } from './types';

// ❌ Don't import types as values
import { User } from './types';
```

## Utility Types
Prefer TypeScript built-ins over manual equivalents:
- `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`
- `ReturnType<F>`, `Parameters<F>`, `Awaited<T>`

## Error Handling
```ts
// ✅ Good — typed Result pattern for predictable errors
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function fetchUser(id: UserId): Promise<Result<User>> {
  try {
    const user = await db.users.findById(id);
    return { ok: true, value: user };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
```

## Naming
- Interfaces: `PascalCase` (`User`, `CheckoutState`)
- Type aliases: `PascalCase`
- Enums: `PascalCase` enum, `SCREAMING_SNAKE` values
- Generic type params: single uppercase letter or descriptive (`T`, `TValue`, `TKey`)
