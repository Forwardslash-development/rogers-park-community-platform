import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { db, testConnection, closeConnection } from '@/db/connection';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/utils/password';

/**
 * Database Integration Tests
 * 
 * These tests verify:
 * 1. Database connection works
 * 2. Schema is correctly applied
 * 3. CRUD operations work
 * 4. Constraints are enforced (unique email, foreign keys)
 */

describe('Database Integration', () => {
  beforeAll(async () => {
    // Verify connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed - make sure PostgreSQL is running');
    }
    
    // Clean up test data before tests
    await db.delete(sessions);
    await db.delete(users);
  });

  afterAll(async () => {
    // Clean up test data after tests
    await db.delete(sessions);
    await db.delete(users);
    await closeConnection();
  });

  describe('Database Connection', () => {
    test('connects to database successfully', async () => {
      const connected = await testConnection();
      expect(connected).toBe(true);
    });
  });

  describe('Users Table', () => {
    test('creates a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        password_hash: await hashPassword('password123'),
        display_name: 'Test User',
        role: 'user' as const,
      };

      const [created] = await db.insert(users).values(newUser).returning();

      expect(created.id).toBeTruthy();
      expect(created.email).toBe('test@example.com');
      expect(created.display_name).toBe('Test User');
      expect(created.role).toBe('user');
      expect(created.created_at).toBeInstanceOf(Date);
      expect(created.updated_at).toBeInstanceOf(Date);
      expect(created.email_verified_at).toBeNull();
    });

    test('enforces unique email constraint', async () => {
      const email = 'duplicate@example.com';
      
      // Create first user
      await db.insert(users).values({
        email,
        password_hash: await hashPassword('password123'),
        display_name: 'User 1',
      });

      // Try to create second user with same email
      await expect(
        db.insert(users).values({
          email,
          password_hash: await hashPassword('password456'),
          display_name: 'User 2',
        })
      ).rejects.toThrow();
    });

    test('retrieves user by email', async () => {
      const email = 'find@example.com';
      
      await db.insert(users).values({
        email,
        password_hash: await hashPassword('password123'),
        display_name: 'Find Me',
      });

      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      expect(found).toBeTruthy();
      expect(found.email).toBe(email);
      expect(found.display_name).toBe('Find Me');
    });

    test('updates user data', async () => {
      const [user] = await db.insert(users).values({
        email: 'update@example.com',
        password_hash: await hashPassword('password123'),
        display_name: 'Old Name',
      }).returning();

      const [updated] = await db
        .update(users)
        .set({ 
          display_name: 'New Name',
          updated_at: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      expect(updated.display_name).toBe('New Name');
      expect(updated.updated_at.getTime()).toBeGreaterThan(updated.created_at.getTime());
    });

    test('deletes user', async () => {
      const [user] = await db.insert(users).values({
        email: 'delete@example.com',
        password_hash: await hashPassword('password123'),
        display_name: 'Delete Me',
      }).returning();

      await db.delete(users).where(eq(users.id, user.id));

      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      expect(found).toBeUndefined();
    });
  });

  describe('Sessions Table', () => {
    test('creates a session for a user', async () => {
      const [user] = await db.insert(users).values({
        email: 'session@example.com',
        password_hash: await hashPassword('password123'),
        display_name: 'Session User',
      }).returning();

      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

      const [session] = await db.insert(sessions).values({
        id: 'test-session-id-123',
        user_id: user.id,
        expires_at: expiresAt,
      }).returning();

      expect(session.id).toBe('test-session-id-123');
      expect(session.user_id).toBe(user.id);
      expect(session.expires_at).toBeInstanceOf(Date);
      expect(session.created_at).toBeInstanceOf(Date);
    });

    test('cascades delete when user is deleted', async () => {
      // Create user and session
      const [user] = await db.insert(users).values({
        email: 'cascade@example.com',
        password_hash: await hashPassword('password123'),
        display_name: 'Cascade User',
      }).returning();

      await db.insert(sessions).values({
        id: 'cascade-session-id',
        user_id: user.id,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      // Delete user
      await db.delete(users).where(eq(users.id, user.id));

      // Session should be deleted too
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, 'cascade-session-id'));

      expect(session).toBeUndefined();
    });

    test('retrieves session with user data', async () => {
      const [user] = await db.insert(users).values({
        email: 'join@example.com',
        password_hash: await hashPassword('password123'),
        display_name: 'Join User',
      }).returning();

      await db.insert(sessions).values({
        id: 'join-session-id',
        user_id: user.id,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const result = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.user_id, users.id))
        .where(eq(sessions.id, 'join-session-id'));

      expect(result).toHaveLength(1);
      expect(result[0]?.session.id).toBe('join-session-id');
      expect(result[0]?.user.email).toBe('join@example.com');
    });
  });
});
