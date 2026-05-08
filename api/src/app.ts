import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from '@/routes/auth';
import testRoutes from '@/routes/test';
import { testConnection } from '@/db/connection';
import { successResponse } from '@/utils/response';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Health check
app.get('/api/v1/health', async (c) => {
  const dbHealthy = await testConnection();
  
  return successResponse(c, {
    status: 'healthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    version: 'v1',
  });
});

// Auth routes
app.route('/api/v1/auth', authRoutes);

// Test-only routes (blocked in production)
app.route('/api/v1/test', testRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    500
  );
});

export default app;
