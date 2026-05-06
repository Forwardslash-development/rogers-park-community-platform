# Rogers Park Community Platform

A community-owned, neighborhood-scale events and venue knowledge graph for Rogers Park, Chicago.

**Status:** Auth MVP (v1.0) in development

---

## What Is This?

The Rogers Park Community Platform is a knowledge graph of every place where things happen in Rogers Park (bars, restaurants, venues, parks, galleries, religious spaces, civic institutions) and the events that occur there. It's built by the community, for the community—not a venture-backed startup.

**Success is not user growth.** Success is becoming quiet, durable infrastructure for one neighborhood that journalists, the Business Alliance, Loyola University, and civic technologists can build on.

---

## Philosophy

- **Community-first:** No outside funding, no engagement loops, no algorithm.
- **Aggregate before asking:** We pull from where organizers already post (Facebook, Eventbrite, Loyola calendar) before requiring behavior change.
- **Open data, open API:** All data is CC-BY licensed. Anyone can build on it.
- **Trust through presence:** The platform feels local, not like a startup.
- **Durable over flashy:** Slow and correct beats fast and broken.

---

## Tech Stack

- **Frontend:** SvelteKit (TypeScript PWA, SSR)
- **Backend:** Hono (TypeScript REST API)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Lucia sessions + Argon2 password hashing
- **Hosting:** Digital Ocean droplet + Cloudflare
- **Testing:** Vitest (unit/integration) + Playwright (e2e)
- **Approach:** Test-Driven Development (TDD)

**Why these choices?** See [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Project Phases

| Phase | Weeks | Goals |
|-------|-------|-------|
| **Phase 0** | 1–4 | Legal, licensing, infrastructure, tech stack |
| **Phase 1** | 5–12 | 200+ verified places (manual + OSM + Google) |
| **Phase 2** | 13–16 | Public read-only PWA (map, list, offline-capable) |
| **Phase 3** | 17–24 | Event aggregation (scraping, iCal feeds) |
| **Phase 4** | 25–32 | Anchor partnerships, embeddable widgets, public API |
| **Phase 5** | 33–44 | User accounts, place claims, native submissions |
| **Phase 6** | 45–52 | Volunteer editor program, sustainable maintenance |

We're in **Phase 0 → Phase 5 (Auth MVP):** Building user accounts, roles, and authentication.

---

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### Setup (5 minutes)

```bash
# Clone
git clone https://github.com/Forwardslash-development/rogers-park-community-platform.git
cd rogers-park-community-platform

# Install
pnpm install

# Environment
cp .env.example .env.local
# Edit .env.local with your database URL

# Database
pnpm run db:migrate

# Start
pnpm run dev
```

Visit:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001
- **API Health:** http://localhost:3001/api/v1/health

### Run Tests

```bash
pnpm test              # All tests
pnpm test:unit         # Unit only
pnpm test:integration  # Integration only
pnpm test:e2e          # E2E only
pnpm test --watch      # Watch mode
```

See [REPO-STRUCTURE.md](docs/REPO-STRUCTURE.md) for full setup details.

---

## Documentation

All documentation is in `/docs/`. Start here:

| Doc | Purpose |
|-----|---------|
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System design, tech stack rationale, deployment model |
| **[AUTH-SPECIFICATION.md](docs/AUTH-SPECIFICATION.md)** | Signup, login, logout flows; session management |
| **[API-CONTRACT.md](docs/API-CONTRACT.md)** | Complete API endpoint specifications with examples |
| **[TESTING-STRATEGY.md](docs/TESTING-STRATEGY.md)** | Test plan, TDD workflow, code examples |
| **[REPO-STRUCTURE.md](docs/REPO-STRUCTURE.md)** | Project layout, local setup, environment variables |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Deploy to Digital Ocean, production operations |
| **[DEVELOPER-WORKFLOW.md](docs/DEVELOPER-WORKFLOW.md)** | Git workflow, code review, style guide |

**Start with:** [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the big picture, then [REPO-STRUCTURE.md](docs/REPO-STRUCTURE.md) to set up locally.

---

## Current Status: Auth MVP (v1.0)

### Locked Features
- [x] User signup with email/password
- [x] Session-based login/logout
- [x] Role-based access control (foundation)
- [x] Protected routes
- [x] Comprehensive test coverage

### Not Yet Implemented
- [ ] Email verification
- [ ] Password reset
- [ ] OAuth (GitHub, Google)
- [ ] Place catalog
- [ ] Event aggregation
- [ ] Public API
- [ ] PWA offline support
- [ ] Volunteer editor program

---

## Development

### Philosophy
- **TDD:** Write tests first, implement second, refactor third
- **Small PRs:** Easy to review, easy to revert
- **Clear commits:** Rebase and squash, meaningful messages
- **No magic:** Explicit error handling, no hidden behavior

### Typical Session

```bash
# Create feature branch
git checkout -b feature/your-feature

# Start dev servers
pnpm run dev

# Write failing test (TDD step 1)
# Implement to pass (TDD step 2)
# Refactor (TDD step 3)
pnpm test:unit --watch

# Run full suite before committing
pnpm test

# Commit and push
git add .
git commit -m "feat(auth): <description>"
git push origin feature/your-feature

# Create PR on GitHub, request review
```

See [DEVELOPER-WORKFLOW.md](docs/DEVELOPER-WORKFLOW.md) for full workflow, git strategy, code style.

---

## Project Structure

```
rogers-park-community-platform/
├── frontend/                   # SvelteKit PWA
│   ├── src/routes/
│   ├── tests/e2e/
│   └── package.json
├── api/                        # Hono REST API
│   ├── src/routes/
│   ├── src/db/
│   ├── tests/unit/
│   ├── tests/integration/
│   └── package.json
├── shared/                     # Shared types, validation
│   ├── src/
│   └── package.json
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── AUTH-SPECIFICATION.md
│   ├── API-CONTRACT.md
│   ├── TESTING-STRATEGY.md
│   ├── REPO-STRUCTURE.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPER-WORKFLOW.md
├── docker-compose.yml          # Local PostgreSQL
├── pnpm-workspace.yaml         # Monorepo
├── .env.example
└── README.md
```

See [REPO-STRUCTURE.md](docs/REPO-STRUCTURE.md) for detailed layout.

---

## Common Tasks

```bash
# Development
pnpm run dev                    # Start both servers
pnpm test --watch              # Run tests in watch mode
pnpm lint                       # Lint all code
pnpm format                     # Format code

# Database
pnpm run db:migrate             # Run migrations
pnpm run db:studio              # Open DB UI
psql $DATABASE_URL              # Connect with psql

# Deployment
pnpm build                      # Build for production
pnpm test:coverage              # Coverage report

# Debugging
LOG_LEVEL=debug pnpm run dev    # Verbose logging
pnpm test:e2e --ui              # E2E in browser
```

See [REPO-STRUCTURE.md](docs/REPO-STRUCTURE.md#useful-commands) for full list.

---

## Contributing

1. **Read** [DEVELOPER-WORKFLOW.md](docs/DEVELOPER-WORKFLOW.md)
2. **Set up locally** ([REPO-STRUCTURE.md](docs/REPO-STRUCTURE.md))
3. **Create a branch** (`feature/description`)
4. **Write tests first** (TDD)
5. **Implement & refactor**
6. **Push & create PR**
7. **Address review feedback**
8. **Merge when approved**

---

## Deployment

### Development
Local machine with `pnpm run dev`.

### Production
Digital Ocean droplet ($5–6/month) with:
- PostgreSQL (local or managed)
- Supervisor (process management)
- Nginx (reverse proxy)
- Cloudflare (DNS, HTTPS, edge caching)

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full details.

---

## Security

- **Passwords:** Hashed with Argon2id
- **Sessions:** HttpOnly, Secure, SameSite=Lax cookies
- **Rate limiting:** 10 signups/hour, 5 logins/hour per IP
- **HTTPS:** Via Cloudflare (free tier)
- **No magic:** All security decisions are explicit and documented

See [AUTH-SPECIFICATION.md](docs/AUTH-SPECIFICATION.md#security-model) for full security model.

---

## Data Model

### Core Entities (future phases)

**Places** (durable)
- Venues, parks, restaurants, galleries, religious spaces, civic institutions
- Tags, hours, accessibility, photos, OSM/Google references, claim status

**Organizers** (separate from Places)
- People, groups, institutions that run events
- Can organize events at multiple locations

**Events** (ephemeral)
- Happens at a Place, organized by an Organizer
- RFC 5545 RRULE for recurrence
- Explicit source tracking (native/scraped/submitted)

**Subareas**
- Rogers Park micro-neighborhoods (East/West, Morse, Glenwood Arts District, etc.)
- Stored as polygons for point-in-polygon queries

See [ARCHITECTURE.md](docs/ARCHITECTURE.md#core-concepts) for full data model.

---

## API

### Current (Auth MVP)
- `POST /api/v1/auth/signup` — Create account
- `POST /api/v1/auth/login` — Log in
- `POST /api/v1/auth/logout` — Log out
- `GET /api/v1/auth/user` — Get current user
- `GET /api/v1/health` — Health check

### Future
- `GET /api/v1/places` — List venues
- `POST /api/v1/events` — Submit event
- `GET /api/v1/events` — Search events
- Webhooks for partner integrations

See [API-CONTRACT.md](docs/API-CONTRACT.md) for full specification.

---

## Testing

**Test pyramid:**
- **Unit tests** (Vitest): Password hashing, validation, logic
- **Integration tests** (Vitest + Supertest): API + database
- **E2E tests** (Playwright): Full user journeys (signup → login → dashboard)

**Coverage targets:**
- Auth logic: 90%+
- API endpoints: 80%+
- E2E: Critical paths only

See [TESTING-STRATEGY.md](docs/TESTING-STRATEGY.md) for full strategy and code examples.

---

## Roadmap

**v1.0 (Auth MVP)** — In progress
- User accounts, roles, authentication
- Secure sessions, password hashing
- Protected routes, role-based access
- Comprehensive tests

**v1.1** — Phase 1 foundation
- Email verification
- Password reset
- Place catalog (manual)

**v1.2 → v2.0** — Phases 2-6
- Public PWA (map, list, offline)
- Event aggregation (scraping)
- Public API
- Partnership program

---

## Legal & Licensing

**Data Licensing:** CC-BY (Creative Commons Attribution)
- All user-submitted data is publicly available under CC-BY
- You can use it, remix it, as long as you credit Rogers Park Community Platform

**Code Licensing:** TBD (likely MIT or Apache 2.0)

**Legal Entity:** TBD (sole proprietor, LLC, 501(c)(3), fiscally sponsored)

---

## Support & Questions

This is a community project. Questions? Issues? Ideas?

- **GitHub Issues:** Bug reports, feature requests, discussions
- **Documentation:** Start with [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Code Review:** All changes go through PR + review

---

## Credits

Built by the Rogers Park community. For the Rogers Park community.

---

**Last Updated:** May 2026  
**Version:** 1.0.0-alpha (Auth MVP)  
**Maintainer:** [Your Name / Team]
