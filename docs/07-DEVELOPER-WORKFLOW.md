# Developer Workflow
## Rogers Park Community Platform — Auth MVP (v1.0)

**Last Updated:** May 2026  
**Status:** Active  
**Audience:** Developers, maintainers

---

## Overview

This document defines how we work together on this project: branching, commits, code review, testing, and conventions.

**Principles:**
- TDD: Tests first, implementation second
- Clear commit history: Rebase and squash, meaningful messages
- Small PRs: Easy to review, easy to revert
- Async-friendly: Clear communication via commits and PR descriptions

---

## Git Workflow

### Branching Strategy

We use a simple trunk-based development model with feature branches.

```
main (production)
└── feature/auth-signup (your branch)
    └── commit: "test: add signup validation tests"
    └── commit: "feat(auth): implement signup endpoint"
    └── commit: "refactor(auth): extract password hashing logic"
```

**Branch naming:**
- `feature/description` — New features (e.g., `feature/auth-login`)
- `fix/description` — Bug fixes (e.g., `fix/session-expiry`)
- `docs/description` — Documentation (e.g., `docs/api-contract`)
- `refactor/description` — Refactoring (e.g., `refactor/error-handling`)

**Never commit directly to `main`.** Always use a PR.

### Feature Branch Workflow

#### 1. Create Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/auth-signup
```

#### 2. Work in Small Commits

Make commits frequently, one logical change per commit:

```bash
# Write test
# Edit tests/integration/auth-signup.test.ts
git add tests/integration/auth-signup.test.ts
git commit -m "test(auth): add signup endpoint tests"

# Implement feature
# Edit src/routes/auth.ts, src/services/user.ts
git add src/routes/auth.ts src/services/user.ts
git commit -m "feat(auth): implement signup endpoint"

# Refactor
# Edit src/utils/password.ts
git add src/utils/password.ts
git commit -m "refactor(auth): extract password hashing to utils"
```

#### 3. Keep Branch Updated

```bash
# Fetch latest main
git fetch origin main

# Rebase your branch on main
git rebase origin/main

# If conflicts, resolve them
# Then continue
git rebase --continue

# Force push (only after rebase, on your own branch)
git push -f origin feature/auth-signup
```

#### 4. Push & Create PR

```bash
# Push branch
git push origin feature/auth-signup

# Create pull request on GitHub
# Fill in template (see below)
```

#### 5. Address Review Feedback

```bash
# Reviewer comments on PR
# Make changes locally

git add <changed-files>
git commit -m "Address review: <specific change>"

# Push
git push origin feature/auth-signup

# GitHub updates PR automatically
```

#### 6. Rebase & Squash (Optional)

Before merging, clean up commit history if needed:

```bash
# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# In editor, mark commits to squash
# Example:
# pick abc1234 test(auth): add tests
# squash def5678 feat(auth): implement feature
# squash ghi9012 refactor: extract function

# Git combines commits with new message
git commit -m "feat(auth): add signup endpoint"

# Force push
git push -f origin feature/auth-signup
```

#### 7. Merge

Once approved:

```bash
# Merge via GitHub UI (preferred)
# Or merge locally

git checkout main
git pull origin main
git merge --ff-only feature/auth-signup
git push origin main

# Delete branch
git branch -d feature/auth-signup
git push origin -d feature/auth-signup
```

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/update tests
- `refactor`: Refactor code
- `docs`: Update documentation
- `chore`: Update dependencies, config
- `style`: Code formatting (no logic change)

### Scope (optional but recommended)
- `auth` — Authentication
- `db` — Database
- `api` — API routes
- `validation` — Input validation
- `error` — Error handling

### Subject
- Lowercase, imperative mood
- Max 50 characters
- No period at end

### Examples

**Good:**
```
feat(auth): add signup endpoint
test(auth): add password hashing tests
fix(db): handle connection timeouts
refactor(validation): extract email validator
docs(api): update endpoint specifications
```

**Bad:**
```
Added signup feature
SIGNUP ENDPOINT
Fixed bug
refactoring
Updated code
```

### Body & Footer (optional for small commits)

For complex changes, explain **why**:

```
feat(auth): implement rate limiting on login

Rate limit login attempts to 5 per hour per IP to prevent
brute force attacks. Uses in-memory store for now; can be
upgraded to Redis in Phase 2.

Closes #42
```

---

## Code Review

### Creating a PR

Write a clear PR description:

```markdown
## Description
Add signup endpoint for Auth MVP. Users can now create accounts.

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Breaking change

## Changes
- Added `POST /auth/signup` endpoint
- Added password validation and hashing
- Added database migration for users table
- Added comprehensive tests

## Testing Done
- Unit tests for password hashing: ✓
- Integration tests for signup endpoint: ✓
- E2E test (sign up → see dashboard): ✓
- Manual testing in browser: ✓

## Screenshots / Logs
N/A

## Related Issues
Closes #1

## Checklist
- [x] Tests pass locally (`pnpm test`)
- [x] Code follows style guide
- [x] No console.log() or TODOs
- [x] Database migrations included
- [x] Updated documentation if needed
```

### Reviewing a PR

Focus on:
1. **Does it solve the problem?** (check issue/spec)
2. **Are tests adequate?** (unit, integration, E2E where needed)
3. **Is the code maintainable?** (clear naming, no magic)
4. **Any security issues?** (auth, SQL injection, XSS)
5. **Performance implications?** (N+1 queries, slow algorithms)

**Comment style:**
- Be kind and specific
- Ask questions ("Did you consider...?") rather than demand
- Approve when satisfied

**Example review comment:**
```
Good approach! One question: What happens if the database 
connection fails during user creation? Should we add error 
handling here?

Suggestion: Wrap this in try-catch and return 500 error 
to client.
```

---

## Local Development

### Daily Start

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Start dev servers
pnpm run dev

# In another terminal, run tests in watch mode
pnpm test:unit --watch
```

### Making Changes (TDD)

1. **Identify the feature/bug**
2. **Write a failing test** (see it fail with red)
3. **Implement to pass test** (get it to green)
4. **Refactor** (clean it up while keeping test passing)
5. **Commit** with clear message
6. **Repeat**

Example session:

```bash
# 1. Write test
# Edit tests/integration/auth-signup.test.ts
# Add test case: rejects invalid email

# 2. Run test (it fails)
pnpm test:integration -- auth-signup.test.ts --watch

# 3. Implement
# Edit src/utils/validation.ts
# Add validateEmail() function

# 4. Test passes!

# 5. Refactor (extract to shared/)
# Move validation to shared/src/validation.ts
# Import from shared in both frontend and API

# 6. Commit
git add tests/ src/ shared/
git commit -m "feat(auth): validate email format on signup"

# 7. Start next test
# Write test for password validation
```

### Running Tests

```bash
# All tests (unit + integration)
pnpm test

# Specific layer
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Watch mode (re-run on file change)
pnpm test:unit --watch

# Specific test file
pnpm test:unit -- validation.test.ts

# Specific test case
pnpm test:unit -- validation.test.ts -t "validates email"

# Coverage report
pnpm test:coverage

# UI mode (interactive dashboard)
pnpm test:e2e --ui
```

### Linting & Formatting

```bash
# Lint all code
pnpm lint

# Fix auto-fixable issues
pnpm format

# Type check
pnpm type-check

# All at once
pnpm check
```

### Common Tasks

```bash
# Start both servers
pnpm run dev

# Start just API
cd api && npm run dev

# Start just frontend
cd frontend && npm run dev

# Build for production
pnpm build

# Database migrations
cd api && pnpm run db:migrate

# View database in UI
cd api && pnpm run db:studio

# Connect with psql
psql $DATABASE_URL

# Create a new migration
cd api && pnpm run db:generate "add_email_verification"
```

---

## Code Style

### TypeScript

**Never use `any` type** (except in rare, commented cases):

```typescript
// ✅ Good
function parseUser(data: unknown): User {
  return userSchema.parse(data);
}

// ❌ Bad
function parseUser(data: any): any {
  return data;
}
```

**Explicit return types:**

```typescript
// ✅ Good
export async function createUser(
  email: string,
  password: string
): Promise<User> {
  // ...
}

// ❌ Unclear
export async function createUser(email, password) {
  // ...
}
```

**Error handling:**

```typescript
// ✅ Good
try {
  const user = await createUser(email, password);
  return { success: true, user };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: error.message };
  }
  throw error; // Re-throw unexpected errors
}

// ❌ Bad
async function createUser(email, password) {
  return db.users.insert({ email, password });
}
// Caller has no idea what errors to expect
```

### Naming

- **Functions:** Verb + noun (`hashPassword`, `validateEmail`, `createUser`)
- **Variables:** Descriptive noun (`user`, `hashedPassword`, not `u`, `pw`)
- **Constants:** UPPER_CASE (`MAX_PASSWORD_LENGTH`, `SESSION_DURATION_DAYS`)
- **Booleans:** Prefix with `is` or `has` (`isValid`, `hasError`, not `valid`, `error`)

### Comments

**Write comments for "why", not "what":**

```typescript
// ✅ Good: Explains non-obvious decision
// Hash with Argon2 (not bcrypt) for better resistance to GPU attacks
const hash = await hashPassword(password);

// ❌ Bad: Just restates code
// Create a user
const user = createUser(...);
```

**TODO comments:**

```typescript
// TODO: Add email verification in Phase 2
// TODO: Implement sliding window session expiry
```

### File Organization

```
src/
├── routes/       # Route handlers (public API)
├── middleware/   # Express/Hono middleware
├── services/     # Business logic (user service, auth service)
├── db/           # Database (schema, migrations, queries)
├── utils/        # Pure utility functions (validation, formatting)
├── types/        # TypeScript type definitions
├── errors.ts     # Error definitions
└── app.ts        # App initialization
```

---

## Testing Practices

### Write Tests First (TDD)

```typescript
// Step 1: Write test that describes desired behavior
test('hashes password with Argon2', async () => {
  const password = 'SecurePassword123!';
  const hash = await hashPassword(password);
  
  expect(hash).not.toBe(password);
  expect(hash.length).toBeGreaterThan(50);
});

// Step 2: Run test, watch it fail
// error: hashPassword is not defined

// Step 3: Implement minimum to pass
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

// Step 4: Test passes!
```

### Test Structure (AAA Pattern)

```typescript
test('validates email format', () => {
  // Arrange: Set up test data
  const validEmails = ['user@example.com', 'john.doe@test.co.uk'];
  const invalidEmails = ['notanemail', '@example.com'];
  
  // Act: Execute the function
  const validResults = validEmails.map(validateEmail);
  const invalidResults = invalidEmails.map(validateEmail);
  
  // Assert: Check results
  expect(validResults).toEqual([true, true]);
  expect(invalidResults).toEqual([false, false]);
});
```

### Error Testing

```typescript
// Test that errors are thrown
test('throws on invalid password', () => {
  expect(() => {
    validatePassword('short');
  }).toThrow('Password too short');
});

// Test error types
test('throws ValidationError on invalid email', () => {
  expect(() => {
    validateEmail('notanemail');
  }).toThrow(ValidationError);
});
```

### Integration Testing

```typescript
// Test with real database (in transaction, rolled back)
test('creates user in database', async () => {
  const response = await request(app)
    .post('/api/v1/auth/signup')
    .send({
      email: 'newuser@example.com',
      password: 'ValidPassword123!',
      display_name: 'New User'
    });
  
  expect(response.status).toBe(201);
  expect(response.body.data.user.id).toBeDefined();
  
  // Verify user exists in database
  const user = await db.users.findByEmail('newuser@example.com');
  expect(user.email).toBe('newuser@example.com');
});
```

---

## Documentation

### Update Docs When Coding

If you change functionality, update documentation:

- **API changes:** Update `docs/03-API-CONTRACT.md`
- **Architecture changes:** Update `docs/01-ARCHITECTURE.md`
- **New features:** Update `README.md` or relevant doc
- **Env variables:** Update `docs/05-REPO-STRUCTURE.md`

### Code Comments

Prefer self-documenting code:

```typescript
// ✅ Good: Clear function name and type
function validatePasswordStrength(password: string): boolean {
  return password.length >= 8;
}

// ❌ Bad: Unclear, needs comment
function validate(p: any): any {
  // Check length
  return p.length >= 8;
}
```

---

## Release Process

### Version Numbers (Semantic Versioning)

Format: `MAJOR.MINOR.PATCH`

- `1.0.0` — Auth MVP (this release)
- `1.1.0` — Add email verification, password reset
- `1.2.0` — Add Events feature
- `2.0.0` — Breaking change (rare, avoid)

### Releasing

1. **Update version** in `package.json`
   ```json
   { "version": "1.0.0" }
   ```

2. **Update CHANGELOG.md**
   ```markdown
   ## [1.0.0] - 2026-05-05
   
   ### Added
   - User signup with email and password
   - Session-based authentication
   - Login and logout
   - Protected dashboard
   - Comprehensive test suite
   
   ### Security
   - Passwords hashed with Argon2id
   - HttpOnly, Secure session cookies
   - Rate limiting on auth endpoints
   ```

3. **Commit**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore(release): bump version to 1.0.0"
   ```

4. **Tag**
   ```bash
   git tag -a v1.0.0 -m "Auth MVP release"
   git push origin v1.0.0
   ```

5. **Deploy** (via GitHub Actions or manual)
   ```bash
   git checkout main
   git pull
   pnpm install
   pnpm build
   pnpm test
   # Deploy to production
   ```

---

## Debugging

### Local Debugging

```bash
# Run with debug logs
LOG_LEVEL=debug pnpm run dev

# Debug Node process (VS Code)
# Add to .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/api/src/server.ts",
  "console": "integratedTerminal"
}

# Then press F5 in VS Code
```

### Browser Debugging

```bash
# Frontend: Open browser DevTools (F12)
# Check Network tab for API calls
# Check Console for errors
# Use Vue Devtools (if needed)
```

### Database Debugging

```bash
# Connect directly
psql $DATABASE_URL

# View users
SELECT * FROM users;

# View sessions
SELECT * FROM sessions;

# Check indexes
\d+ users
```

### API Testing with cURL

```bash
# Sign up
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","display_name":"Test"}' \
  -c cookies.txt

# Get current user
curl http://localhost:3001/api/v1/auth/user -b cookies.txt

# Log out
curl -X POST http://localhost:3001/api/v1/auth/logout -b cookies.txt
```

---

## Frequently Asked Questions

**Q: Can I commit directly to main?**
A: No. Always use a branch and PR. This ensures code review and CI passes.

**Q: How many commits should a PR have?**
A: Ideally 1-5, each a logical unit. Too many suggests you should split the PR.

**Q: Should I squash commits?**
A: Only if it improves readability. Preserve logical structure. Example: test + impl + refactor = good.

**Q: What if I break main?**
A: Don't panic. Revert the commit (`git revert <hash>`), fix locally, re-submit as PR.

**Q: How do I update my branch with latest main?**
A: `git fetch origin main && git rebase origin/main` (not merge).

**Q: Can I force push to my branch?**
A: Yes, after rebase. But never force push to main.

**Q: What if I lose a commit?**
A: `git reflog` shows all commits. `git cherry-pick <hash>` to restore.

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Rebase vs Merge](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
