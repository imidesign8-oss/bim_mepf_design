import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, getClientIp } from './rateLimitService';

describe('Rate Limiting Service', () => {
  describe('checkRateLimit', () => {
    beforeEach(async () => {
      // Clear rate limit records before each test
      const { getDb } = await import('../db');
      const { rateLimits } = await import('../../drizzle/schema');
      const db = await getDb();
      if (db) {
        try {
          await db.delete(rateLimits);
        } catch (e) {
          // Ignore errors
        }
      }
    });
    it('should allow first submission from new IP', async () => {
      const result = await checkRateLimit('192.168.1.1', '/api/contact');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.remaining).toBeLessThanOrEqual(4);
    });

    it('should allow multiple submissions within limit', async () => {
      const ip = '192.168.1.2';
      
      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit(ip, '/api/contact');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
      }
    });

    it('should reject submission when rate limit exceeded', async () => {
      const ip = '192.168.1.3';
      
      // Make 5 submissions (at limit)
      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit(ip, '/api/contact');
        expect(result.allowed).toBe(true);
      }
      
      // 6th submission should be rejected
      const result = await checkRateLimit(ip, '/api/contact');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toContain('Rate limit exceeded');
    });

    it('should return reset time', async () => {
      const result = await checkRateLimit('192.168.1.4', '/api/contact');
      expect(result.resetTime).toBeInstanceOf(Date);
      expect(result.resetTime.getTime()).toBeGreaterThan(Date.now() - 1000); // Allow 1 second margin
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1',
        },
      };
      const ip = getClientIp(req);
      expect(ip).toBe('203.0.113.1');
    });

    it('should handle single IP in x-forwarded-for', () => {
      const req = {
        headers: {
          'x-forwarded-for': '203.0.113.1',
        },
      };
      const ip = getClientIp(req);
      expect(ip).toBe('203.0.113.1');
    });

    it('should fallback to socket remoteAddress', () => {
      const req = {
        headers: {},
        socket: {
          remoteAddress: '192.168.1.1',
        },
      };
      const ip = getClientIp(req);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return unknown if no IP found', () => {
      const req = {
        headers: {},
      };
      const ip = getClientIp(req);
      expect(ip).toBe('unknown');
    });
  });
});
