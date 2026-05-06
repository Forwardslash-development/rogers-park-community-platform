import { describe, it, expect } from 'vitest';
import { API_BASE_URL, apiUrl } from './config';

describe('config', () => {
  describe('API_BASE_URL', () => {
    it('should default to localhost:3000 when no env var is set', () => {
      expect(API_BASE_URL).toBe('http://localhost:3000');
    });
  });

  describe('apiUrl', () => {
    it('should build correct URL with API_BASE_URL', () => {
      const result = apiUrl('/api/v1/auth/login');
      expect(result).toBe('http://localhost:3000/api/v1/auth/login');
    });

    it('should handle paths without leading slash', () => {
      const result = apiUrl('api/v1/auth/login');
      expect(result).toBe('http://localhost:3000/api/v1/auth/login');
    });

    it('should handle empty path', () => {
      const result = apiUrl('');
      expect(result).toBe('http://localhost:3000/');
    });

    it('should handle root path', () => {
      const result = apiUrl('/');
      expect(result).toBe('http://localhost:3000/');
    });
  });
});
