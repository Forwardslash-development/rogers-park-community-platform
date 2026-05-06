import { describe, test, expect } from 'vitest';
import app from '@/app';

/**
 * Health Check Endpoint Integration Tests
 */

describe('GET /api/v1/health', () => {
  test('returns healthy status with database connected', async () => {
    const res = await app.request('/api/v1/health', {
      method: 'GET',
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    
    expect(body.data.status).toBe('healthy');
    expect(body.data.database).toBe('connected');
    expect(body.data.version).toBe('v1');
    
    expect(body.meta.version).toBe('v1');
    expect(body.meta.timestamp).toBeTruthy();
  });

  test('includes timestamp in response', async () => {
    const res = await app.request('/api/v1/health', {
      method: 'GET',
    });

    const body = await res.json();
    
    // Should be a valid ISO timestamp
    const timestamp = new Date(body.meta.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  test('does not require authentication', async () => {
    // Should work without session cookie
    const res = await app.request('/api/v1/health', {
      method: 'GET',
    });

    expect(res.status).toBe(200);
  });
});
