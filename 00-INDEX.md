# Documentation Index

Welcome to the Rogers Park Community Platform documentation. Use this page to navigate and understand the project structure.

---

## For Different Audiences

### 👤 I'm New to the Project
Start here:
1. Read the [main README](../README.md) (5 min overview)
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) (understand the system)
3. Read [REPO-STRUCTURE.md](REPO-STRUCTURE.md) (set up locally)

### 👨‍💻 I Want to Start Coding
1. [REPO-STRUCTURE.md](REPO-STRUCTURE.md) — Local setup (15 min)
2. [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md) — Git and TDD process
3. [TESTING-STRATEGY.md](TESTING-STRATEGY.md) — How to write tests first
4. Start with first test: `pnpm test:unit -- password.test.ts`

### 🏗️ I Want to Understand the Architecture
1. [ARCHITECTURE.md](ARCHITECTURE.md) — System design, tech stack, security
2. [API-CONTRACT.md](API-CONTRACT.md) — What endpoints exist and how they work
3. [AUTH-SPECIFICATION.md](AUTH-SPECIFICATION.md) — Auth flows in detail
4. [DEPLOYMENT.md](DEPLOYMENT.md) — How it runs in production

### 🧪 I Want to Understand Testing
1. [TESTING-STRATEGY.md](TESTING-STRATEGY.md) — Complete test plan with examples
2. Start writing: `pnpm test:unit --watch`

### 🚀 I'm Deploying to Production
1. [DEPLOYMENT.md](DEPLOYMENT.md) — Full deployment guide (Digital Ocean, Nginx, etc.)
2. [REPO-STRUCTURE.md](REPO-STRUCTURE.md#environment-variables-reference) — Environment variables

---

## Document Overview

### [README.md](../README.md) — Project Overview
**Audience:** Everyone  
**Purpose:** Quick intro, project philosophy, quick start  
**Read time:** 5 minutes

- What is this project?
- Philosophy and success metrics
- Tech stack overview
- Quick start (5 min setup)
- Links to detailed docs

### [ARCHITECTURE.md](ARCHITECTURE.md) — Technical Architecture
**Audience:** Developers, architects  
**Purpose:** System design, tech choices, security model  
**Read time:** 20 minutes

- Deployment model (single droplet, two processes)
- Technology stack with rationale (SvelteKit, Hono, PostgreSQL, Lucia)
- API design principles
- Security model (passwords, sessions, HTTPS)
- Data storage (schema overview)
- Future architecture changes by phase

**Key sections:**
- System architecture diagram
- Why not [Next.js/Prisma/JWT/etc.]?
- Technology choices and tradeoffs

### [AUTH-SPECIFICATION.md](AUTH-SPECIFICATION.md) — Auth MVP Specification
**Audience:** Developers, QA  
**Purpose:** Detailed signup/login/logout flows  
**Read time:** 15 minutes

- User account model (schema, roles)
- Signup flow (request, validation, response, errors)
- Login flow (credentials, rate limiting)
- Logout flow (session revocation, cookie clearing)
- Session management (lifecycle, expiration, cleanup)
- Authentication middleware (SvelteKit, Hono)
- Error handling (client-side, server-side)
- Security checklist
- Future enhancements by phase

**Use this when:**
- Building the auth endpoints
- Testing signup/login/logout
- Implementing session validation

### [API-CONTRACT.md](API-CONTRACT.md) — API Specification
**Audience:** Frontend developers, external partners (future)  
**Purpose:** OpenAPI-style endpoint specs with examples  
**Read time:** 15 minutes

- Response format (success/error envelopes)
- All auth endpoints:
  - `POST /auth/signup` — Create account
  - `POST /auth/login` — Log in
  - `POST /auth/logout` — Log out
  - `GET /auth/user` — Get current user
  - `GET /health` — Health check
- Validation rules for each endpoint
- Rate limiting headers
- Error codes and meanings
- cURL examples

**Use this when:**
- Building frontend forms that call the API
- Testing endpoints with Postman or cURL
- Documenting for partners

### [TESTING-STRATEGY.md](TESTING-STRATEGY.md) — Testing Plan & Examples
**Audience:** Developers, QA  
**Purpose:** Test-driven development workflow with code examples  
**Read time:** 30 minutes

- Test pyramid (unit, integration, e2e)
- Coverage targets (90% auth logic, 80% API)
- Unit test specs with code (password hashing, validation)
- Integration test specs with code (Hono endpoints with Supertest)
- E2E test specs (Playwright user journeys)
- Test data and fixtures
- TDD workflow (red → green → refactor)
- Test review checklist
- GitHub Actions CI/CD example

**Use this when:**
- Writing your first test
- Following TDD (test first, code second)
- Setting up test environment

### [REPO-STRUCTURE.md](REPO-STRUCTURE.md) — Setup & Structure Guide
**Audience:** Developers (first time setup)  
**Purpose:** Local development setup, environment variables, repo layout  
**Read time:** 20 minutes

- Full project layout (frontend, api, shared, docs)
- Prerequisites (Node 18+, pnpm, PostgreSQL)
- Step-by-step setup (clone, install, env, migrate, start)
- Running tests
- Package.json structure
- Environment variables reference
- Useful commands (dev, test, lint, db)
- Troubleshooting common issues
- Database schema (users, sessions tables)

**Use this when:**
- Setting up project for first time
- Stuck on "what's my DATABASE_URL?"
- "What commands do I run?"

### [DEPLOYMENT.md](DEPLOYMENT.md) — Production Operations
**Audience:** Operators, DevOps, founder  
**Purpose:** Deploy to Digital Ocean, manage production, backups  
**Read time:** 30 minutes

- Pre-deployment checklist
- Digital Ocean droplet setup (SSH, dependencies, PostgreSQL)
- Application deployment (clone, install, migrations, env)
- Process management (Supervisor for keeping services running)
- Nginx reverse proxy configuration
- Cloudflare DNS and SSL setup
- Database backups (manual, cron, S3)
- Monitoring and logging
- Deployment process (manual + GitHub Actions CI/CD)
- Scaling considerations (when and how)
- Security hardening (firewall, SSH, updates)
- Troubleshooting common issues
- Disaster recovery
- Cost breakdown

**Use this when:**
- Deploying to production for first time
- Setting up monitoring
- Need to restore from backup
- Scaling beyond single droplet

### [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md) — Development Practices
**Audience:** All developers  
**Purpose:** Git workflow, code review, style guide, team conventions  
**Read time:** 25 minutes

- Git workflow (branching, commits, PRs)
- Commit message format (Conventional Commits)
- Code review guidelines
- Local development (daily start, TDD cycle)
- Code style (TypeScript, naming, comments)
- Testing practices (AAA pattern, error testing)
- Documentation updates
- Release process (semantic versioning)
- Debugging techniques
- FAQ

**Use this when:**
- Creating a feature branch
- Writing a commit message
- Submitting a PR
- Reviewing someone else's code
- Debugging a problem

---

## Quick Reference

### By Task

**I want to...**

| Task | Document | Section |
|------|----------|---------|
| Set up my dev environment | [REPO-STRUCTURE.md](REPO-STRUCTURE.md) | Setup Instructions |
| Understand the project | [ARCHITECTURE.md](ARCHITECTURE.md) | System Architecture |
| Write my first test | [TESTING-STRATEGY.md](TESTING-STRATEGY.md) | Unit Test Specs |
| Create a feature branch | [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md) | Git Workflow |
| Call an API endpoint | [API-CONTRACT.md](API-CONTRACT.md) | Endpoints |
| Deploy to production | [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment Process |
| Implement auth signup | [AUTH-SPECIFICATION.md](AUTH-SPECIFICATION.md) | Signup Flow |
| Debug a test failure | [TESTING-STRATEGY.md](TESTING-STRATEGY.md) | TDD Workflow |
| Restore from backup | [DEPLOYMENT.md](DEPLOYMENT.md) | Disaster Recovery |

### By Technology

**Learning about...**

| Tech | Primary Doc | Secondary |
|------|-------------|-----------|
| SvelteKit frontend | [ARCHITECTURE.md](ARCHITECTURE.md#frontend-sveltekit) | [REPO-STRUCTURE.md](REPO-STRUCTURE.md#frontend-packagejson) |
| Hono API | [ARCHITECTURE.md](ARCHITECTURE.md#api-hono) | [API-CONTRACT.md](API-CONTRACT.md) |
| PostgreSQL + Drizzle | [ARCHITECTURE.md](ARCHITECTURE.md#database-postgresql--drizzle) | [REPO-STRUCTURE.md](REPO-STRUCTURE.md#database-schema) |
| Lucia sessions | [AUTH-SPECIFICATION.md](AUTH-SPECIFICATION.md#session-management) | [ARCHITECTURE.md](ARCHITECTURE.md#session-security) |
| Vitest + Supertest | [TESTING-STRATEGY.md](TESTING-STRATEGY.md) | [REPO-STRUCTURE.md](REPO-STRUCTURE.md#test-execution) |
| Playwright E2E | [TESTING-STRATEGY.md](TESTING-STRATEGY.md#end-to-end-tests-playwright) | [REPO-STRUCTURE.md](REPO-STRUCTURE.md#running-tests) |
| Nginx + Cloudflare | [DEPLOYMENT.md](DEPLOYMENT.md#nginx-reverse-proxy) | [ARCHITECTURE.md](ARCHITECTURE.md#deployment-model) |

---

## Document Relationships

```
README.md (overview)
    ↓
ARCHITECTURE.md (system design)
    ├── AUTH-SPECIFICATION.md (auth details)
    │   └── TESTING-STRATEGY.md (how to test it)
    │       └── DEVELOPER-WORKFLOW.md (how to code it)
    │
    ├── API-CONTRACT.md (endpoint specs)
    │   └── TESTING-STRATEGY.md (API tests)
    │
    └── DEPLOYMENT.md (production)
        └── REPO-STRUCTURE.md (setup for prod)

REPO-STRUCTURE.md (local setup)
    └── DEVELOPER-WORKFLOW.md (daily workflow)
```

---

## Common Documentation Paths

### For a Bug Fix

1. Reproduce locally → [REPO-STRUCTURE.md](REPO-STRUCTURE.md#troubleshooting)
2. Write failing test → [TESTING-STRATEGY.md](TESTING-STRATEGY.md#tdd-workflow)
3. Fix code → [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md#making-changes-tdd)
4. Create PR → [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md#creating-a-pr)
5. Address review → [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md#reviewing-a-pr)

### For a New Feature

1. Read spec → [AUTH-SPECIFICATION.md](AUTH-SPECIFICATION.md) (for auth)
2. Write tests → [TESTING-STRATEGY.md](TESTING-STRATEGY.md)
3. Implement → [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md)
4. Update docs → [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md#update-docs-when-coding)
5. Deploy → [DEPLOYMENT.md](DEPLOYMENT.md)

### For Joining the Project

1. Read [README.md](../README.md) (5 min)
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) (20 min)
3. Set up locally → [REPO-STRUCTURE.md](REPO-STRUCTURE.md) (15 min)
4. Read [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md) (25 min)
5. Write first test → [TESTING-STRATEGY.md](TESTING-STRATEGY.md)
6. Create first PR

---

## Document Maintenance

Each document has:
- **Last Updated:** Date when it was reviewed/updated
- **Status:** Active, Archived, Draft
- **Audience:** Who should read it
- **Read time:** Estimated minutes

When docs change:
- Update the "Last Updated" date
- Note breaking changes prominently
- Keep old versions if deprecated

---

## Frequently Used Sections

### By New Developer
- [REPO-STRUCTURE.md — Setup](REPO-STRUCTURE.md#setup-instructions)
- [DEVELOPER-WORKFLOW.md — Feature Branch Workflow](DEVELOPER-WORKFLOW.md#feature-branch-workflow)
- [TESTING-STRATEGY.md — TDD Workflow](TESTING-STRATEGY.md#tdd-workflow)

### By Code Reviewer
- [DEVELOPER-WORKFLOW.md — Code Review](DEVELOPER-WORKFLOW.md#code-review)
- [TESTING-STRATEGY.md — Test Review Checklist](TESTING-STRATEGY.md#test-review-checklist)

### By DevOps/Operator
- [DEPLOYMENT.md — Pre-Deployment Checklist](DEPLOYMENT.md#pre-deployment-checklist)
- [DEPLOYMENT.md — Monitoring & Logging](DEPLOYMENT.md#monitoring--logging)
- [DEPLOYMENT.md — Troubleshooting](DEPLOYMENT.md#troubleshooting)

### By API Consumer (future)
- [API-CONTRACT.md — All Endpoints](API-CONTRACT.md#endpoints)
- [API-CONTRACT.md — Error Handling](API-CONTRACT.md#error-handling)
- [API-CONTRACT.md — cURL Examples](API-CONTRACT.md#curl-examples)

---

## How to Update Documentation

1. **Make the change** to the relevant document
2. **Update the date:** Change "Last Updated" to today
3. **Update the status:** If it's a breaking change, note it
4. **Create a commit:** `docs(section): what changed`
5. **Create PR:** Request review just like code

---

## Questions?

- **Project scope?** → [README.md](../README.md#what-is-this)
- **How to code?** → [DEVELOPER-WORKFLOW.md](DEVELOPER-WORKFLOW.md)
- **How to test?** → [TESTING-STRATEGY.md](TESTING-STRATEGY.md)
- **How to deploy?** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **What's the API?** → [API-CONTRACT.md](API-CONTRACT.md)
- **How does auth work?** → [AUTH-SPECIFICATION.md](AUTH-SPECIFICATION.md)

---

**Last Updated:** May 2026  
**Status:** Active
