# API Contract
## Rogers Park Community Platform — Auth MVP (v1.0)

**Last Updated:** May 2026  
**Version:** v1  
**Base URL:** `https://api.rogerspan.community/v1` (production) or `http://localhost:3001/api/v1` (development)

---

## Overview

This document specifies all HTTP endpoints for the Auth MVP. All endpoints return JSON with a consistent envelope format.

---

## Response Format

### Success Envelope (2xx)

All successful responses use this format:

```json
{
  "data": { /* resource or array of resources */ },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

### Error Envelope (4xx, 5xx)

All error responses use this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { /* optional context */ }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `INVALID_PASSWORD` | 400 | Password doesn't meet requirements |
| `INVALID_DISPLAY_NAME` | 400 | Display name format is invalid |
| `INVALID_CREDENTIALS` | 401 | Email not found or password wrong |
| `EMAIL_TAKEN` | 409 | Email already registered |
| `NOT_AUTHENTICATED` | 401 | No valid session or API key |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint:** `POST /auth/signup`

**Authentication:** None (public)

**Request:**

```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "display_name": "Jane Doe"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (201 Created):**

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane@example.com",
      "display_name": "Jane Doe",
      "role": "user",
      "created_at": "2026-05-05T14:30:00Z"
    },
    "session": {
      "id": "session_abc123xyz789",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "expires_at": "2026-06-04T14:30:00Z"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Response Headers:**
```
Set-Cookie: auth_session=session_abc123xyz789; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `email` | Required, must be valid email, max 255 chars, must be unique in database |
| `password` | Required, min 8 chars, max 128 chars |
| `display_name` | Required, min 2 chars, max 100 chars, alphanumeric + spaces |

**Error Responses:**

```json
// 409 Conflict — Email already registered
{
  "error": {
    "code": "EMAIL_TAKEN",
    "message": "Email already registered"
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

```json
// 400 Bad Request — Invalid email
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Invalid email format",
    "details": { "field": "email" }
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

```json
// 400 Bad Request — Password too short
{
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Password must be at least 8 characters",
    "details": { "field": "password", "min_length": 8 }
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

```json
// 400 Bad Request — Invalid display name
{
  "error": {
    "code": "INVALID_DISPLAY_NAME",
    "message": "Display name must be 2-100 characters",
    "details": { "field": "display_name", "min_length": 2, "max_length": 100 }
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

**Rate Limiting:**
- 10 signup attempts per IP address per hour
- Returns 429 Too Many Requests if exceeded
- Header: `Retry-After: 1800` (seconds)

**Notes:**
- Password is hashed server-side; original password is never stored or returned
- User is automatically logged in after signup (session cookie set)
- Email is case-insensitive; stored as lowercase in database
- Display name is case-preserved as submitted

---

### 2. Log In

Authenticate with email and password, create a session.

**Endpoint:** `POST /auth/login`

**Authentication:** None (public)

**Request:**

```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane@example.com",
      "display_name": "Jane Doe",
      "role": "user",
      "created_at": "2026-05-05T14:30:00Z"
    },
    "session": {
      "id": "session_xyz789abc123",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "expires_at": "2026-06-04T14:30:00Z"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Response Headers:**
```
Set-Cookie: auth_session=session_xyz789abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `email` | Required, must be valid email format |
| `password` | Required, not empty |

**Error Responses:**

```json
// 401 Unauthorized — Wrong email or password
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

```json
// 400 Bad Request — Invalid email format
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Invalid email format",
    "details": { "field": "email" }
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

**Rate Limiting:**
- 5 login attempts per IP address per hour
- Returns 429 Too Many Requests if exceeded
- Header: `Retry-After: 720` (seconds)

**Security Notes:**
- Returns generic `INVALID_CREDENTIALS` whether email not found or password is wrong (prevents user enumeration)
- Passwords are compared in constant time to prevent timing attacks
- No account lockout in MVP (implement in Phase 2 if needed)

---

### 3. Log Out

Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Authentication:** Required (valid session cookie)

**Request:**
- No request body
- Session cookie sent automatically by browser

**Response (200 OK):**

```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Response Headers:**
```
Set-Cookie: auth_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

**Error Responses:**

```json
// 401 Unauthorized — Not authenticated
{
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "Not authenticated"
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

**Notes:**
- Session is deleted from database immediately
- Cookie is cleared in response
- User can still access public endpoints (not authenticated in future requests)

---

### 4. Get Current User

Retrieve the authenticated user's profile.

**Endpoint:** `GET /auth/user`

**Authentication:** Required (valid session cookie)

**Request:**
- No request body
- Session cookie sent automatically by browser

**Response (200 OK):**

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane@example.com",
      "display_name": "Jane Doe",
      "role": "user",
      "created_at": "2026-05-05T14:30:00Z"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized — Not authenticated or session expired
{
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "Not authenticated"
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

**Notes:**
- Returns the authenticated user's full profile
- Useful for frontend to load user data on app startup
- Can be called repeatedly; no side effects

---

### 5. Health Check

Verify API is running and database is reachable.

**Endpoint:** `GET /health`

**Authentication:** None (public)

**Response (200 OK):**

```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-05T14:30:00Z",
    "version": "v1"
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Error Responses:**

```json
// 503 Service Unavailable — Database unreachable
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Database connection failed"
  },
  "meta": { "version": "v1", "timestamp": "2026-05-05T14:30:00Z" }
}
```

**Notes:**
- Used by Cloudflare and monitoring tools to verify uptime
- Includes a database connectivity check

---

## Authentication

### Session Cookie

Sessions are managed via HttpOnly cookies:

**Cookie Name:** `auth_session`

**Cookie Attributes:**
- `HttpOnly`: Not accessible to JavaScript (prevents XSS theft)
- `Secure`: Only sent over HTTPS (not HTTP)
- `SameSite=Lax`: Mitigates CSRF attacks, allows top-level navigation
- `Max-Age=2592000`: 30 days (2,592,000 seconds)
- `Path=/`: Available to all endpoints

**How it works:**
1. Signup or login creates a session, sets cookie
2. Browser includes cookie in all subsequent requests to same domain
3. API validates cookie against `sessions` table
4. If valid and not expired, request is authenticated
5. If invalid or expired, request is unauthenticated

### Protected Endpoints

Endpoints requiring authentication will return `401 NOT_AUTHENTICATED` if:
- Cookie is missing
- Cookie value doesn't match any session in database
- Session has expired

---

## Versioning

### URL-Based Versioning

API version is in the URL path: `/api/v1/...`

**Future versions:** `/api/v2/...`, `/api/v3/...`, etc.

**Deprecation policy:**
- New major versions are released when breaking changes are necessary
- Previous versions are supported for at least 6 months
- Deprecation warnings are sent via response headers

---

## Rate Limiting

### Authentication Endpoints

| Endpoint | Limit | Window | Status Code |
|----------|-------|--------|-------------|
| `POST /auth/signup` | 10 | 1 hour per IP | 429 |
| `POST /auth/login` | 5 | 1 hour per IP | 429 |
| `POST /auth/logout` | 100 | 1 hour per IP | 429 |

### Rate Limit Headers

```
RateLimit-Limit: 10
RateLimit-Remaining: 7
RateLimit-Reset: 1620000000
Retry-After: 1800
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      "field": "email",
      "reason": "already_taken",
      "constraint": "unique"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Note:** `details` field is optional and varies by error type.

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request (validation error) |
| `401 Unauthorized` | Authentication failed or required |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Request conflicts with existing data |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |
| `503 Service Unavailable` | Database or service down |

---

## CORS

**In MVP:** CORS is disabled (API only accessed from same domain, SvelteKit frontend).

**Future (Phase 4, for external partners):**
- Add CORS headers for specific domains
- Use preflight requests for safe cross-origin access

---

## Caching

### Public Endpoints

Future read-only endpoints (e.g., `GET /places/:id`) will include cache headers:

```
Cache-Control: public, max-age=3600, s-maxage=86400
ETag: "abc123..."
Last-Modified: 2026-05-05T14:30:00Z
```

### Authentication Endpoints

Not cached (always fresh):

```
Cache-Control: no-store, no-cache, must-revalidate
```

---

## Future Endpoints (not in MVP)

These are planned for future phases and mentioned here for context:

### Phase 2: Password Reset
- `POST /auth/forgot-password` — Send reset email
- `POST /auth/reset-password` — Reset with token

### Phase 3: Events
- `GET /events` — List events
- `POST /events` — Create event (requires auth)
- `GET /events/:id` — Get event details

### Phase 4: Public API
- `GET /places` — List venues
- `GET /places/:id` — Get venue details
- Webhooks for subscriptions

---

## Testing

### cURL Examples

**Sign up:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "display_name": "Jane Doe"
  }' \
  -c cookies.txt
```

**Log in:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

**Get current user:**
```bash
curl -X GET http://localhost:3001/api/v1/auth/user \
  -b cookies.txt
```

**Log out:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -b cookies.txt
```

**Health check:**
```bash
curl http://localhost:3001/api/v1/health
```

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
