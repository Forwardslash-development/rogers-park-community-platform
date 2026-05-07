import { describe, it, expect } from 'vitest';
import { subareas } from '../../src/db/schema';

/**
 * Unit tests for Subarea schema definition
 */
describe('Subarea Schema', () => {
  it('should have required fields defined', () => {
    expect(subareas).toBeDefined();
    expect(subareas.id).toBeDefined();
    expect(subareas.slug).toBeDefined();
    expect(subareas.name).toBeDefined();
    expect(subareas.geometry).toBeDefined();
    expect(subareas.created_at).toBeDefined();
    expect(subareas.updated_at).toBeDefined();
  });

  it('should have proper slug constraints', () => {
    const slugColumn = subareas.slug;
    
    expect(slugColumn.notNull).toBe(true);
    expect(slugColumn.isUnique).toBe(true);
  });

  it('should have geometry column for polygon storage', () => {
    const geometryColumn = subareas.geometry;
    
    // Geometry should be required for subareas
    expect(geometryColumn.notNull).toBe(true);
  });

  it('should have proper type exports', () => {
    type Subarea = typeof subareas.$inferSelect;
    type NewSubarea = typeof subareas.$inferInsert;
    
    const newSubarea: Partial<NewSubarea> = {
      slug: 'east-rogers-park',
      name: 'East Rogers Park',
    };
    
    expect(newSubarea).toBeDefined();
  });
});
