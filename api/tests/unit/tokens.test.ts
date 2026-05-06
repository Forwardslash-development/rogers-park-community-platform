import { describe, it, expect } from 'vitest';
import { generateToken, hashToken, createTokenExpiry } from '../../src/utils/tokens';

describe('Token Utilities', () => {
  describe('generateToken', () => {
    it('should generate a token of default length (64 chars)', () => {
      const token = generateToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate a token of custom length', () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with only hex characters', () => {
      const token = generateToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('hashToken', () => {
    it('should hash a token consistently', () => {
      const token = 'test-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a 64-character hex string (SHA-256)', () => {
      const hash = hashToken('test');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('createTokenExpiry', () => {
    it('should create expiry 24 hours from now by default', () => {
      const now = new Date();
      const expiry = createTokenExpiry();
      const diff = expiry.getTime() - now.getTime();
      const hours = diff / (1000 * 60 * 60);
      expect(hours).toBeGreaterThan(23.9);
      expect(hours).toBeLessThan(24.1);
    });

    it('should create expiry for custom hours', () => {
      const now = new Date();
      const expiry = createTokenExpiry(1);
      const diff = expiry.getTime() - now.getTime();
      const hours = diff / (1000 * 60 * 60);
      expect(hours).toBeGreaterThan(0.9);
      expect(hours).toBeLessThan(1.1);
    });
  });
});
