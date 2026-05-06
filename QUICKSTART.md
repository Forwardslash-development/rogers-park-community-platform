# Quick Start Guide

Get the Rogers Park Community Platform running locally in 15 minutes.

---

## Prerequisites (5 min)

- **Node.js 18+**: Install from https://nodejs.org/ or use `nvm`
  ```bash
  node --version  # Should be v18+
  ```

- **pnpm 8+**: Install globally
  ```bash
  npm install -g pnpm
  pnpm --version  # Should be 8.x+
  ```

- **PostgreSQL 14+**: Either:
  - Install locally: https://www.postgresql.org/download/
  - Or use Docker: `docker-compose up -d` (this file included)

- **Git**: For cloning and version control

---

## Setup (10 min)

### 1. Clone Repository

```bash
git clone https://github.com/Forwardslash-development/rogers-park-community-platform.git
cd rogers-park-community-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Database

**Option A: Docker (recommended, easiest)**

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker-compose ps

# You should see postgres running on 5432
```

**Option B: Local PostgreSQL**

```bash
# Create databases
createdb rogerspan_dev
createdb rogerspan_test

# Verify
psql -l | grep rogerspan
```

### 4. Set Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local (optional for local dev, defaults work)
# Only edit if you have custom database setup
```

### 5. Run Database Migrations

```bash
# This creates tables (users, sessions)
pnpm run db:migrate
```

### 6. Start Development Servers

```bash
# Start both frontend and API
pnpm run dev
```

You should see:
```
> rogerspan-frontend dev
> vite dev

  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

And in another output:
```
> rogerspan-api dev
> tsx watch src/server.ts

Listening on port 3001
```

---

## Verify It Works

Open in your browser:
- **Frontend:** http://localhost:5173
- **API health check:** http://localhost:3001/api/v1/health

Both should respond. API returns:
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-05T14:30:00Z",
    "version": "v1"
  },
  "meta": { ... }
}
```

---

## Run Tests

```bash
# All tests (unit + integration)
pnpm test

# Just unit tests
pnpm test:unit

# Just integration tests
pnpm test:integration

# Watch mode (re-runs on file change)
pnpm test:unit --watch
```

All tests should pass.

---

## Next Steps

1. **Read the docs**
   - Start with: `docs/00-INDEX.md` (navigation)
   - Then: `docs/ARCHITECTURE.md` (overview)

2. **Write your first test** (TDD)
   ```bash
   # Watch mode for development
   pnpm test:unit --watch
   
   # Create tests/unit/password.test.ts
   # Write test for password hashing
   # Watch it fail, then implement
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

4. **Read** `docs/DEVELOPER-WORKFLOW.md` (how we work together)

---

## Common Commands

```bash
# Development
pnpm run dev               # Start both servers
pnpm test --watch         # Run tests in watch mode
pnpm lint                  # Lint all code
pnpm format                # Format code

# Database
pnpm run db:migrate        # Run migrations
pnpm run db:studio         # Open database UI

# Building
pnpm build                 # Build for production

# Debugging
LOG_LEVEL=debug pnpm dev   # Verbose logging
pnpm test:e2e --ui         # E2E tests in browser
```

---

## Troubleshooting

### "Database connection refused"
```bash
# Check PostgreSQL is running
docker-compose ps

# Start it if not running
docker-compose up -d

# Or check local PostgreSQL
psql -l
```

### "Port 5173 already in use"
```bash
# Find what's using it
lsof -i :5173

# Or use different port
VITE_PORT=5174 pnpm run dev
```

### "pnpm: command not found"
```bash
# Install pnpm globally
npm install -g pnpm

# Verify
pnpm --version
```

### Tests fail
```bash
# Ensure database is running
docker-compose ps

# Run migrations
pnpm run db:migrate

# Try again
pnpm test
```

---

## Documentation

Full docs in `docs/`:

| Document | Purpose |
|----------|---------|
| `docs/00-INDEX.md` | **START HERE** — Navigation guide |
| `docs/ARCHITECTURE.md` | System design and tech stack |
| `docs/REPO-STRUCTURE.md` | Full setup guide (more detail) |
| `docs/DEVELOPER-WORKFLOW.md` | Git, code style, team practices |
| `docs/TESTING-STRATEGY.md` | How to write tests |
| `docs/AUTH-SPECIFICATION.md` | Auth flows in detail |
| `docs/API-CONTRACT.md` | API endpoint specs |
| `docs/DEPLOYMENT.md` | Deploy to production |

---

## What Now?

1. ✅ Environment is running
2. ✅ Tests are passing
3. **Next:** Read `docs/ARCHITECTURE.md` (20 min) for the big picture
4. **Then:** Read `docs/DEVELOPER-WORKFLOW.md` (25 min) for how we work
5. **Finally:** Write your first test and feature

---

**Problems?** Check `docs/REPO-STRUCTURE.md#troubleshooting` or GitHub Issues.

Enjoy! 🚀
