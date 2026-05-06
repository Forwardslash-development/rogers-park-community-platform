# Auth MVP Specification
## Rogers Park Community Platform — v1.0

**Last Updated:** May 2026  
**Status:** Active  
**Scope:** User accounts, authentication, session management

---

## Overview

This document specifies the complete behavior of the authentication system for the Auth MVP. It defines user signup, login, logout, session management, and error handling.

---

## User Account Model

### User Schema

```typescript
// Database schema (Drizzle)
{
  id: uuid;                    // Primary key, auto-generated
  email: string;               // Unique, lowercase, normalized
  password_hash: string;       // Argon2id hash, never exposed
  display_name: string;        // Public-facing name (e.g., "Jane Doe")
  role: 'user' | 'editor' | 'admin';  // Default: 'user'
  created_at: timestamp;       // UTC, set at signup
  updated_at: timestamp;       // UTC, updated on any change
  email_verified_at: timestamp | null;  // NULL in MVP, populated in Phase 2
}
```

### User Types

All users in MVP are of type `'user'`. Roles are:

| Role | Permissions | Notes |
|------|-------------|-------|
| `user` | Read public data, submit events (Phase 3), claim places (Phase 5) | Default role on signup |
| `editor` | All `user` perms + curate place data, approve submissions | Reserved for trusted volunteers (future) |
| `admin` | All perms, manage users, delete content | Founder initially, grants others later |

**Role assignment:** Only admins can assign roles (not implemented in MVP, but structure is ready).

---

## Signup Flow

### User Journey

```
User fills out signup form
         │
         ▼
┌─────────────────────────────┐
│  Client-side validation:    │
│  - Email format             │
│  - Password strength        │
│  - Confirm password matches │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /signup (SvelteKit)   │
│  Server-side validation     │
│  & form action              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /api/v1/auth/signup   │
│  - Check email not taken    │
│  - Hash password            │
│  - Create user record       │
│  - Create session           │
│  - Return session cookie    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Redirect to /dashboard     │
│  (authenticated)            │
└─────────────────────────────┘
```

### Endpoint: POST /api/v1/auth/signup

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "display_name": "Jane Doe"
}
```

**Validation (server-side):**

| Field | Rules | Error Code |
|-------|-------|-----------|
| `email` | Required, valid email format, unique in database, max 255 chars | `INVALID_EMAIL`, `EMAIL_TAKEN` |
| `password` | Required, min 8 chars, max 128 chars | `INVALID_PASSWORD` |
| `display_name` | Required, min 2 chars, max 100 chars | `INVALID_DISPLAY_NAME` |

**Validation logic:**

```
1. Email format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
2. Email uniqueness: SELECT COUNT(*) FROM users WHERE email = ? LIMIT 1
3. Password: ≥ 8 chars, ≤ 128 chars (no other complexity requirements in MVP; add in Phase 2)
4. Display name: alphanumeric + spaces, 2-100 chars
```

**Success Response (201 Created):**
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
      "id": "session_abc123...",
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

**Set-Cookie Header:**
```
auth_session=session_abc123...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```

**Error Responses:**

| Condition | Status | Code | Message |
|-----------|--------|------|---------|
| Email already registered | 409 Conflict | `EMAIL_TAKEN` | Email already registered |
| Invalid email format | 400 Bad Request | `INVALID_EMAIL` | Invalid email format |
| Invalid password (too short) | 400 Bad Request | `INVALID_PASSWORD` | Password must be at least 8 characters |
| Invalid display name | 400 Bad Request | `INVALID_DISPLAY_NAME` | Display name must be 2-100 characters |
| Database error | 500 Internal Server Error | `INTERNAL_ERROR` | An error occurred. Please try again. |

---

## Login Flow

### User Journey

```
User fills out login form
         │
         ▼
┌─────────────────────────────┐
│  Client-side validation:    │
│  - Email format             │
│  - Password not empty       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /login (SvelteKit)    │
│  Server-side validation     │
│  & form action              │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  POST /api/v1/auth/login         │
│  - Find user by email            │
│  - Verify password hash          │
│  - Delete old sessions (optional)│
│  - Create new session            │
│  - Return session cookie         │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Redirect to /dashboard     │
│  (authenticated)            │
└─────────────────────────────┘
```

### Endpoint: POST /api/v1/auth/login

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

**Validation (server-side):**

| Field | Rules | Error Code |
|-------|-------|-----------|
| `email` | Required, valid email format | `INVALID_EMAIL` |
| `password` | Required, not empty | `INVALID_PASSWORD` |

**Lookup & Verification:**

```
1. Find user by email (case-insensitive)
2. If not found: return 401 INVALID_CREDENTIALS (generic, don't reveal user exists)
3. If found: verify password against password_hash using Argon2
4. If password incorrect: return 401 INVALID_CREDENTIALS (same generic response)
5. If password correct: proceed to session creation
```

**Success Response (200 OK):**
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
      "id": "session_xyz789...",
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

**Set-Cookie Header:**
```
auth_session=session_xyz789...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```

**Error Responses:**

| Condition | Status | Code | Message |
|-----------|--------|------|---------|
| Email not found or password incorrect | 401 Unauthorized | `INVALID_CREDENTIALS` | Invalid email or password |
| Invalid email format | 400 Bad Request | `INVALID_EMAIL` | Invalid email format |
| Database error | 500 Internal Server Error | `INTERNAL_ERROR` | An error occurred. Please try again. |

**Security note:** Always return the same error message (`INVALID_CREDENTIALS`) whether the email doesn't exist or the password is wrong. This prevents email enumeration attacks.

---

## Logout Flow

### User Journey

```
User clicks "Log Out" button
         │
         ▼
┌──────────────────────────────┐
│  POST /logout (SvelteKit)    │
│  Form action (no API call)   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  POST /api/v1/auth/logout        │
│  - Find session from cookie      │
│  - Delete session from DB        │
│  - Clear cookie                  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Redirect to /               │
│  (not authenticated)         │
└──────────────────────────────┘
```

### Endpoint: POST /api/v1/auth/logout

**Request:**
- No body
- Session cookie sent automatically by browser

**Success Response (200 OK):**
```json
{
  "data": { "message": "Logged out successfully" },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Set-Cookie Header (to clear):**
```
auth_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

**Error Responses:**

| Condition | Status | Code | Message |
|-----------|--------|------|---------|
| No valid session cookie | 401 Unauthorized | `NOT_AUTHENTICATED` | Not authenticated |
| Database error | 500 Internal Server Error | `INTERNAL_ERROR` | An error occurred. Please try again. |

**Behavior:**
- Logging out when not authenticated returns 401 (but frontend redirects to homepage anyway)
- Session is deleted from database immediately; cookie is cleared
- User can still access public data (home page, place listings once available)

---

## Session Management

### Session Storage

```typescript
{
  id: string;              // Token ID, unique, generated by Lucia
  user_id: uuid;           // Foreign key to users.id
  expires_at: timestamp;   // UTC, absolute expiry time
  created_at: timestamp;   // UTC, when session was created
}
```

### Session Lifecycle

**Creation:**
1. User signs up or logs in
2. Lucia generates a random session token (UUID or similar)
3. Session record is inserted into `sessions` table with `expires_at` = now + 30 days
4. Token is set as HttpOnly cookie

**Validation (on each request):**
1. Browser sends cookie with request
2. SvelteKit middleware (in `+layout.server.ts`) extracts and validates cookie
3. Query `sessions` table: `SELECT * FROM sessions WHERE id = ? AND expires_at > now()`
4. If found and not expired: attach user data to `event.locals.user`
5. If not found or expired: `event.locals.user = null`

**Expiration:**
- Hard expiry at `expires_at` timestamp
- No sliding window in MVP (user stays logged in for 30 days regardless of activity)
- Can add sliding window in Phase 2 (update `expires_at` on each request)

**Revocation (logout):**
1. DELETE FROM sessions WHERE id = ?
2. Clear cookie

**Cleanup (background):**
- Expired sessions accumulate in DB (not deleted automatically)
- Add a cron job in Phase 2 to delete sessions older than 60 days
- Until then, manual cleanup: `DELETE FROM sessions WHERE expires_at < now() - interval '60 days'`

---

## Authentication Middleware

### SvelteKit: Load Function (src/routes/+layout.server.ts)

```typescript
export async function load({ locals, cookies }) {
  const session_id = cookies.get('auth_session');
  
  if (!session_id) {
    return { user: null };
  }
  
  // Call API to validate session
  const session = await validateSession(session_id);
  
  if (!session || session.expires_at < new Date()) {
    cookies.delete('auth_session');
    return { user: null };
  }
  
  return { user: session.user };
}
```

### SvelteKit: Protected Pages

```typescript
// src/routes/dashboard/+page.server.ts
export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  return { user: locals.user };
}
```

### Hono: Protected Routes

```typescript
const authMiddleware = (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: { code: 'NOT_AUTHENTICATED' } }, 401);
  }
  return next();
};

app.get('/api/v1/protected', authMiddleware, (c) => {
  // Protected endpoint
});
```

---

## Error Handling

### Client-Side (SvelteKit)

**Validation errors displayed immediately:**
- Email format validation
- Password strength feedback
- Display name length warning

**Server-side errors shown after form submission:**
- Email already taken
- Invalid credentials
- Network errors

**User experience:**
- Form remains on page
- Error message appears below field or in toast
- User can correct and retry

### Server-Side (Hono)

**All errors follow envelope format:**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { "field": "email", "reason": "..." }  // optional
  },
  "meta": { ... }
}
```

**Status codes:**
- `400 Bad Request`: Client sent invalid data
- `401 Unauthorized`: Auth failed or session invalid
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Server error (database down, etc.)

**Logging:**
- All errors logged to stdout with timestamp, endpoint, error code
- Sensitive data (passwords, tokens) never logged
- Example: `2026-05-05T14:30:00Z ERROR POST /api/v1/auth/login INVALID_CREDENTIALS user@example.com`

---

## Testing Requirements

### Unit Tests (Vitest)
- Password hashing (correct and incorrect passwords)
- Token generation
- Email validation
- Password validation
- Display name validation

### Integration Tests (Vitest + Supertest)
- Signup: valid request, duplicate email, invalid fields
- Login: valid credentials, wrong password, email not found
- Logout: valid session, no session
- Session validation: expired session, valid session
- Protected routes: with auth, without auth

### E2E Tests (Playwright)
- Sign up → see dashboard
- Log out → redirected to home
- Log in → see dashboard
- Try to access /dashboard without login → redirected to /login

---

## Security Checklist

- [x] Passwords hashed with Argon2id
- [x] Passwords never logged or returned in API responses
- [x] Sessions stored in database, not JWT
- [x] Session cookies are HttpOnly, Secure, SameSite=Lax
- [x] HTTPS enforced (via Cloudflare once domain registered)
- [x] Rate limiting on signup/login endpoints (10/hour signup, 5/hour login per IP)
- [x] Generic error messages (don't reveal user existence)
- [x] SQL injection prevented (Drizzle ORM + parameterized queries)
- [x] CSRF protection (SvelteKit form actions are CSRF-protected by default)
- [x] XSS prevention (SvelteKit auto-escapes output)

---

## Future Phases

### Phase 2
- Email verification before account activation
- Password reset flow (email link)
- Password strength requirements (uppercase, symbols, etc.)
- Session sliding window (extend on activity)
- Cleanup cron for expired sessions

### Phase 3
- OAuth (GitHub, Google)
- Two-factor authentication

### Phase 4
- API keys for programmatic access
- Webhook signatures (HMAC)

### Phase 5+
- Account deletion
- Email change flow
- Passwordless login

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
