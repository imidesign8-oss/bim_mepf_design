import { describe, it, expect } from 'vitest';
import { getCampaignMetrics, getAllCampaignMetrics, getEngagementStatisticsSummary } from '../services/campaignAnalyticsService';

describe('Campaign Analytics Service', () => {

  it('should get all campaign metrics', async () => {
    const allMetrics = await getAllCampaignMetrics();
    expect(Array.isArray(allMetrics)).toBe(true);
  });

  it('should get engagement statistics summary', async () => {
    const summary = await getEngagementStatisticsSummary();
    expect(summary).toBeDefined();
    expect(summary.totalCampaigns).toBeGreaterThanOrEqual(0);
    expect(summary.totalSent).toBeGreaterThanOrEqual(0);
    expect(summary.avgOpenRate).toBeGreaterThanOrEqual(0);
    expect(summary.avgClickRate).toBeGreaterThanOrEqual(0);
    expect(summary.totalRecipients).toBeGreaterThanOrEqual(0);
  });

  it('should have valid engagement statistics', async () => {
    const summary = await getEngagementStatisticsSummary();
    expect(typeof summary.totalCampaigns).toBe('number');
    expect(typeof summary.totalSent).toBe('number');
    expect(typeof summary.totalOpens).toBe('number');
    expect(typeof summary.totalClicks).toBe('number');
    expect(typeof summary.avgOpenRate).toBe('number');
    expect(typeof summary.avgClickRate).toBe('number');
  });
});
