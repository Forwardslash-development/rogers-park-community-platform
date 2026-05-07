import { describe, it, expect } from 'vitest';
import { organizers } from '../../src/db/schema';

/**
 * Unit tests for Organizer schema definition
 */
describe('Organizer Schema', () => {
  it('should have required fields defined', () => {
    expect(organizers).toBeDefined();
    expect(organizers.id).toBeDefined();
    expect(organizers.slug).toBeDefined();
    expect(organizers.name).toBeDefined();
    expect(organizers.created_at).toBeDefined();
    expect(organizers.updated_at).toBeDefined();
  });

  it('should have proper slug constraints', () => {
    const slugColumn = organizers.slug;
    
    expect(slugColumn.notNull).toBe(true);
    expect(slugColumn.isUnique).toBe(true);
  });

  it('should have optional metadata fields', () => {
    expect(organizers.description).toBeDefined();
    expect(organizers.website).toBeDefined();
    expect(organizers.email).toBeDefined();
  });

  it('should have proper type exports', () => {
    type Organizer = typeof organizers.$inferSelect;
    type NewOrganizer = typeof organizers.$inferInsert;
    
    const newOrganizer: Partial<NewOrganizer> = {
      slug: 'test-org',
      name: 'Test Organization',
    };
    
    expect(newOrganizer).toBeDefined();
  });
});
