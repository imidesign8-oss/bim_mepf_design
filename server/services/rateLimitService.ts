import { getDb } from '../db';
import { rateLimits } from '../../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Rate Limiting Service
 * Prevents spam by limiting submissions per IP address
 */

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_HOUR = 5;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  message?: string;
}

export async function checkRateLimit(ipAddress: string, endpoint: string = '/api/contact'): Promise<RateLimitResult> {
  try {
    const db = await getDb();
    if (!db) {
      // If database is unavailable, allow the request
      return {
        allowed: true,
        remaining: MAX_SUBMISSIONS_PER_HOUR,
        resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW),
      };
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - RATE_LIMIT_WINDOW);

    // Find existing rate limit record
    const existingLimits = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.ipAddress, ipAddress),
          eq(rateLimits.endpoint, endpoint),
          gt(rateLimits.lastSubmissionAt, oneHourAgo)
        )
      );

    if (existingLimits.length === 0) {
      // First submission in this window - create new record
      await db.insert(rateLimits).values({
        ipAddress,
        endpoint,
        submissionCount: 1,
        firstSubmissionAt: now,
        lastSubmissionAt: now,
      });

      return {
        allowed: true,
        remaining: MAX_SUBMISSIONS_PER_HOUR - 1,
        resetTime: new Date(now.getTime() + RATE_LIMIT_WINDOW),
      };
    }

    const record = existingLimits[0];
    const submissionCount = record.submissionCount || 0;

    if (submissionCount >= MAX_SUBMISSIONS_PER_HOUR) {
      // Rate limit exceeded
      const resetTime = new Date(record.firstSubmissionAt.getTime() + RATE_LIMIT_WINDOW);
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        message: `Rate limit exceeded. Please try again after ${resetTime.toLocaleTimeString()}`,
      };
    }

    // Increment submission count
    await db
      .update(rateLimits)
      .set({
        submissionCount: submissionCount + 1,
        lastSubmissionAt: now,
      })
      .where(eq(rateLimits.id, record.id));

    const resetTime = new Date(record.firstSubmissionAt.getTime() + RATE_LIMIT_WINDOW);
    return {
      allowed: true,
      remaining: MAX_SUBMISSIONS_PER_HOUR - (submissionCount + 1),
      resetTime,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: MAX_SUBMISSIONS_PER_HOUR,
      resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW),
    };
  }
}

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Clean up old rate limit records (older than 24 hours)
 * Call this periodically to keep the table clean
 */
export async function cleanupOldRateLimits(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await db
      .delete(rateLimits)
      .where(gt(rateLimits.lastSubmissionAt, oneDayAgo));

    return 0;
  } catch (error) {
    console.error('Failed to cleanup old rate limits:', error);
    return 0;
  }
}
