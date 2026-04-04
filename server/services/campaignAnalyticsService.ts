import { getDb } from '../db';
import { emailCampaigns, campaignRecipients } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Campaign Analytics Service
 * Provides comprehensive analytics and metrics for email campaigns
 */

export interface CampaignMetrics {
  campaignId: number;
  campaignName: string;
  campaignStatus: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  openCount: number;
  clickCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  bounceRate: number;
  createdAt: Date;
}

export interface DailyEngagementData {
  date: string;
  opens: number;
  clicks: number;
  sends: number;
}

export interface EngagementTimeline {
  timestamp: Date;
  opens: number;
  clicks: number;
}

/**
 * Get comprehensive metrics for a single campaign
 */
export async function getCampaignMetrics(campaignId: number): Promise<CampaignMetrics> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get campaign info
    const campaign = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, campaignId))
      .limit(1);

    if (!campaign || campaign.length === 0) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const campaignData = campaign[0];

    // Get recipient metrics
    const recipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));

    const sentCount = recipients.filter(r => r.status === 'sent').length;
    const failedCount = recipients.filter(r => r.status === 'failed').length;
    const pendingCount = recipients.filter(r => r.status === 'pending').length;
    const openCount = recipients.filter(r => r.opened).length;
    const clickCount = recipients.filter(r => r.clicked).length;
    const bouncedCount = recipients.filter(r => r.status === 'bounced').length;

    const totalRecipients = recipients.length;
    const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
    const clickRate = sentCount > 0 ? (clickCount / sentCount) * 100 : 0;
    const conversionRate = openCount > 0 ? (clickCount / openCount) * 100 : 0;
    const bounceRate = totalRecipients > 0 ? (bouncedCount / totalRecipients) * 100 : 0;

    return {
      campaignId,
      campaignName: campaignData.name,
      campaignStatus: campaignData.status,
      totalRecipients,
      sentCount,
      failedCount,
      pendingCount,
      openCount,
      clickCount,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      createdAt: campaignData.createdAt,
    };
  } catch (error) {
    console.error('Failed to get campaign metrics:', error);
    throw error;
  }
}

/**
 * Get metrics for all campaigns
 */
export async function getAllCampaignMetrics(): Promise<CampaignMetrics[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const campaigns = await db.select().from(emailCampaigns);

    const metrics = await Promise.all(
      campaigns.map(campaign => getCampaignMetrics(campaign.id))
    );

    return metrics;
  } catch (error) {
    console.error('Failed to get all campaign metrics:', error);
    throw error;
  }
}

/**
 * Get engagement timeline for a campaign
 * Shows opens and clicks over time
 */
export async function getCampaignEngagementTimeline(
  campaignId: number
): Promise<EngagementTimeline[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const recipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));

    // Group by timestamp and count opens/clicks
    const timeline: Map<number, EngagementTimeline> = new Map();

    recipients.forEach(r => {
      // Track opens
      if (r.openedAt) {
        const timestamp = Math.floor(r.openedAt.getTime() / (1000 * 60 * 5)) * (1000 * 60 * 5); // 5-min buckets
        const key = timestamp;
        const existing = timeline.get(key) || {
          timestamp: new Date(timestamp),
          opens: 0,
          clicks: 0,
        };
        existing.opens += 1;
        timeline.set(key, existing);
      }

      // Track clicks
      if (r.clickedAt) {
        const timestamp = Math.floor(r.clickedAt.getTime() / (1000 * 60 * 5)) * (1000 * 60 * 5); // 5-min buckets
        const key = timestamp;
        const existing = timeline.get(key) || {
          timestamp: new Date(timestamp),
          opens: 0,
          clicks: 0,
        };
        existing.clicks += 1;
        timeline.set(key, existing);
      }
    });

    // Convert to array and sort by timestamp
    return Array.from(timeline.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  } catch (error) {
    console.error('Failed to get campaign engagement timeline:', error);
    throw error;
  }
}

/**
 * Get top performing campaigns by open rate
 */
export async function getTopCampaignsByOpenRate(limit: number = 10): Promise<CampaignMetrics[]> {
  try {
    const allMetrics = await getAllCampaignMetrics();
    return allMetrics
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get top campaigns by open rate:', error);
    throw error;
  }
}

/**
 * Get top performing campaigns by click rate
 */
export async function getTopCampaignsByClickRate(limit: number = 10): Promise<CampaignMetrics[]> {
  try {
    const allMetrics = await getAllCampaignMetrics();
    return allMetrics
      .sort((a, b) => b.clickRate - a.clickRate)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get top campaigns by click rate:', error);
    throw error;
  }
}

/**
 * Get recipient engagement details for a campaign
 */
export async function getCampaignRecipientEngagement(campaignId: number) {
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
      timeToOpen: r.openedAt && r.sentAt
        ? Math.round((r.openedAt.getTime() - r.sentAt.getTime()) / (1000 * 60))
        : null,
      timeToClick: r.clickedAt && r.sentAt
        ? Math.round((r.clickedAt.getTime() - r.sentAt.getTime()) / (1000 * 60))
        : null,
    }));
  } catch (error) {
    console.error('Failed to get campaign recipient engagement:', error);
    throw error;
  }
}

/**
 * Get engagement statistics summary
 */
export async function getEngagementStatisticsSummary() {
  try {
    const allMetrics = await getAllCampaignMetrics();

    const totalCampaigns = allMetrics.length;
    const totalRecipients = allMetrics.reduce((sum, m) => sum + m.totalRecipients, 0);
    const totalSent = allMetrics.reduce((sum, m) => sum + m.sentCount, 0);
    const totalOpens = allMetrics.reduce((sum, m) => sum + m.openCount, 0);
    const totalClicks = allMetrics.reduce((sum, m) => sum + m.clickCount, 0);

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
    const avgConversionRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;

    return {
      totalCampaigns,
      totalRecipients,
      totalSent,
      totalOpens,
      totalClicks,
      avgOpenRate: Math.round(avgOpenRate * 100) / 100,
      avgClickRate: Math.round(avgClickRate * 100) / 100,
      avgConversionRate: Math.round(avgConversionRate * 100) / 100,
    };
  } catch (error) {
    console.error('Failed to get engagement statistics summary:', error);
    throw error;
  }
}
