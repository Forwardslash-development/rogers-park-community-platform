/**
 * Test setup for API tests
 * Runs before all tests
 */
import { beforeAll, afterAll, afterEach } from 'vitest';
import * as dotenv from 'dotenv';
import { db, closeConnection } from '../src/db/connection';
import { 
  users, 
  sessions, 
  emailVerificationTokens, 
  passwordResetTokens,
  events,
  places,
  organizers,
  subareas
} from '../src/db/schema';
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
  // Wrap in try-catch in case tables don't exist yet
  try {
    await db.delete(events);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(sessions);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(emailVerificationTokens);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(passwordResetTokens);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(subareas);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(places);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(organizers);
  } catch (e) {
    // Table might not exist in all test files
  }

  try {
    await db.delete(users);
  } catch (e) {
    // Table might not exist in all test files
  }
});

afterAll(async () => {
  await closeConnection();
  console.log('✅ Test environment cleaned up');
});
