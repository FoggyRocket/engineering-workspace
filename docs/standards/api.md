# Backend API Standards

## Response Shape
All API responses follow a consistent envelope:
```ts
// Success
{ "data": { ... }, "meta": { "requestId": "..." } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }

// Paginated
{ "data": [...], "meta": { "total": 100, "page": 1, "limit": 20, "requestId": "..." } }
```

## HTTP Status Codes
| Scenario | Code |
|---|---|
| Success (with body) | 200 |
| Created | 201 |
| No content | 204 |
| Bad request / validation | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict | 409 |
| Server error | 500 |

## Versioning
- Version in URL path: `/api/v1/users`
- Never remove fields in a minor version; deprecate first
- Breaking changes require a new major version

## Pagination
- Cursor-based pagination for large datasets
- Offset pagination for small, bounded lists
- Always return `total` count for UI pagination

## Rate Limiting
- Public endpoints: 60 req/min per IP
- Authenticated endpoints: 600 req/min per user
- Return `Retry-After` header on 429

## Idempotency
- All write operations accept an `Idempotency-Key` header
- Store results for 24 hours to prevent duplicate processing
