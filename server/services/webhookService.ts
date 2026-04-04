/**
 * Email Webhook Service
 * Handles webhook events from Gmail, SendGrid, and other email providers
 */

import { getDb } from '../db';
import { campaignRecipients, emailLogs } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export interface WebhookEvent {
  type: 'open' | 'click' | 'bounce' | 'spam' | 'unsubscribe' | 'delivery';
  email: string;
  campaignId?: number;
  recipientId?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Process Gmail webhook event
 */
export async function processGmailWebhook(payload: any): Promise<boolean> {
  try {
    // Gmail uses Message ID and thread ID for tracking
    // This is a simplified implementation
    const messageId = payload.message?.id;
    const email = payload.email;

    if (!messageId || !email) {
      console.error('[Webhook] Missing required Gmail fields');
      return false;
    }

    // Log the webhook event
    await logWebhookEvent({
      type: 'delivery',
      email,
      timestamp: new Date(payload.timestamp || Date.now()),
      metadata: payload,
    });

    return true;
  } catch (error) {
    console.error('[Webhook] Error processing Gmail webhook:', error);
    return false;
  }
}

/**
 * Process SendGrid webhook event
 */
export async function processSendGridWebhook(payload: any): Promise<boolean> {
  try {
    const event = payload.event;
    const email = payload.email;
    const messageId = payload.message_id;

    if (!event || !email) {
      console.error('[Webhook] Missing required SendGrid fields');
      return false;
    }

    // Map SendGrid event types to our internal types
    const eventTypeMap: Record<string, WebhookEvent['type']> = {
      'open': 'open',
      'click': 'click',
      'bounce': 'bounce',
      'spamreport': 'spam',
      'unsubscribe': 'unsubscribe',
      'delivered': 'delivery',
      'processed': 'delivery',
    };

    const eventType = eventTypeMap[event] || 'delivery';

    // Find the recipient and campaign
    const recipient = await findRecipientByEmail(email);
    if (!recipient) {
      console.warn(`[Webhook] Recipient not found: ${email}`);
      return false;
    }

    // Update campaign recipient tracking
    await updateRecipientTracking(recipient.id, eventType, payload);

    // Log the webhook event
    await logWebhookEvent({
      type: eventType,
      email,
      recipientId: recipient.id,
      timestamp: new Date(payload.timestamp * 1000 || Date.now()),
      metadata: payload,
    });

    return true;
  } catch (error) {
    console.error('[Webhook] Error processing SendGrid webhook:', error);
    return false;
  }
}

/**
 * Process generic webhook event
 */
export async function processWebhookEvent(event: WebhookEvent): Promise<boolean> {
  try {
    // Find the recipient
    const recipient = await findRecipientByEmail(event.email);
    if (!recipient) {
      console.warn(`[Webhook] Recipient not found: ${event.email}`);
      return false;
    }

    // Update campaign recipient tracking
    await updateRecipientTracking(recipient.id, event.type, event.metadata);

    // Log the webhook event
    await logWebhookEvent(event);

    return true;
  } catch (error) {
    console.error('[Webhook] Error processing webhook event:', error);
    return false;
  }
}

/**
 * Find recipient by email
 */
async function findRecipientByEmail(email: string): Promise<any> {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(campaignRecipients).where(eq(campaignRecipients.email, email)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[Webhook] Error finding recipient:', error);
    return null;
  }
}

/**
 * Update recipient tracking based on event type
 */
async function updateRecipientTracking(recipientId: number, eventType: WebhookEvent['type'], metadata?: any): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    const now = new Date().toISOString();

    switch (eventType) {
      case 'open':
        await db.execute(
          sql`UPDATE campaign_recipients SET opened = 1, openedAt = ${now} WHERE id = ${recipientId}`
        );
        break;

      case 'click':
        await db.execute(
          sql`UPDATE campaign_recipients SET clicked = 1, clickedAt = ${now} WHERE id = ${recipientId}`
        );
        break;

      case 'bounce':
      case 'spam':
      case 'unsubscribe':
        await db.execute(
          sql`UPDATE campaign_recipients SET status = 'failed', errorMessage = ${eventType} WHERE id = ${recipientId}`
        );
        break;

      case 'delivery':
        await db.execute(
          sql`UPDATE campaign_recipients SET status = 'sent', sentAt = ${now} WHERE id = ${recipientId}`
        );
        break;
    }
  } catch (error) {
    console.error('[Webhook] Error updating recipient tracking:', error);
  }
}

/**
 * Log webhook event to email_logs table
 */
async function logWebhookEvent(event: WebhookEvent): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.execute(
      sql`INSERT INTO email_logs (type, email, campaignId, recipientId, timestamp, metadata, createdAt)
          VALUES (${event.type}, ${event.email}, ${event.campaignId || null}, ${event.recipientId || null}, ${event.timestamp.toISOString()}, ${JSON.stringify(event.metadata || {})}, ${new Date().toISOString()})`
    );
  } catch (error) {
    console.error('[Webhook] Error logging webhook event:', error);
  }
}

/**
 * Get webhook statistics
 */
export async function getWebhookStats(): Promise<{
  totalEvents: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  lastEvent: Date | null;
}> {
  try {
    const db = await getDb();
    if (!db) return {
      totalEvents: 0,
      opens: 0,
      clicks: 0,
      bounces: 0,
      unsubscribes: 0,
      lastEvent: null,
    };
    const logs = await db.select().from(emailLogs);

    const stats = {
      totalEvents: logs.length,
      opens: logs.filter((l: any) => l.type === 'open').length,
      clicks: logs.filter((l: any) => l.type === 'click').length,
      bounces: logs.filter((l: any) => l.type === 'bounce').length,
      unsubscribes: logs.filter((l: any) => l.type === 'unsubscribe').length,
      lastEvent: logs.length > 0 ? new Date(logs[logs.length - 1].createdAt) : null,
    };

    return stats;
  } catch (error) {
    console.error('[Webhook] Error getting webhook stats:', error);
    return {
      totalEvents: 0,
      opens: 0,
      clicks: 0,
      bounces: 0,
      unsubscribes: 0,
      lastEvent: null,
    };
  }
}
