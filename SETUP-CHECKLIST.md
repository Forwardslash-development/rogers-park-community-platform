# Setup Checklist

This checklist guides you through the initial steps to get your repo ready for development.

## Repository Setup

- [ ] You've created the GitHub repo: `rogers-park-community-platform`
- [ ] You've cloned locally and set up the git remote
- [ ] All documentation files are in `/docs/` directory
- [ ] Root files (README, QUICKSTART, package.json, etc.) are in repo root

## File Structure

Your repo should now contain:

```
rogers-park-community-platform/
├── .env.example              ✓ Created
├── .gitignore                ✓ Created
├── README.md                 ✓ Created
├── QUICKSTART.md             ✓ Created
├── package.json              ✓ Created (root monorepo config)
├── pnpm-workspace.yaml       ✓ Created
├── turbo.json                ✓ Created
├── docker-compose.yml        ✓ Created
├── docs/
│   ├── 00-INDEX.md           ✓ Created (read this first!)
│   ├── ARCHITECTURE.md       ✓ Created
│   ├── AUTH-SPECIFICATION.md ✓ Created
│   ├── API-CONTRACT.md       ✓ Created
│   ├── TESTING-STRATEGY.md   ✓ Created
│   ├── REPO-STRUCTURE.md     ✓ Created
│   ├── DEPLOYMENT.md         ✓ Created
│   └── DEVELOPER-WORKFLOW.md ✓ Created
└── (frontend/, api/, shared/ — create next)
```

## Next Steps

### 1. Create Subdirectory Structure

```bash
mkdir -p frontend api shared
```

### 2. Push All Documentation to GitHub

```bash
git add .
git commit -m "docs: add complete project documentation and setup files"
git push origin main
```

### 3. Set Up Frontend (SvelteKit)

From `docs/REPO-STRUCTURE.md`, create frontend with SvelteKit scaffolding.

### 4. Set Up API (Hono)

From `docs/REPO-STRUCTURE.md`, create API with Hono scaffolding.

### 5. Set Up Shared

From `docs/REPO-STRUCTURE.md`, create shared types and validation.

### 6. First Test Run

```bash
pnpm install
pnpm run db:migrate
pnpm test
```

## Documentation Review

- [ ] Read `docs/00-INDEX.md` (navigation guide)
- [ ] Read `docs/ARCHITECTURE.md` (system overview)
- [ ] Read `docs/REPO-STRUCTURE.md` (detailed setup)
- [ ] Read `docs/DEVELOPER-WORKFLOW.md` (how we work)
- [ ] Skim `docs/TESTING-STRATEGY.md` (test approach)

## Initial Scaffolding Decisions

Before we scaffold the frontend, API, and shared packages, I need to confirm a few things:

- [ ] Ready to start building monorepo structure? (frontend, api, shared)
- [ ] Want me to scaffold all package.json files and TypeScript configs?
- [ ] Want first test + implementation code to follow TDD?
- [ ] Any customizations to the tech stack choices?

## Files Provided

### Root Configuration
- **package.json** — Root monorepo config, orchestrates dev/test/build
- **pnpm-workspace.yaml** — Defines monorepo packages
- **turbo.json** — Task orchestration and caching
- **docker-compose.yml** — Local PostgreSQL (dev + test)
- **.env.example** — Template for environment variables
- **.gitignore** — Standard Node.js ignores

### Documentation (all in `/docs/`)
- **00-INDEX.md** — Start here! Navigation guide for all docs
- **ARCHITECTURE.md** — Technical system design (SvelteKit + Hono + PG)
- **AUTH-SPECIFICATION.md** — Auth flows (signup, login, logout)
- **API-CONTRACT.md** — OpenAPI-style endpoint specs
- **TESTING-STRATEGY.md** — TDD workflow and test examples
- **REPO-STRUCTURE.md** — Project layout and local setup
- **DEPLOYMENT.md** — Digital Ocean deployment and operations
- **DEVELOPER-WORKFLOW.md** — Git, code review, team practices

### Top-Level Documentation
- **README.md** — Project overview and quick start
- **QUICKSTART.md** — 15-minute setup guide
- **SETUP-CHECKLIST.md** — This file

## Ready to Code?

Once you've reviewed the docs and confirmed scaffolding decisions, we'll:

1. Create frontend package (SvelteKit + Vite + TypeScript)
2. Create API package (Hono + Node + TypeScript)
3. Create shared package (types, validation)
4. Write first unit test (password hashing)
5. Implement to pass test
6. Continue TDD for auth endpoints

Let me know when you're ready!
