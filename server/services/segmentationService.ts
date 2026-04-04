/**
 * Recipient Segmentation Service
 * Manages recipient groups and segments for targeted campaigns
 */

import { getDb } from '../db';
import { emailRecipients } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';

export interface RecipientSegment {
  id: number;
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  recipientCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  recipientType?: 'architect' | 'builder' | 'engineer' | 'other';
  city?: string;
  state?: string;
  status?: 'subscribed' | 'unsubscribed' | 'bounced';
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Create a new recipient segment
 */
export async function createSegment(
  name: string,
  description: string,
  criteria: SegmentCriteria
): Promise<{ id: number; name: string } | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.execute(
      sql`INSERT INTO recipient_segments (name, description, criteria, createdAt, updatedAt)
          VALUES (${name}, ${description}, ${JSON.stringify(criteria)}, ${new Date().toISOString()}, ${new Date().toISOString()})`
    );

    const segmentId = (result as any).lastID || (result as any).insertId;
    return { id: segmentId, name };
  } catch (error) {
    console.error('[Segmentation] Error creating segment:', error);
    return null;
  }
}

/**
 * Get all recipient segments
 */
export async function getAllSegments(): Promise<RecipientSegment[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const segments = await db.execute(
      sql`SELECT * FROM recipient_segments ORDER BY createdAt DESC`
    );

    return (segments as any[]).map((seg: any) => ({
      ...seg,
      criteria: JSON.parse(seg.criteria || '{}'),
      createdAt: new Date(seg.createdAt),
      updatedAt: new Date(seg.updatedAt),
    }));
  } catch (error) {
    console.error('[Segmentation] Error getting segments:', error);
    return [];
  }
}

/**
 * Get segment by ID
 */
export async function getSegmentById(segmentId: number): Promise<RecipientSegment | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.execute(
      sql`SELECT * FROM recipient_segments WHERE id = ${segmentId} LIMIT 1`
    );

    const segment = (result as any[])[0];
    if (!segment) return null;

    return {
      ...segment,
      criteria: JSON.parse(segment.criteria || '{}'),
      createdAt: new Date(segment.createdAt),
      updatedAt: new Date(segment.updatedAt),
    };
  } catch (error) {
    console.error('[Segmentation] Error getting segment:', error);
    return null;
  }
}

/**
 * Get recipients in a segment
 */
export async function getSegmentRecipients(segmentId: number): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const segment = await getSegmentById(segmentId);
    if (!segment) return [];

    let query = 'SELECT * FROM email_recipients WHERE 1=1';
    const params: any[] = [];

    // Apply criteria filters
    if (segment.criteria.recipientType) {
      query += ' AND recipientType = ?';
      params.push(segment.criteria.recipientType);
    }

    if (segment.criteria.city) {
      query += ' AND city = ?';
      params.push(segment.criteria.city);
    }

    if (segment.criteria.state) {
      query += ' AND state = ?';
      params.push(segment.criteria.state);
    }

    if (segment.criteria.status) {
      query += ' AND status = ?';
      params.push(segment.criteria.status);
    }

    if (segment.criteria.createdAfter) {
      query += ' AND createdAt >= ?';
      params.push(segment.criteria.createdAfter.toISOString());
    }

    if (segment.criteria.createdBefore) {
      query += ' AND createdAt <= ?';
      params.push(segment.criteria.createdBefore.toISOString());
    }

    const recipients = await db.execute(sql.raw(query));
    return recipients as any[];
  } catch (error) {
    console.error('[Segmentation] Error getting segment recipients:', error);
    return [];
  }
}

/**
 * Get recipient count for a segment
 */
export async function getSegmentRecipientCount(segmentId: number): Promise<number> {
  try {
    const recipients = await getSegmentRecipients(segmentId);
    return recipients.length;
  } catch (error) {
    console.error('[Segmentation] Error getting segment recipient count:', error);
    return 0;
  }
}

/**
 * Update segment
 */
export async function updateSegment(
  segmentId: number,
  name: string,
  description: string,
  criteria: SegmentCriteria
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db.execute(
      sql`UPDATE recipient_segments 
          SET name = ${name}, description = ${description}, criteria = ${JSON.stringify(criteria)}, updatedAt = ${new Date().toISOString()}
          WHERE id = ${segmentId}`
    );

    return true;
  } catch (error) {
    console.error('[Segmentation] Error updating segment:', error);
    return false;
  }
}

/**
 * Delete segment
 */
export async function deleteSegment(segmentId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db.execute(
      sql`DELETE FROM recipient_segments WHERE id = ${segmentId}`
    );

    return true;
  } catch (error) {
    console.error('[Segmentation] Error deleting segment:', error);
    return false;
  }
}

/**
 * Get segment statistics
 */
export async function getSegmentStats(): Promise<{
  totalSegments: number;
  totalRecipients: number;
  averageSegmentSize: number;
  largestSegment: { name: string; count: number } | null;
}> {
  try {
    const segments = await getAllSegments();
    let totalRecipients = 0;
    let largestSegment: { name: string; count: number } | null = null;

    for (const segment of segments) {
      const count = await getSegmentRecipientCount(segment.id);
      totalRecipients += count;

      if (!largestSegment || count > largestSegment.count) {
        largestSegment = { name: segment.name, count };
      }
    }

    return {
      totalSegments: segments.length,
      totalRecipients,
      averageSegmentSize: segments.length > 0 ? Math.round(totalRecipients / segments.length) : 0,
      largestSegment,
    };
  } catch (error) {
    console.error('[Segmentation] Error getting segment stats:', error);
    return {
      totalSegments: 0,
      totalRecipients: 0,
      averageSegmentSize: 0,
      largestSegment: null,
    };
  }
}
