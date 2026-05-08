import { Hono } from 'hono';
import { db } from '@/db/connection';
import { sql } from 'drizzle-orm';

const testRoutes = new Hono();

// Block this route in production no matter what
testRoutes.use('*', async (c, next) => {
  if (process.env.NODE_ENV === 'production') {
    return c.json({ error: 'Not Found' }, 404);
  }
  await next();
});

testRoutes.post('/reset', async (c) => {
  // CASCADE handles sessions, email_verification_tokens, password_reset_tokens
  // because they all have onDelete: 'cascade' from users
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
  return c.json({ ok: true });
});

export default testRoutes;
