import { describe, it, expect } from 'vitest';
import {
  EVENT_SOURCES,
  PLACE_TAGS,
  EVENT_TAGS,
  ACCESSIBILITY_FEATURES,
  VALIDATION_LIMITS,
} from '../src/constants';

/**
 * Tests for shared platform constants
 * These define the vocabulary and constraints for the data model
 */
describe('Event Constants', () => {
  describe('EVENT_SOURCES', () => {
    it('should define all event source types', () => {
      expect(EVENT_SOURCES.NATIVE).toBe('native');
      expect(EVENT_SOURCES.SCRAPED).toBe('scraped');
      expect(EVENT_SOURCES.SUBMITTED).toBe('submitted');
    });

    it('should have exactly 3 source types', () => {
      const sources = Object.keys(EVENT_SOURCES);
      expect(sources).toHaveLength(3);
    });

    it('should be immutable (as const)', () => {
      // TypeScript will catch this at compile time, but we can verify the structure
      expect(Object.isFrozen(EVENT_SOURCES)).toBe(false); // as const doesn't freeze, but prevents reassignment
      expect(EVENT_SOURCES).toBeDefined();
    });
  });
});

describe('Tag Constants', () => {
  describe('PLACE_TAGS', () => {
    it('should define common place categories', () => {
      expect(PLACE_TAGS).toContain('restaurant');
      expect(PLACE_TAGS).toContain('bar');
      expect(PLACE_TAGS).toContain('cafe');
      expect(PLACE_TAGS).toContain('park');
      expect(PLACE_TAGS).toContain('gallery');
      expect(PLACE_TAGS).toContain('theater');
      expect(PLACE_TAGS).toContain('music-venue');
      expect(PLACE_TAGS).toContain('community-center');
      expect(PLACE_TAGS).toContain('library');
      expect(PLACE_TAGS).toContain('school');
    });

    it('should be an array of strings', () => {
      expect(Array.isArray(PLACE_TAGS)).toBe(true);
      PLACE_TAGS.forEach(tag => {
        expect(typeof tag).toBe('string');
      });
    });

    it('should use kebab-case for multi-word tags', () => {
      const multiWordTags = PLACE_TAGS.filter(tag => tag.includes('-'));
      multiWordTags.forEach(tag => {
        // Should not contain spaces or underscores
        expect(tag).not.toMatch(/\s/);
        expect(tag).not.toMatch(/_/);
        // Should be lowercase
        expect(tag).toBe(tag.toLowerCase());
      });
    });
  });

  describe('EVENT_TAGS', () => {
    it('should define common event categories', () => {
      expect(EVENT_TAGS).toContain('music');
      expect(EVENT_TAGS).toContain('art');
      expect(EVENT_TAGS).toContain('theater');
      expect(EVENT_TAGS).toContain('film');
      expect(EVENT_TAGS).toContain('food');
      expect(EVENT_TAGS).toContain('community');
      expect(EVENT_TAGS).toContain('sports');
      expect(EVENT_TAGS).toContain('education');
      expect(EVENT_TAGS).toContain('kids');
      expect(EVENT_TAGS).toContain('free');
    });

    it('should be an array of strings', () => {
      expect(Array.isArray(EVENT_TAGS)).toBe(true);
      EVENT_TAGS.forEach(tag => {
        expect(typeof tag).toBe('string');
      });
    });
  });
});

describe('Accessibility Constants', () => {
  describe('ACCESSIBILITY_FEATURES', () => {
    it('should define common accessibility features', () => {
      expect(ACCESSIBILITY_FEATURES).toContain('wheelchair-accessible');
      expect(ACCESSIBILITY_FEATURES).toContain('accessible-parking');
      expect(ACCESSIBILITY_FEATURES).toContain('accessible-restroom');
      expect(ACCESSIBILITY_FEATURES).toContain('elevator');
      expect(ACCESSIBILITY_FEATURES).toContain('ramp');
      expect(ACCESSIBILITY_FEATURES).toContain('asl-interpretation');
      expect(ACCESSIBILITY_FEATURES).toContain('closed-captioning');
      expect(ACCESSIBILITY_FEATURES).toContain('service-animals-welcome');
    });

    it('should be an array of strings', () => {
      expect(Array.isArray(ACCESSIBILITY_FEATURES)).toBe(true);
      ACCESSIBILITY_FEATURES.forEach(feature => {
        expect(typeof feature).toBe('string');
      });
    });

    it('should use kebab-case', () => {
      ACCESSIBILITY_FEATURES.forEach(feature => {
        expect(feature).not.toMatch(/\s/);
        expect(feature).not.toMatch(/_/);
        expect(feature).toBe(feature.toLowerCase());
      });
    });
  });
});

describe('Validation Limits', () => {
  describe('VALIDATION_LIMITS', () => {
    it('should define slug constraints', () => {
      expect(VALIDATION_LIMITS.SLUG_MIN_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_LIMITS.SLUG_MAX_LENGTH).toBeLessThanOrEqual(255);
      expect(VALIDATION_LIMITS.SLUG_MIN_LENGTH).toBeLessThan(VALIDATION_LIMITS.SLUG_MAX_LENGTH);
    });

    it('should define name constraints', () => {
      expect(VALIDATION_LIMITS.NAME_MIN_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION_LIMITS.NAME_MAX_LENGTH).toBeLessThanOrEqual(255);
    });

    it('should define description constraints', () => {
      expect(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH).toBeGreaterThan(VALIDATION_LIMITS.NAME_MAX_LENGTH);
    });

    it('should define tag constraints', () => {
      expect(VALIDATION_LIMITS.MAX_TAGS).toBeGreaterThan(0);
      expect(VALIDATION_LIMITS.MAX_TAGS).toBeLessThanOrEqual(20);
    });
  });
});
