# Repo Structure & Setup Guide
## Rogers Park Community Platform — Auth MVP (v1.0)

**Last Updated:** May 2026  
**Status:** Active  
**Audience:** Developers

---

## Project Layout

```
rogers-park-community-platform/
├── .github/
│   └── workflows/
│       └── test.yml                    # CI/CD pipeline
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +layout.svelte          # Root layout (auth middleware)
│   │   │   ├── +layout.server.ts       # Load authenticated user
│   │   │   ├── +page.svelte            # Home page
│   │   │   ├── signup/
│   │   │   │   ├── +page.svelte        # Signup form
│   │   │   │   └── +page.server.ts     # Form action handler
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte        # Login form
│   │   │   │   └── +page.server.ts     # Form action handler
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte        # Authenticated dashboard
│   │   │   │   └── +page.server.ts     # Load user data
│   │   │   └── logout/
│   │   │       └── +server.ts          # Logout action
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client functions
│   │   │   ├── auth.ts                 # Auth state/utils
│   │   │   └── components/
│   │   │       ├── Header.svelte
│   │   │       ├── Footer.svelte
│   │   │       └── LoginForm.svelte
│   │   ├── app.css                     # Global styles (Tailwind)
│   │   └── app.html                    # HTML shell
│   ├── tests/
│   │   └── e2e/
│   │       └── auth.spec.ts            # Playwright tests
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
│
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts                 # Auth endpoints
│   │   │   ├── health.ts               # Health check
│   │   │   └── index.ts                # Route exports
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # Session validation
│   │   │   └── errorHandler.ts         # Error formatting
│   │   ├── db/
│   │   │   ├── schema.ts               # Drizzle schema
│   │   │   ├── client.ts               # Database client
│   │   │   ├── migrations/
│   │   │   │   ├── 001_create_users.sql
│   │   │   │   └── 002_create_sessions.sql
│   │   │   └── seed.ts                 # Database seeding
│   │   ├── services/
│   │   │   ├── user.ts                 # User business logic
│   │   │   ├── auth.ts                 # Auth business logic
│   │   │   └── session.ts              # Session management
│   │   ├── utils/
│   │   │   ├── password.ts             # Password hashing/verification
│   │   │   ├── validation.ts           # Input validation
│   │   │   ├── errors.ts               # Error definitions
│   │   │   └── logger.ts               # Logging
│   │   ├── types/
│   │   │   └── index.ts                # Shared TypeScript types
│   │   ├── app.ts                      # Hono app initialization
│   │   └── server.ts                   # Server entry point
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── auth.test.ts            # Password hashing tests
│   │   │   ├── validation.test.ts      # Validation tests
│   │   │   └── errors.test.ts          # Error handling tests
│   │   ├── integration/
│   │   │   ├── setup.ts                # Test database setup
│   │   │   ├── fixtures.ts             # Test data
│   │   │   ├── auth-signup.test.ts
│   │   │   ├── auth-login.test.ts
│   │   │   ├── auth-logout.test.ts
│   │   │   ├── auth-user.test.ts
│   │   │   └── health.test.ts
│   │   └── mocks/
│   │       └── db.ts                   # Database mocks
│   ├── package.json
│   ├── vitest.config.ts
│   └── README.md
│
├── shared/
│   ├── src/
│   │   ├── types.ts                    # Shared TypeScript types
│   │   ├── constants.ts                # Shared constants
│   │   └── validation.ts               # Shared validation rules
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── 01-ARCHITECTURE.md              # Technical architecture
│   ├── 02-AUTH-SPECIFICATION.md        # Auth MVP spec
│   ├── 03-API-CONTRACT.md              # API endpoints
│   ├── 04-TESTING-STRATEGY.md          # Testing approach
│   ├── 05-REPO-STRUCTURE.md            # This file
│   ├── 06-DEPLOYMENT.md                # Deployment guide
│   └── 07-DEVELOPER-WORKFLOW.md        # Development workflow
│
├── docker-compose.yml                  # Local PostgreSQL + Redis (future)
├── .env.example                        # Environment variables template
├── .env.local                          # Local env (not committed)
├── .gitignore
├── pnpm-workspace.yaml                 # PNPM monorepo config
├── turbo.json                          # Build/test orchestration
├── README.md                           # Project overview
└── package.json                        # Root package.json

```

---

## Setup Instructions

### Prerequisites

- **Node.js 18+** (use `nvm` or `fnm` to manage versions)
- **pnpm 8+** (faster, stricter than npm)
- **PostgreSQL 14+** (local or Docker)
- **Git**

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/rogerspan/community-platform.git
cd rogers-park-community-platform

# Install pnpm globally (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install
```

### 2. Set Up Environment Variables

Copy the example file and edit:

```bash
cp .env.example .env.local
```

**`.env.local` (never commit this):**

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rogerspan_dev
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5432/rogerspan_test

# API
API_PORT=3001
API_HOST=localhost
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:3001

# Sessions
SESSION_SECRET=your-super-secret-key-change-in-production-min-32-chars

# Rate limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# Logging
LOG_LEVEL=debug

# Email (for Phase 2)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASS=test
```

**`.env.example` (commit this as template):**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rogerspan_dev
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5432/rogerspan_test
API_PORT=3001
API_HOST=localhost
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:3001
SESSION_SECRET=change-me-in-production
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
LOG_LEVEL=debug
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASS=test
```

### 3. Start PostgreSQL

**Option A: Docker (recommended for local dev)**

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker-compose ps

# Connect to it
psql postgresql://postgres:postgres@localhost:5432/rogerspan_dev
```

**Option B: Local PostgreSQL**

```bash
# Create databases
createdb rogerspan_dev
createdb rogerspan_test

# Verify
psql -l | grep rogerspan
```

### 4. Run Migrations

```bash
# From api/ directory
cd api

# Run migrations on dev database
pnpm run db:migrate

# Run migrations on test database
pnpm run db:migrate:test

# Verify tables were created
psql postgresql://postgres:postgres@localhost:5432/rogerspan_dev -c "\dt"
```

### 5. Start Development Servers

```bash
# From root
pnpm run dev
```

This starts both servers concurrently:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

Or run separately:

```bash
# Terminal 1: Frontend
cd frontend && pnpm run dev

# Terminal 2: API
cd api && pnpm run dev
```

### 6. Run Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests only
pnpm test:e2e

# Watch mode (development)
pnpm test:unit --watch

# Coverage report
pnpm test:coverage
```

---

## Package Structure

### Root `package.json`

Orchestrates the monorepo:

```json
{
  "name": "@rogerspan/community-platform",
  "private": true,
  "workspaces": [
    "frontend",
    "api",
    "shared"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:unit": "turbo run test:unit",
    "test:integration": "turbo run test:integration",
    "test:e2e": "turbo run test:e2e",
    "test:coverage": "turbo run test:coverage",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "clean": "turbo run clean && rm -rf node_modules"
  }
}
```

### Frontend `package.json`

```json
{
  "name": "@rogerspan/frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "svelte": "^4.0.0"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@playwright/test": "^1.40.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### API `package.json`

```json
{
  "name": "@rogerspan/api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:unit": "vitest --run tests/unit",
    "test:integration": "vitest --run tests/integration",
    "test:coverage": "vitest --coverage",
    "db:migrate": "drizzle-kit migrate:run --config drizzle.config.ts",
    "db:migrate:test": "DATABASE_URL=$DATABASE_TEST_URL drizzle-kit migrate:run --config drizzle.config.ts",
    "db:studio": "drizzle-kit studio",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "hono": "^3.11.0",
    "drizzle-orm": "^0.28.0",
    "pg": "^8.11.0",
    "argon2": "^0.31.0",
    "lucia": "^2.7.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "supertest": "^6.3.0",
    "@vitest/ui": "^1.0.0",
    "drizzle-kit": "^0.20.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### Shared `package.json`

```json
{
  "name": "@rogerspan/shared",
  "type": "module",
  "description": "Shared types and utilities",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./validation": "./src/validation.ts"
  },
  "scripts": {
    "build": "tsc",
    "lint": "eslint src"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

---

## Environment Variables Reference

### Database

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `DATABASE_URL` | String | Yes | `postgresql://user:pass@localhost:5432/db` | Production connection string |
| `DATABASE_TEST_URL` | String | Yes | `postgresql://user:pass@localhost:5432/db_test` | Test database connection |

### API

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `API_PORT` | Number | Yes | `3001` | Port API listens on |
| `API_HOST` | String | Yes | `localhost` | Host API binds to |
| `NODE_ENV` | String | Yes | `development` | `development`, `test`, `production` |
| `PUBLIC_API_URL` | String | Yes | `http://localhost:3001` | Frontend URL for API calls |
| `SESSION_SECRET` | String | Yes | `secret-min-32-chars` | Session token signing key |

### Frontend

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `FRONTEND_URL` | String | No | `http://localhost:5173` | For redirects, CORS |
| `PUBLIC_API_URL` | String | Yes | `http://localhost:3001` | API endpoint for frontend |

### Rate Limiting

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `RATE_LIMIT_WINDOW_MS` | Number | Yes | `3600000` | 1 hour in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | Number | Yes | `10` | Max requests per window per IP |

### Logging

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `LOG_LEVEL` | String | No | `debug` | `debug`, `info`, `warn`, `error` |

---

## Development Workflow

### Daily Development

```bash
# Start both servers
pnpm run dev

# In another terminal, run tests in watch mode
pnpm test:unit --watch

# Or run all tests
pnpm test --watch
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/auth-signup
   ```

2. **Write failing test** (TDD)
   ```bash
   # Edit tests/integration/auth-signup.test.ts
   # Add test case
   ```

3. **Run test, watch it fail**
   ```bash
   pnpm test:integration --watch
   ```

4. **Implement to pass test**
   ```bash
   # Edit src/routes/auth.ts, src/services/user.ts, etc.
   ```

5. **Test passes**
   ```bash
   # All tests pass, run full suite
   pnpm test
   ```

6. **Commit & push**
   ```bash
   git add .
   git commit -m "feat(auth): add signup endpoint"
   git push origin feature/auth-signup
   ```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# All at once
pnpm run check
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  email_verified_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## Useful Commands

### Development

```bash
# Start all services
pnpm run dev

# Start specific service
cd frontend && pnpm run dev
cd api && pnpm run dev

# Watch for changes and recompile
pnpm run build:watch
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test:unit -- password.test.ts

# Generate coverage report
pnpm test:coverage

# Run E2E tests in UI mode
pnpm test:e2e --ui
```

### Database

```bash
# Run migrations
cd api && pnpm run db:migrate

# Seed database
cd api && pnpm run db:seed

# Open Drizzle Studio (visual DB explorer)
cd api && pnpm run db:studio

# Connect to dev database with psql
psql $DATABASE_URL

# Connect to test database
psql $DATABASE_TEST_URL
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Format all code
pnpm format

# Type check
pnpm type-check
```

### Build & Deploy

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build -F "@rogerspan/api"

# Start production server
cd api && pnpm start
```

---

## Troubleshooting

### Database connection fails

```bash
# Check PostgreSQL is running
docker-compose ps

# If not running, start it
docker-compose up -d

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port already in use

```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use different port
API_PORT=3002 pnpm run dev
```

### Node modules issues

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or use pnpm's clean
pnpm clean
pnpm install
```

### Tests failing

```bash
# Run with verbose output
pnpm test -- --reporter=verbose

# Run specific test
pnpm test -- auth.test.ts

# Debug mode
pnpm test -- --inspect-brk

# Check test database is clean
pnpm run db:migrate:test
```

---

## Next Steps

1. **Complete setup above** (clone, install, env vars, migrate)
2. **Read** [07-DEVELOPER-WORKFLOW.md](07-DEVELOPER-WORKFLOW.md)
3. **Start with test**: Create first unit test for password hashing
4. **Implement to pass** test
5. **Expand** to integration test for signup endpoint
6. **Continue** iterating TDD

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
