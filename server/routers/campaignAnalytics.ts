import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  getCampaignMetrics,
  getAllCampaignMetrics,
  getCampaignEngagementTimeline,
  getTopCampaignsByOpenRate,
  getTopCampaignsByClickRate,
  getCampaignRecipientEngagement,
  getEngagementStatisticsSummary,
} from '../services/campaignAnalyticsService';
import { trackEmailOpen, trackEmailClick } from '../services/emailTrackingService';

export const campaignAnalyticsRouter = router({
  /**
   * Get metrics for a specific campaign
   */
  getCampaignMetrics: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return await getCampaignMetrics(input.campaignId);
    }),

  /**
   * Get metrics for all campaigns
   */
  getAllCampaignMetrics: protectedProcedure.query(async () => {
    return await getAllCampaignMetrics();
  }),

  /**
   * Get engagement timeline for a campaign
   */
  getCampaignEngagementTimeline: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return await getCampaignEngagementTimeline(input.campaignId);
    }),

  /**
   * Get top campaigns by open rate
   */
  getTopCampaignsByOpenRate: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await getTopCampaignsByOpenRate(input.limit);
    }),

  /**
   * Get top campaigns by click rate
   */
  getTopCampaignsByClickRate: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await getTopCampaignsByClickRate(input.limit);
    }),

  /**
   * Get recipient engagement details for a campaign
   */
  getCampaignRecipientEngagement: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return await getCampaignRecipientEngagement(input.campaignId);
    }),

  /**
   * Get engagement statistics summary
   */
  getEngagementStatisticsSummary: protectedProcedure.query(async () => {
    return await getEngagementStatisticsSummary();
  }),

  /**
   * Track email open (called from tracking pixel)
   */
  trackEmailOpen: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        recipientId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await trackEmailOpen(input.campaignId, input.recipientId);
    }),

  /**
   * Track email click (called from tracked link)
   */
  trackEmailClick: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        recipientId: z.number(),
        linkUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await trackEmailClick(input.campaignId, input.recipientId, input.linkUrl);
    }),
});
