# Technical Architecture Document
## Rogers Park Community Platform — Auth MVP (v1.0)

**Last Updated:** May 2026  
**Status:** Active  
**Audience:** Developers, operators

---

## Overview

The Rogers Park Community Platform is a community-owned, neighborhood-scale events and venue knowledge graph for Rogers Park, Chicago. This document describes the technical architecture for the Auth MVP (v1.0), which establishes user accounts, roles, authentication, and the foundational API and frontend infrastructure.

**Success criteria for v1.0:**
- Users can sign up, log in, log out
- Sessions are secure and persistent
- Role-based access control is in place (foundation for future place claims, event submissions)
- API is independent of frontend, ready for partner integrations
- All core flows are covered by tests
- Deployable to a single Digital Ocean droplet

---

## System Architecture

### Deployment Model

```
┌─────────────────────────────────────────────────────────┐
│           Digital Ocean Droplet (single VM)             │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   SvelteKit      │         │   Hono API       │    │
│  │   (port 5173)    │◄───────►│   (port 3001)    │    │
│  │                  │ HTTP    │                  │    │
│  │  - SSR rendering │         │  - REST endpoints│    │
│  │  - Auth forms    │         │  - Auth handlers │    │
│  │  - PWA shell     │         │  - DB queries    │    │
│  └──────────────────┘         └──────────────────┘    │
│         │                             │                │
│         └─────────────┬───────────────┘                │
│                       │                                │
│              ┌────────▼────────┐                       │
│              │   PostgreSQL    │                       │
│              │   (localhost)   │                       │
│              └─────────────────┘                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Cloudflare (DNS, edge caching, DDoS protection) │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Browser/Client ◄──────── HTTPS ────────► Cloudflare ◄──► Droplet
```

**Key decisions:**

1. **Single droplet, two processes**: SvelteKit (port 5173) and Hono (port 3001) run independently. This allows clean separation of concerns while sharing a single PostgreSQL instance.

2. **Reverse proxy**: Cloudflare sits in front, providing:
   - DNS resolution
   - HTTPS termination (once domain registered)
   - Edge caching for static assets and API responses
   - DDoS protection (free tier)

3. **PostgreSQL local to droplet**: No external database service. Simpler, cheaper, fully controlled. Backups via pg_dump to object storage when needed.

---

## Technology Stack

### Frontend (SvelteKit)

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | SvelteKit | Server-side rendering for auth flows, smaller bundle than Next.js, file-based routing, built-in form actions |
| **Language** | TypeScript | Type safety, IDE support, easier refactoring |
| **Styling** | Tailwind CSS | Utility-first, rapid prototyping, minimal runtime |
| **Testing** | Vitest + Playwright | Fast unit/integration tests, e2e testing without external tools |
| **Build** | Vite | Fast dev server, fast builds, native ESM |

**Key SvelteKit decisions:**
- Use **form actions** (`+page.server.ts`) for login/signup/logout, not client-side API calls. This keeps auth logic server-side and works with progressive enhancement.
- Use **hooks** (`handle()` in `+layout.server.ts`) for session middleware.
- Service worker for PWA shell caching (venues, once available), not for auth state.

### API (Hono)

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Hono | Lightweight, fast, excellent TypeScript, works on Node/Deno/Workers, REST-native |
| **Language** | TypeScript | Type safety, shared types with frontend |
| **Database** | PostgreSQL + Drizzle ORM | Boring, durable, type-safe queries, no migrations magic, excellent for geo queries (PostGIS) |
| **Auth** | Lucia + Argon2 | Lucia handles sessions elegantly, Argon2 is the modern password hashing standard |
| **Testing** | Vitest + Supertest | Fast, no server spin-up needed, deterministic |

**Key Hono decisions:**
- REST-first, no GraphQL. Simple path-based versioning (`/api/v1/...`).
- JSON request/response with consistent envelope: `{ data, error, meta }`.
- All endpoints return typed responses via Zod or similar for runtime validation.

### Database (PostgreSQL + Drizzle)

| Layer | Choice | Why |
|-------|--------|-----|
| **Database** | PostgreSQL 14+ | Mature, reliable, PostGIS for geo queries, runs on $5 droplets, free and open-source |
| **ORM** | Drizzle ORM | Type-safe, minimal abstraction, explicit migrations, no magic, easy to test with transactions |
| **Migrations** | Drizzle Kit | SQL-based, repeatable, version-controlled |

**Key database decisions:**
- Schema-as-code in TypeScript (Drizzle schema files).
- Migrations are explicit SQL files, reviewed before running.
- No auto-migrations in production; all schema changes are deliberate.

---

## Core Concepts

### Authentication Flow

```
┌─────────────────┐
│  User Signup    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /signup (SvelteKit form)   │
│  - Email, password              │
│  - Client-side validation       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/v1/auth/signup (Hono) │
│  - Hash password (Argon2)       │
│  - Create user in DB            │
│  - Create session (Lucia)       │
│  - Return session cookie        │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Browser receives cookie         │
│ Redirects to /dashboard         │
└─────────────────────────────────┘
```

**Session management:**
- Lucia creates a **session token** and stores it in the database.
- Token is sent as a **HttpOnly, Secure cookie** (not JavaScript-accessible, prevents XSS).
- On each request, SvelteKit middleware validates the cookie against the database.
- No JWT. Sessions are simple, auditable, revocable.

### Authorization (Roles)

Roles are stored on the User record. Initial roles:
- `user`: Standard account, can submit events (future phases)
- `editor`: Can claim places, curate data (future phases)
- `admin`: Full access, can manage users and content (founder initially)

**Role enforcement:** Checked in Hono middleware and SvelteKit load functions. Fails fast with 403 Forbidden.

---

## API Design

### Principles

1. **REST-first**: Path-based versioning, HTTP verbs, standard status codes.
2. **JSON envelopes**: All responses (success and error) wrapped in consistent structure.
3. **No magic**: Explicit error messages, no hidden behavior.
4. **Cacheability**: Public endpoints (once available) designed for edge caching via Cloudflare.
5. **Webhooks ready**: Structure allows webhooks for partner integrations (Phase 4).

### Response Format

**Success (200, 201, etc.):**
```json
{
  "data": { /* resource */ },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

**Error (4xx, 5xx):**
```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email must be a valid address",
    "details": { /* optional extra context */ }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2026-05-05T14:30:00Z"
  }
}
```

### Auth Endpoints (MVP)

See **API Contract** document for full specification.

---

## Security Model

### Password Security
- **Hashing**: Argon2id (via `argon2` npm package)
- **Parameters**: Follows OWASP recommendations (time cost, memory cost, parallelism)
- **Storage**: Hashed password stored in `users.password_hash`, never logged or returned

### Session Security
- **Token storage**: Database + HttpOnly cookie
- **Cookie attributes**: `HttpOnly`, `Secure`, `SameSite=Lax`
- **Duration**: 30 days (sliding window; extends on activity)
- **Revocation**: Can delete session record immediately (logout)

### Endpoint Security
- **Auth endpoints**: Public, rate-limited (10 signup attempts/hour per IP, 5 login attempts/hour per IP)
- **Protected endpoints**: Require valid session cookie
- **Admin endpoints**: Require `admin` role

### HTTPS & Transport
- Cloudflare terminates HTTPS (free tier, automatic)
- Internal droplet communication (SvelteKit → Hono → PostgreSQL) is unencrypted (same machine)
- Once domain is registered, enable HSTS headers

### Future Additions (not in MVP)
- Email verification (Phase 2)
- Password reset flow (Phase 2)
- OAuth providers (Phase 3)
- API keys for programmatic access (Phase 4)
- Two-factor authentication (Phase 5+)

---

## Data Storage

### Users Table
```
id (uuid, primary key)
email (varchar, unique, not null)
password_hash (varchar, not null)
display_name (varchar, nullable)
role (enum: user, editor, admin; default: user)
created_at (timestamp)
updated_at (timestamp)
email_verified_at (timestamp, nullable) — for future verification
```

### Sessions Table
```
id (varchar, primary key — Lucia token)
user_id (uuid, foreign key to users)
expires_at (timestamp)
created_at (timestamp)
```

**Rationale:**
- No profile bloat in MVP. Display name is enough for early features.
- Role is simple enum; ACL will be added via middleware as needed.
- Email not unique-indexed initially (allows signup without verification), but constrained to unique later.

---

## Testing Strategy

### Test Pyramid (for Auth MVP)

```
         △
        ╱ ╲       E2E (Playwright)
       ╱   ╲      - Full user journey
      ╱─────╲     - 3-5 tests
     ╱       ╲
    ╱─────────╲   Integration (Vitest + Supertest)
   ╱           ╲  - API + database + Lucia
  ╱             ╲ - 20-30 tests
 ╱───────────────╲
╱                 ╲ Unit (Vitest)
─────────────────── - Password hashing, token generation, validation
                   - 40-50 tests
```

### Test Coverage Targets
- **Auth logic**: 90%+ coverage (password hashing, token generation, session validation)
- **API endpoints**: 80%+ coverage (happy path + error cases)
- **E2E flows**: Critical paths only (signup, login, logout, unauthorized access)

See **Testing Strategy** document for detailed breakdown.

---

## Development Environment

### Local Setup
```bash
# Clone repo
git clone <repo> && cd <repo>

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Start PostgreSQL (Docker or local)
docker-compose up -d

# Run migrations
pnpm run db:migrate

# Start dev servers (concurrently)
pnpm run dev
```

### Environment Variables
See **Repo Structure & Setup Guide** for full list.

---

## Deployment

### CI/CD Pipeline (future)
- GitHub Actions on push to main
- Run all tests
- If tests pass, deploy to DO droplet

### Current (manual)
1. Push to GitHub
2. SSH into droplet
3. `git pull` + `pnpm install` + `pnpm run db:migrate`
4. Restart services (systemd or manual)

See **Deployment & Operations** for full details.

---

## Monitoring & Observability

### Logging
- Application logs: stdout (captured by systemd journal)
- Database: PostgreSQL slow query log (configured on droplet)
- API: Request/response logging (middleware in Hono)

### Health Checks
- `GET /health` endpoint on API (returns 200 if DB is reachable)
- SvelteKit serves `/health` by proxy to Hono
- Cloudflare can ping this periodically

### Metrics (future)
- User signups/day
- Active sessions
- API response times
- Database query performance

Not instrumented in MVP, but structure allows addition.

---

## Scaling Considerations

This architecture is designed for **one neighborhood, one developer, one droplet** initially. Constraints:

- **Database**: PostgreSQL on single droplet works fine for Rogers Park scale (~55k residents, 200-400 venues, low thousands of events/year). No sharding needed.
- **API**: Hono is extremely fast; a single process handles 1000s of requests/sec easily.
- **Frontend**: SvelteKit SSR on single droplet handles hundreds of concurrent users.
- **Storage**: A $5 droplet has enough disk for millions of records.

**When to scale (probably not needed):**
- If Rogers Park becomes a template for other neighborhoods: separate API server, dedicated database.
- If organic traffic exceeds droplet capacity: add a second process or second droplet for API.
- If storage becomes an issue: object storage for images/backups (add later).

For now, the single-droplet architecture is the right choice.

---

## Technology Choices: Why Not...?

### Why not Next.js?
Next.js couples frontend and backend via file-based API routes. This makes it harder to:
- Test the API independently
- Expose a clean REST API for external partners
- Scale the API separately later

SvelteKit's separation of concerns is cleaner for this project.

### Why not a single monolithic framework (Rails, Django)?
Those are excellent, but they require:
- Specialized knowledge (Python, Ruby) on the team
- Heavier VPS (more memory, more cost)
- Longer spin-up time for a solo part-time developer

TypeScript across the stack keeps context switching minimal.

### Why not SQLite?
SQLite is great for prototypes and single-user apps. Rogers Park needs:
- Geographic queries (PostGIS)
- Multiple concurrent writers (event submissions, admin updates)
- Transaction support for consistency

PostgreSQL is the boring, correct choice.

### Why not Prisma?
Prisma is excellent for application developers. Drizzle is better for this project because:
- Migrations are explicit SQL, reviewed in code review
- No ORM magic; you control the queries
- Smaller runtime overhead
- Easier to test with transactions

### Why not JWT?
JWT is stateless, but stateless auth has tradeoffs:
- Can't revoke a token until expiry (logout doesn't work immediately)
- Harder to audit (who logged in when?)
- Larger payload in every request

Sessions (via Lucia) are simpler and more appropriate for a single-neighborhood app.

---

## Future Architecture Changes

### Phase 2: Email Verification
- Add `email_verified_at` to users
- Add email queue (Bull, simple cron)
- Hono middleware to enforce verification

### Phase 3: Events & Scraping
- Add events, organizers tables to schema
- Add background job queue for scrapers (Agenda or simple cron)
- API endpoints for event search, filtering

### Phase 4: Public API & Partners
- Expose read-only endpoints for partners
- Add API key authentication
- Webhook system for subscriptions

### Phase 5: Place Claims & Submissions
- Add claims table (user claims a place)
- Add submissions table (user submits event, editor approves)
- Audit log for transparency

---

## References

- [Lucia Auth Documentation](https://lucia-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Hono Documentation](https://hono.dev/)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [PostGIS Documentation](https://postgis.net/) (for Phase 1+)

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
