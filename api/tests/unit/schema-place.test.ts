import { describe, it, expect } from 'vitest';
import { places } from '../../src/db/schema';

/**
 * Unit tests for Place schema definition
 * Tests the structure and constraints of the places table
 */
describe('Place Schema', () => {
  it('should have required fields defined', () => {
    const table = places;
    
    expect(table).toBeDefined();
    expect(table.id).toBeDefined();
    expect(table.slug).toBeDefined();
    expect(table.name).toBeDefined();
    expect(table.geometry).toBeDefined();
    expect(table.created_at).toBeDefined();
    expect(table.updated_at).toBeDefined();
  });

  it('should have proper slug constraints', () => {
    const slugColumn = places.slug;
    
    // Slug should be unique and not null
    expect(slugColumn.notNull).toBe(true);
    expect(slugColumn.isUnique).toBe(true);
  });

  it('should have geometry column for PostGIS', () => {
    const geometryColumn = places.geometry;
    
    // Geometry should be required
    expect(geometryColumn.notNull).toBe(true);
  });

  it('should have optional metadata fields', () => {
    expect(places.description).toBeDefined();
    expect(places.address).toBeDefined();
    expect(places.website).toBeDefined();
    expect(places.phone).toBeDefined();
    expect(places.tags).toBeDefined();
  });

  it('should have proper type exports', async () => {
    // Type inference test - if this compiles, types are correctly exported
    type Place = typeof places.$inferSelect;
    type NewPlace = typeof places.$inferInsert;
    
    const newPlace: Partial<NewPlace> = {
      slug: 'test-venue',
      name: 'Test Venue',
    };
    
    expect(newPlace).toBeDefined();
  });
});
