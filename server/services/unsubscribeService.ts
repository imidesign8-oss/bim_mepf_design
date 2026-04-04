/**
 * Unsubscribe Service
 * Manages email unsubscribe functionality and recipient preferences
 */

import { getDb } from '../db';
import { emailRecipients } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Generate an unsubscribe token for a recipient
 */
export function generateUnsubscribeToken(recipientId: number, email: string): string {
  const data = `${recipientId}:${email}:${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify an unsubscribe token
 */
export function verifyUnsubscribeToken(recipientId: number, email: string, token: string): boolean {
  const data = `${recipientId}:${email}:${Date.now()}`;
  const expectedToken = crypto.createHash('sha256').update(data).digest('hex');
  
  // Allow tokens from the current time and previous hour (for time-based verification)
  for (let i = 0; i < 60; i++) {
    const timeData = `${recipientId}:${email}:${Date.now() - (i * 60 * 1000)}`;
    const checkToken = crypto.createHash('sha256').update(timeData).digest('hex');
    if (checkToken === token) {
      return true;
    }
  }
  
  return false;
}

/**
 * Unsubscribe a recipient from all campaigns
 */
export async function unsubscribeRecipient(recipientId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    
    await db.update(emailRecipients)
      .set({
        subscribed: false,
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailRecipients.id, recipientId));
    
    return true;
  } catch (error) {
    console.error('[Unsubscribe] Failed to unsubscribe recipient:', error);
    return false;
  }
}

/**
 * Unsubscribe a recipient by email
 */
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    
    const recipients = await db.select().from(emailRecipients).where(eq(emailRecipients.email, email)).limit(1);
    const recipient = recipients[0];

    if (!recipient) {
      return false;
    }

    return unsubscribeRecipient(recipient.id);
  } catch (error) {
    console.error('[Unsubscribe] Failed to unsubscribe by email:', error);
    return false;
  }
}

/**
 * Resubscribe a recipient
 */
export async function resubscribeRecipient(recipientId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    
    await db.update(emailRecipients)
      .set({
        subscribed: true,
        unsubscribedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(emailRecipients.id, recipientId));
    
    return true;
  } catch (error) {
    console.error('[Resubscribe] Failed to resubscribe recipient:', error);
    return false;
  }
}

/**
 * Check if a recipient is unsubscribed
 */
export async function isUnsubscribed(recipientId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    
    const recipients = await db.select().from(emailRecipients).where(eq(emailRecipients.id, recipientId)).limit(1);
    const recipient = recipients[0];

    return !recipient?.subscribed || false;
  } catch (error) {
    console.error('[Unsubscribe] Failed to check unsubscribe status:', error);
    return false;
  }
}

/**
 * Get unsubscribe statistics
 */
export async function getUnsubscribeStats() {
  try {
    const db = await getDb();
    if (!db) return { totalRecipients: 0, unsubscribedCount: 0, unsubscribeRate: 0, activeRecipients: 0 };
    
    const total = await db.select().from(emailRecipients);
    const unsubscribed = total.filter((r: any) => !r.subscribed);
    
    return {
      totalRecipients: total.length,
      unsubscribedCount: unsubscribed.length,
      unsubscribeRate: total.length > 0 ? (unsubscribed.length / total.length) * 100 : 0,
      activeRecipients: total.length - unsubscribed.length,
    };
  } catch (error) {
    console.error('[Unsubscribe] Failed to get statistics:', error);
    return {
      totalRecipients: 0,
      unsubscribedCount: 0,
      unsubscribeRate: 0,
      activeRecipients: 0,
    };
  }
}

/**
 * Get list of unsubscribed recipients
 */
export async function getUnsubscribedRecipients() {
  try {
    const db = await getDb();
    if (!db) return [];
    
    return await db.select().from(emailRecipients).where(eq(emailRecipients.subscribed, false));
  } catch (error) {
    console.error('[Unsubscribe] Failed to get unsubscribed recipients:', error);
    return [];
  }
}

/**
 * Generate unsubscribe link for email
 */
export function generateUnsubscribeLink(recipientId: number, email: string, baseUrl: string = 'https://imidesign.in'): string {
  const token = generateUnsubscribeToken(recipientId, email);
  return `${baseUrl}/api/unsubscribe?id=${recipientId}&token=${token}`;
}
