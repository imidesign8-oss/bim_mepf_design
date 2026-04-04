import { getDb } from '../db';
import { campaignRecipients } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Email Tracking Service
 * Handles tracking of email opens and clicks
 */

/**
 * Track email open via pixel
 * Called when tracking pixel is loaded in email
 */
export async function trackEmailOpen(campaignId: number, recipientId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Update campaign recipient to mark as opened
    await db
      .update(campaignRecipients)
      .set({
        opened: true,
        openedAt: new Date(),
      })
      .where(
        and(
          eq(campaignRecipients.campaignId, campaignId),
          eq(campaignRecipients.recipientId, recipientId)
        )
      );

    console.log(`Email opened: campaign ${campaignId}, recipient ${recipientId}`);
    return true;
  } catch (error) {
    console.error('Failed to track email open:', error);
    return false;
  }
}

/**
 * Track email click
 * Called when user clicks tracked link in email
 */
export async function trackEmailClick(
  campaignId: number,
  recipientId: number,
  linkUrl?: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Update campaign recipient to mark as clicked
    await db
      .update(campaignRecipients)
      .set({
        clicked: true,
        clickedAt: new Date(),
      })
      .where(
        and(
          eq(campaignRecipients.campaignId, campaignId),
          eq(campaignRecipients.recipientId, recipientId)
        )
      );

    console.log(`Email clicked: campaign ${campaignId}, recipient ${recipientId}, link: ${linkUrl}`);
    return true;
  } catch (error) {
    console.error('Failed to track email click:', error);
    return false;
  }
}

/**
 * Get campaign engagement metrics
 */
export async function getCampaignEngagementMetrics(campaignId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const recipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));

    if (recipients.length === 0) {
      return {
        totalRecipients: 0,
        sentCount: 0,
        failedCount: 0,
        openCount: 0,
        clickCount: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
      };
    }

    const sentCount = recipients.filter(r => r.status === 'sent').length;
    const failedCount = recipients.filter(r => r.status === 'failed').length;
    const openCount = recipients.filter(r => r.opened).length;
    const clickCount = recipients.filter(r => r.clicked).length;

    const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
    const clickRate = sentCount > 0 ? (clickCount / sentCount) * 100 : 0;
    const conversionRate = openCount > 0 ? (clickCount / openCount) * 100 : 0;

    return {
      totalRecipients: recipients.length,
      sentCount,
      failedCount,
      openCount,
      clickCount,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  } catch (error) {
    console.error('Failed to get campaign engagement metrics:', error);
    throw error;
  }
}

/**
 * Get detailed recipient engagement data for a campaign
 */
export async function getCampaignRecipientDetails(campaignId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const recipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));

    return recipients.map(r => ({
      id: r.id,
      email: r.email,
      status: r.status,
      sentAt: r.sentAt,
      opened: r.opened,
      openedAt: r.openedAt,
      clicked: r.clicked,
      clickedAt: r.clickedAt,
      errorMessage: r.errorMessage,
    }));
  } catch (error) {
    console.error('Failed to get campaign recipient details:', error);
    throw error;
  }
}

/**
 * Generate tracking pixel URL
 * Returns a URL that can be embedded in email as 1x1 pixel
 */
export function generateTrackingPixelUrl(campaignId: number, recipientId: number): string {
  const params = new URLSearchParams({
    c: campaignId.toString(),
    r: recipientId.toString(),
  });
  return `/api/track/pixel?${params.toString()}`;
}

/**
 * Generate tracked link URL
 * Wraps a link with tracking parameters
 */
export function generateTrackedLinkUrl(
  originalUrl: string,
  campaignId: number,
  recipientId: number
): string {
  const params = new URLSearchParams({
    c: campaignId.toString(),
    r: recipientId.toString(),
    url: originalUrl,
  });
  return `/api/track/click?${params.toString()}`;
}
