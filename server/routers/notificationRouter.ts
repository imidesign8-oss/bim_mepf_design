import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getUnreadNotifications,
  getProjectNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationStats,
  notifyProjectUpdate,
} from "../services/notificationService";

export const notificationRouter = router({
  /**
   * Get unread notifications for a project
   */
  getUnreadNotifications: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input: { projectId } }: any) => {
      const notifications = await getUnreadNotifications(projectId);
      return notifications;
    }),

  /**
   * Get all notifications for a project (paginated)
   */
  getProjectNotifications: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input: { projectId, limit, offset } }: any) => {
      const notifications = await getProjectNotifications(
        projectId,
        limit,
        offset
      );
      return notifications;
    }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input: { notificationId } }: any) => {
      const success = await markNotificationAsRead(notificationId);
      return { success };
    }),

  /**
   * Mark all notifications as read for a project
   */
  markAllAsRead: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input: { projectId } }: any) => {
      const success = await markAllNotificationsAsRead(projectId);
      return { success };
    }),

  /**
   * Get notification statistics for a project
   */
  getStats: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input: { projectId } }: any) => {
      const stats = await getNotificationStats(projectId);
      return stats;
    }),

  /**
   * Send a project update notification (admin only)
   */
  sendProjectUpdate: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string(),
        message: z.string(),
        priority: z
          .enum(["low", "normal", "high", "urgent"])
          .optional()
          .default("normal"),
      })
    )
    .mutation(async ({ input: { projectId, title, message, priority } }: any) => {
      try {
        await notifyProjectUpdate(projectId, title, message, priority);
        return {
          success: true,
          message: "Notification sent successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),
});
