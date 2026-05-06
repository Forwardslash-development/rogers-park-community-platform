import { describe, test, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/utils/password';

/**
 * Password Hashing Unit Tests
 * 
 * TDD Flow:
 * 1. Write these tests first (RED - they will fail)
 * 2. Implement password.ts to pass (GREEN)
 * 3. Refactor if needed while keeping tests green
 */

describe('Password Hashing', () => {
  test('hashes a password correctly', async () => {
    const password = 'SecurePassword123!';
    const hash = await hashPassword(password);
    
    expect(hash).toBeTruthy();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50); // Argon2 hashes are long
    expect(hash).toMatch(/^\$argon2id\$/); // Should start with Argon2id identifier
  });
  
  test('verifies correct password', async () => {
    const password = 'SecurePassword123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    
    expect(isValid).toBe(true);
  });
  
  test('rejects incorrect password', async () => {
    const hash = await hashPassword('CorrectPassword123!');
    const isValid = await verifyPassword('WrongPassword456!', hash);
    
    expect(isValid).toBe(false);
  });
  
  test('produces different hashes for same password (salt)', async () => {
    const password = 'SamePassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    expect(hash1).not.toBe(hash2); // Different salts
    
    // But both should verify
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });
  
  test('handles empty password gracefully', async () => {
    await expect(hashPassword('')).rejects.toThrow();
  });
});
