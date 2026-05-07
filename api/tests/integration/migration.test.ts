import { describe, it, expect, beforeAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db } from '../../src/db/connection';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Integration tests for database migrations
 * Verifies that migration files exist and database schema is correct
 */
describe('Database Migrations', () => {
  beforeAll(async () => {
    // Verify we're using test database
    const dbUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL:', dbUrl);
    if (!dbUrl?.includes('test')) {
      throw new Error('Migration tests must use test database!');
    }
    
    // Debug: Check what database we're actually connected to
    const result = await db.execute(sql`SELECT current_database()`);
    console.log('Connected to database:', result.rows[0]);
  });

  it('should have migration files in drizzle directory', () => {
    const migrationsDir = path.join(__dirname, '../../drizzle');
    
    expect(fs.existsSync(migrationsDir)).toBe(true);
    
    const files = fs.readdirSync(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));
    
    // Should have at least one migration file
    expect(sqlFiles.length).toBeGreaterThan(0);
  });

  it('should have PostGIS extension enabled in database', async () => {
    const result = await db.execute(sql`
      SELECT * FROM pg_extension WHERE extname = 'postgis'
    `);
    
    console.log('PostGIS query result:', result.rows);
    expect(result.rows.length).toBe(1);
  });

  it('should have places table with geometry column', async () => {
    const result = await db.execute(sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'places' AND column_name = 'geometry'
    `);
    
    console.log('Places geometry column:', result.rows);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].udt_name).toBe('geometry');
  });

  it('should have events table with all required columns', async () => {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY column_name
    `);
    
    const columnNames = result.rows.map((r: any) => r.column_name);
    console.log('Events columns:', columnNames);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('slug');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('place_id');
    expect(columnNames).toContain('organizer_id');
    expect(columnNames).toContain('starts_at');
    expect(columnNames).toContain('source');
    expect(columnNames).toContain('rrule');
  });

  it('should have organizers table', async () => {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'organizers'
    `);
    
    expect(result.rows.length).toBe(1);
  });

  it('should have subareas table with polygon geometry', async () => {
    const result = await db.execute(sql`
      SELECT column_name, udt_name
      FROM information_schema.columns
      WHERE table_name = 'subareas' AND column_name = 'geometry'
    `);
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].udt_name).toBe('geometry');
  });

  it('should have foreign key constraints on events table', async () => {
    const result = await db.execute(sql`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'events' AND tc.constraint_type = 'FOREIGN KEY'
    `);
    
    expect(result.rows.length).toBeGreaterThanOrEqual(2);
    
    const foreignTables = result.rows.map((r: any) => r.foreign_table_name);
    expect(foreignTables).toContain('places');
    expect(foreignTables).toContain('organizers');
  });
});
