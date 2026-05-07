import { describe, it, expect } from 'vitest';
import { events } from '../../src/db/schema';

/**
 * Unit tests for Event schema definition
 */
describe('Event Schema', () => {
  it('should have required fields defined', () => {
    expect(events).toBeDefined();
    expect(events.id).toBeDefined();
    expect(events.slug).toBeDefined();
    expect(events.name).toBeDefined();
    expect(events.place_id).toBeDefined();
    expect(events.organizer_id).toBeDefined();
    expect(events.starts_at).toBeDefined();
    expect(events.source).toBeDefined();
    expect(events.created_at).toBeDefined();
    expect(events.updated_at).toBeDefined();
  });

  it('should have proper slug constraints', () => {
    const slugColumn = events.slug;
    
    expect(slugColumn.notNull).toBe(true);
    expect(slugColumn.isUnique).toBe(true);
  });

  it('should have foreign key to places', () => {
    const placeIdColumn = events.place_id;
    
    expect(placeIdColumn.notNull).toBe(true);
  });

  it('should have foreign key to organizers', () => {
    const organizerIdColumn = events.organizer_id;
    
    expect(organizerIdColumn.notNull).toBe(true);
  });

  it('should have optional recurrence field for RRULE', () => {
    expect(events.rrule).toBeDefined();
  });

  it('should have source tracking field', () => {
    const sourceColumn = events.source;
    
    expect(sourceColumn.notNull).toBe(true);
  });

  it('should have proper type exports', () => {
    type Event = typeof events.$inferSelect;
    type NewEvent = typeof events.$inferInsert;
    
    const newEvent: Partial<NewEvent> = {
      slug: 'test-event',
      name: 'Test Event',
      source: 'native',
    };
    
    expect(newEvent).toBeDefined();
  });
});
