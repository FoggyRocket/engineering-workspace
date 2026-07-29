# React / Next.js Engineering Standards

## Component Structure
```tsx
// ✅ Single responsibility, co-located types
interface CheckoutButtonProps {
  productId: ProductId;
  quantity: number;
  onSuccess: (orderId: OrderId) => void;
}

export function CheckoutButton({ productId, quantity, onSuccess }: CheckoutButtonProps) {
  // ...
}
```

## State Management
- Local UI state → `useState`
- Shared client state → Zustand or React Query
- Server state → React Query / SWR (never useEffect + fetch)
- Global app state (auth, theme) → Context + `useReducer`

## Custom Hooks
- Every custom hook starts with `use`
- Hooks are pure logic — no JSX
- One hook per concern
```ts
// ✅ Good
function useCartTotal(items: CartItem[]): number { ... }

// ❌ Bad — too broad
function useEverything() { ... }
```

## Performance
- Wrap expensive renders in `React.memo` — but measure first
- Use `useCallback` for stable function references passed as props
- Prefer `useMemo` over storing derived state in `useState`
- Route-level code splitting with `React.lazy` + `Suspense`

## Next.js App Router
- Server Components by default
- Only add `"use client"` when you need: hooks, browser APIs, event handlers
- Use `loading.tsx` for Suspense fallbacks
- Use `error.tsx` for error boundaries
- Cache aggressively with `fetch({ next: { revalidate: 60 } })`

## Accessibility
- All interactive elements must be keyboard-navigable
- Images must have `alt` text (empty string for decorative images)
- Color contrast must meet WCAG 2.1 AA (4.5:1 for text)
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
