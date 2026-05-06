/**
 * Test setup for API tests
 * Runs before all tests
 */
import { beforeAll, afterAll, afterEach } from 'vitest';
import * as dotenv from 'dotenv';
import { db, closeConnection } from '../src/db/connection';
import { users, sessions, emailVerificationTokens, passwordResetTokens } from '../src/db/schema';
import { sql } from 'drizzle-orm';

// Load test environment variables FIRST
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  console.log('🧪 Test environment initialized');
  
  // Verify we're using test database
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl?.includes('rogers_park_test')) {
    throw new Error('Test must use rogers_park_test database!');
  }
});

afterEach(async () => {
  // Clean up test data after each test
  await db.delete(sessions);
  await db.delete(emailVerificationTokens);
  await db.delete(passwordResetTokens);
  await db.delete(users);
});

afterAll(async () => {
  await closeConnection();
  console.log('✅ Test environment cleaned up');
});
