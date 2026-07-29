# Testing Standards

## Coverage Requirements
| Layer | Minimum Coverage | Tool |
|---|---|---|
| Business logic (utils, services) | 90% | Vitest |
| React components | 80% | Testing Library |
| API routes | 80% | Vitest + supertest |
| E2E critical paths | All happy paths | Playwright |

## Test Structure — AAA Pattern
```ts
describe('calculateDiscount', () => {
  it('applies 20% to orders over $100', () => {
    // Arrange
    const order = { total: 150, code: 'SAVE20' };

    // Act
    const discounted = calculateDiscount(order);

    // Assert
    expect(discounted.total).toBe(120);
  });
});
```

## What to Test
- **Unit tests**: Pure functions, utilities, business rules
- **Integration tests**: API routes end-to-end with a real DB (use test containers)
- **Component tests**: User interactions, not implementation details
- **E2E**: Critical user journeys (checkout, auth, key workflows)

## What NOT to Test
- Implementation details (internal state, private methods)
- Third-party library behavior
- Generated code

## Naming
Test descriptions must read as specifications:
```ts
// ✅ Good — reads like a spec
it('returns 401 when user is not authenticated')
it('sends confirmation email after order is placed')

// ❌ Bad — vague, implementation-focused
it('works')
it('calls sendEmail')
```

## Mocking
- Mock at the boundary (HTTP layer, DB layer), not inside units
- Use `vi.mock` for modules, but prefer dependency injection
- Never mock the system under test
