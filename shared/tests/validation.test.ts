import { describe, it, expect } from 'vitest';
import {
  createPlaceSchema,
  updatePlaceSchema,
  createEventSchema,
  updateEventSchema,
  createOrganizerSchema,
  updateOrganizerSchema,
  signupSchema,
} from '../src/validation';
import { EVENT_SOURCES, PLACE_TAGS, EVENT_TAGS, ACCESSIBILITY_FEATURES } from '../src/constants';

/**
 * Tests for Zod validation schemas
 * These schemas validate input data before database operations
 */

describe('Place Validation Schemas', () => {
  describe('createPlaceSchema', () => {
    it('should validate a complete valid place', () => {
      const validPlace = {
        name: 'The Morse Theater',
        slug: 'the-morse-theater',
        address: '1328 W Morse Ave, Chicago, IL 60626',
        latitude: 42.008464,
        longitude: -87.667542,
        tags: ['theater', 'music-venue'],
        accessibility: ['wheelchair-accessible', 'elevator'],
        hours: { monday: '9:00-17:00', tuesday: '9:00-17:00' },
        website: 'https://morsetheater.com',
      };

      const result = createPlaceSchema.safeParse(validPlace);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const invalidPlace = {
        slug: 'test-place',
        latitude: 42.0,
        longitude: -87.0,
      };

      const result = createPlaceSchema.safeParse(invalidPlace);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should enforce name length limits', () => {
      const tooShort = { name: '', slug: 'test', latitude: 42.0, longitude: -87.0 };
      const tooLong = { 
        name: 'a'.repeat(256), 
        slug: 'test',
        latitude: 42.0,
        longitude: -87.0,
      };

      expect(createPlaceSchema.safeParse(tooShort).success).toBe(false);
      expect(createPlaceSchema.safeParse(tooLong).success).toBe(false);
    });

    it('should validate latitude range (-90 to 90)', () => {
      const invalidLat = {
        name: 'Test',
        slug: 'test',
        latitude: 100,
        longitude: -87.0,
      };

      const result = createPlaceSchema.safeParse(invalidLat);
      expect(result.success).toBe(false);
    });

    it('should validate longitude range (-180 to 180)', () => {
      const invalidLng = {
        name: 'Test',
        slug: 'test',
        latitude: 42.0,
        longitude: 200,
      };

      const result = createPlaceSchema.safeParse(invalidLng);
      expect(result.success).toBe(false);
    });

    it('should validate tags against PLACE_TAGS constants', () => {
      const invalidTags = {
        name: 'Test',
        slug: 'test',
        latitude: 42.0,
        longitude: -87.0,
        tags: ['invalid-tag', 'another-invalid'],
      };

      const result = createPlaceSchema.safeParse(invalidTags);
      expect(result.success).toBe(false);
    });

    it('should enforce max tags limit', () => {
      const tooManyTags = {
        name: 'Test',
        slug: 'test',
        latitude: 42.0,
        longitude: -87.0,
        tags: PLACE_TAGS.slice(0, 11), // Max is 10
      };

      const result = createPlaceSchema.safeParse(tooManyTags);
      expect(result.success).toBe(false);
    });

    it('should validate accessibility features', () => {
      const invalidAccessibility = {
        name: 'Test',
        slug: 'test',
        latitude: 42.0,
        longitude: -87.0,
        accessibility: ['not-a-real-feature'],
      };

      const result = createPlaceSchema.safeParse(invalidAccessibility);
      expect(result.success).toBe(false);
    });

    it('should validate URL format for website', () => {
      const invalidUrl = {
        name: 'Test',
        slug: 'test',
        latitude: 42.0,
        longitude: -87.0,
        website: 'not-a-url',
      };

      const result = createPlaceSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePlaceSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name',
      };

      const result = updatePlaceSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate fields when provided', () => {
      const invalidUpdate = {
        latitude: 100, // Invalid
      };

      const result = updatePlaceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});

describe('Event Validation Schemas', () => {
  describe('createEventSchema', () => {
    it('should validate a complete valid event', () => {
      const validEvent = {
        name: 'Summer Music Festival',
        slug: 'summer-music-festival',
        description: 'Annual outdoor music event',
        starts_at: new Date('2026-07-15T18:00:00Z'),
        ends_at: new Date('2026-07-15T22:00:00Z'),
        place_id: '123e4567-e89b-12d3-a456-426614174000',
        organizer_id: '123e4567-e89b-12d3-a456-426614174001',
        source: EVENT_SOURCES.NATIVE,
        tags: ['music', 'outdoor', 'free'],
        price: 'Free',
        accessibility: ['wheelchair-accessible'],
      };

      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should require name, starts_at, and source', () => {
      const invalidEvent = {
        slug: 'test',
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should validate event source against EVENT_SOURCES', () => {
      const invalidSource = {
        name: 'Test Event',
        slug: 'test',
        starts_at: new Date(),
        source: 'invalid-source',
      };

      const result = createEventSchema.safeParse(invalidSource);
      expect(result.success).toBe(false);
    });

    it('should validate tags against EVENT_TAGS constants', () => {
      const invalidTags = {
        name: 'Test Event',
        slug: 'test',
        starts_at: new Date(),
        source: EVENT_SOURCES.NATIVE,
        tags: ['invalid-tag'],
      };

      const result = createEventSchema.safeParse(invalidTags);
      expect(result.success).toBe(false);
    });

    it('should validate ends_at is after starts_at', () => {
      const invalidDates = {
        name: 'Test Event',
        slug: 'test',
        starts_at: new Date('2026-07-15T22:00:00Z'),
        ends_at: new Date('2026-07-15T18:00:00Z'), // Before starts_at
        source: EVENT_SOURCES.NATIVE,
      };

      const result = createEventSchema.safeParse(invalidDates);
      expect(result.success).toBe(false);
    });

    it('should validate UUID format for place_id and organizer_id', () => {
      const invalidUuid = {
        name: 'Test Event',
        slug: 'test',
        starts_at: new Date(),
        source: EVENT_SOURCES.NATIVE,
        place_id: 'not-a-uuid',
      };

      const result = createEventSchema.safeParse(invalidUuid);
      expect(result.success).toBe(false);
    });
  });

  describe('updateEventSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'Updated Event Name',
      };

      const result = updateEventSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });
});

describe('Organizer Validation Schemas', () => {
  describe('createOrganizerSchema', () => {
    it('should validate a complete valid organizer', () => {
      const validOrganizer = {
        name: 'Rogers Park Arts Alliance',
        slug: 'rogers-park-arts-alliance',
        description: 'Community arts organization',
        email: 'info@rpaa.org',
        website: 'https://rpaa.org',
      };

      const result = createOrganizerSchema.safeParse(validOrganizer);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const invalidOrganizer = {
        slug: 'test',
      };

      const result = createOrganizerSchema.safeParse(invalidOrganizer);
      expect(result.success).toBe(false);
    });

    it('should validate email format', () => {
      const invalidEmail = {
        name: 'Test Org',
        slug: 'test',
        email: 'not-an-email',
      };

      const result = createOrganizerSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('should validate URL format for website', () => {
      const invalidUrl = {
        name: 'Test Org',
        slug: 'test',
        website: 'not-a-url',
      };

      const result = createOrganizerSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);
    });
  });

  describe('updateOrganizerSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        description: 'Updated description',
      };

      const result = updateOrganizerSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });
});

describe('Auth Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should validate display_name minimum length', () => {
      const tooShort = {
        email: 'test@example.com',
        password: 'password123',
        display_name: 'A', // 1 char - should fail
      };

      const result = signupSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });

    it('should accept valid display_name length', () => {
      const valid = {
        email: 'test@example.com',
        password: 'password123',
        display_name: 'AB', // 2 chars - should pass
      };

      const result = signupSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
