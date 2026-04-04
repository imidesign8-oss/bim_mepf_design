/**
 * Unsubscribe Router
 * tRPC procedures for managing email unsubscribe functionality
 */

import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  unsubscribeRecipient,
  unsubscribeByEmail,
  resubscribeRecipient,
  isUnsubscribed,
  getUnsubscribeStats,
  getUnsubscribedRecipients,
} from '../services/unsubscribeService';

export const unsubscribeRouter = router({
  /**
   * Unsubscribe a recipient by ID
   */
  unsubscribeById: publicProcedure
    .input(z.object({
      recipientId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const success = await unsubscribeRecipient(input.recipientId);
      return {
        success,
        message: success ? 'Successfully unsubscribed' : 'Failed to unsubscribe',
      };
    }),

  /**
   * Unsubscribe a recipient by email
   */
  unsubscribeByEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const success = await unsubscribeByEmail(input.email);
      return {
        success,
        message: success ? 'Successfully unsubscribed' : 'Email not found or already unsubscribed',
      };
    }),

  /**
   * Resubscribe a recipient
   */
  resubscribe: publicProcedure
    .input(z.object({
      recipientId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const success = await resubscribeRecipient(input.recipientId);
      return {
        success,
        message: success ? 'Successfully resubscribed' : 'Failed to resubscribe',
      };
    }),

  /**
   * Check if a recipient is unsubscribed
   */
  isUnsubscribed: publicProcedure
    .input(z.object({
      recipientId: z.number(),
    }))
    .query(async ({ input }) => {
      const unsubscribed = await isUnsubscribed(input.recipientId);
      return { unsubscribed };
    }),

  /**
   * Get unsubscribe statistics
   */
  getStats: publicProcedure
    .query(async () => {
      return await getUnsubscribeStats();
    }),

  /**
   * Get list of unsubscribed recipients
   */
  getUnsubscribedList: publicProcedure
    .query(async () => {
      return await getUnsubscribedRecipients();
    }),
});
