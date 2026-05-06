import { describe, it, expect, beforeEach } from 'vitest';
import { db, testConnection } from '../../src/db/connection';
import { users, sessions } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../src/utils/password';

describe('Database Integration', () => {
  describe('Database Connection', () => {
    it('connects to database successfully', async () => {
      const connected = await testConnection();
      expect(connected).toBe(true);
    });
  });

  describe('Users Table', () => {
    let testEmail: string;

    beforeEach(() => {
      // Generate unique email for each test
      testEmail = `dbtest${Date.now()}@example.com`;
    });

    it('creates a new user', async () => {
      const newUser = {
        email: testEmail,
        password_hash: await hashPassword('TestPassword123'),
        display_name: 'Test User',
      };

      const [user] = await db.insert(users).values(newUser).returning();

      expect(user.id).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.display_name).toBe('Test User');
    });

    it('enforces unique email constraint', async () => {
      const newUser = {
        email: testEmail,
        password_hash: await hashPassword('TestPassword123'),
        display_name: 'Test User',
      };

      await db.insert(users).values(newUser);

      await expect(
        db.insert(users).values(newUser)
      ).rejects.toThrow();
    });

    it('retrieves user by email', async () => {
      const newUser = {
        email: testEmail,
        password_hash: await hashPassword('TestPassword123'),
        display_name: 'Test User',
      };

      await db.insert(users).values(newUser);

      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, testEmail));

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(testEmail);
    });

    it('updates user data', async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: testEmail,
          password_hash: await hashPassword('TestPassword123'),
          display_name: 'Original Name',
        })
        .returning();

      await db
        .update(users)
        .set({ display_name: 'Updated Name' })
        .where(eq(users.id, user.id));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      expect(updatedUser.display_name).toBe('Updated Name');
    });

    it('deletes user', async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: testEmail,
          password_hash: await hashPassword('TestPassword123'),
          display_name: 'Test User',
        })
        .returning();

      await db.delete(users).where(eq(users.id, user.id));

      const [deletedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      expect(deletedUser).toBeUndefined();
    });
  });

  describe('Sessions Table', () => {
    let testUserId: string;

    beforeEach(async () => {
      const [user] = await db
        .insert(users)
        .values({
          email: `session${Date.now()}@example.com`,
          password_hash: await hashPassword('TestPassword123'),
          display_name: 'Session Test User',
        })
        .returning();

      testUserId = user.id;
    });

    it('creates a session for a user', async () => {
      const [session] = await db
        .insert(sessions)
        .values({
          id: 'test-session-id',
          userId: testUserId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .returning();

      expect(session.id).toBe('test-session-id');
      expect(session.userId).toBe(testUserId);
    });

    it('cascades delete when user is deleted', async () => {
      await db.insert(sessions).values({
        id: 'cascade-test-session',
        userId: testUserId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      await db.delete(users).where(eq(users.id, testUserId));

      const [deletedSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, 'cascade-test-session'));

      expect(deletedSession).toBeUndefined();
    });

    it('retrieves session with user data', async () => {
      await db.insert(sessions).values({
        id: 'join-test-session',
        userId: testUserId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const [result] = await db
        .select()
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, 'join-test-session'));

      expect(result.sessions.id).toBe('join-test-session');
      expect(result.users.id).toBe(testUserId);
    });
  });
});
