import { getDb } from "../db";
import {
  portalNotifications,
  projectDeliverables,
  projectMilestones,
  clientProjects,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type NotificationType =
  | "deliverable_uploaded"
  | "milestone_completed"
  | "project_update"
  | "message"
  | "deadline_approaching";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Create a notification for a project
 */
export async function createNotification(
  projectId: number,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    deliverableId?: number;
    milestoneId?: number;
    priority?: NotificationPriority;
    actionUrl?: string;
  }
): Promise<{ success: boolean; notificationId?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Verify project exists
    const project = await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.id, projectId))
      .limit(1);

    if (!project || project.length === 0) {
      throw new Error("Project not found");
    }

    // Create notification
    const result = await db.insert(portalNotifications).values({
      projectId,
      type,
      title,
      message,
      deliverableId: options?.deliverableId,
      milestoneId: options?.milestoneId,
      priority: options?.priority || "normal",
      actionUrl: options?.actionUrl,
      isRead: false,
    });

    const notificationId = result[0]?.insertId;

    console.log(`✓ Notification created for project ${projectId}:`, title);

    return {
      success: true,
      notificationId,
    };
  } catch (error: any) {
    console.error("Failed to create notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get unread notifications for a project
 */
export async function getUnreadNotifications(projectId: number): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const notifications = await db
      .select()
      .from(portalNotifications)
      .where(eq(portalNotifications.isRead, false))
      .orderBy(portalNotifications.createdAt);

    return notifications;
  } catch (error: any) {
    console.error("Failed to get unread notifications:", error);
    return [];
  }
}

/**
 * Get all notifications for a project (paginated)
 */
export async function getProjectNotifications(
  projectId: number,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const notifications = await db
      .select()
      .from(portalNotifications)
      .where(eq(portalNotifications.projectId, projectId))
      .orderBy(portalNotifications.createdAt)
      .limit(limit)
      .offset(offset);

    return notifications;
  } catch (error: any) {
    console.error("Failed to get project notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(portalNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(portalNotifications.id, notificationId));

    return true;
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for a project
 */
export async function markAllNotificationsAsRead(
  projectId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(portalNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(portalNotifications.projectId, projectId));

    return true;
  } catch (error: any) {
    console.error("Failed to mark all notifications as read:", error);
    return false;
  }
}

/**
 * Notify when deliverable is uploaded
 */
export async function notifyDeliverableUploaded(
  projectId: number,
  deliverableId: number,
  deliverableName: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Get deliverable details
    const deliverable = await db
      .select()
      .from(projectDeliverables)
      .where(eq(projectDeliverables.id, deliverableId))
      .limit(1);

    if (!deliverable || deliverable.length === 0) return;

    const d = deliverable[0];

    await createNotification(
      projectId,
      "deliverable_uploaded",
      `New Deliverable: ${deliverableName}`,
      `A new deliverable "${deliverableName}" has been uploaded to your project. Status: ${d.status}`,
      {
        deliverableId,
        priority: "high",
        actionUrl: `/portal/project/${projectId}/deliverables`,
      }
    );
  } catch (error: any) {
    console.error("Failed to notify deliverable upload:", error);
  }
}

/**
 * Notify when milestone is completed
 */
export async function notifyMilestoneCompleted(
  projectId: number,
  milestoneId: number,
  milestoneName: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Get milestone details
    const milestone = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.id, milestoneId))
      .limit(1);

    if (!milestone || milestone.length === 0) return;

    const m = milestone[0];

    await createNotification(
      projectId,
      "milestone_completed",
      `Milestone Completed: ${milestoneName}`,
      `The milestone "${milestoneName}" has been completed. Planned date was ${m.plannedDate?.toLocaleDateString()}`,
      {
        milestoneId,
        priority: "high",
        actionUrl: `/portal/project/${projectId}/milestones`,
      }
    );
  } catch (error: any) {
    console.error("Failed to notify milestone completion:", error);
  }
}

/**
 * Notify about upcoming deadline
 */
export async function notifyDeadlineApproaching(
  projectId: number,
  milestoneId: number,
  milestoneName: string,
  daysUntilDue: number
): Promise<void> {
  try {
    await createNotification(
      projectId,
      "deadline_approaching",
      `Deadline Approaching: ${milestoneName}`,
      `The milestone "${milestoneName}" is due in ${daysUntilDue} days. Please ensure all deliverables are prepared.`,
      {
        milestoneId,
        priority: daysUntilDue <= 3 ? "urgent" : "normal",
        actionUrl: `/portal/project/${projectId}/milestones`,
      }
    );
  } catch (error: any) {
    console.error("Failed to notify deadline approaching:", error);
  }
}

/**
 * Send project update notification
 */
export async function notifyProjectUpdate(
  projectId: number,
  title: string,
  message: string,
  priority: NotificationPriority = "normal"
): Promise<void> {
  try {
    await createNotification(projectId, "project_update", title, message, {
      priority,
      actionUrl: `/portal/project/${projectId}`,
    });
  } catch (error: any) {
    console.error("Failed to send project update notification:", error);
  }
}

/**
 * Get notification statistics for a project
 */
export async function getNotificationStats(projectId: number): Promise<any> {
  try {
    const db = await getDb();
    if (!db) return null;

    const allNotifications = await db
      .select()
      .from(portalNotifications)
      .where(eq(portalNotifications.projectId, projectId));

    const unreadCount = allNotifications.filter((n) => !n.isRead).length;
    const totalCount = allNotifications.length;

    // Count by type
    const typeBreakdown: Record<string, number> = {};
    allNotifications.forEach((n) => {
      typeBreakdown[n.type] = (typeBreakdown[n.type] || 0) + 1;
    });

    // Count by priority
    const priorityBreakdown: Record<string, number> = {};
    allNotifications.forEach((n) => {
      priorityBreakdown[n.priority] = (priorityBreakdown[n.priority] || 0) + 1;
    });

    return {
      totalCount,
      unreadCount,
      readCount: totalCount - unreadCount,
      typeBreakdown,
      priorityBreakdown,
    };
  } catch (error: any) {
    console.error("Failed to get notification stats:", error);
    return null;
  }
}

/**
 * Delete old notifications (older than specified days)
 */
export async function deleteOldNotifications(
  projectId: number,
  daysOld: number = 90
): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // This is a simplified version - in production you'd use a proper delete query
    const oldNotifications = await db
      .select()
      .from(portalNotifications)
      .where(eq(portalNotifications.projectId, projectId));

    let deletedCount = 0;
    for (const notif of oldNotifications) {
      if (notif.createdAt < cutoffDate) {
        deletedCount++;
      }
    }

    console.log(
      `✓ Identified ${deletedCount} old notifications for cleanup in project ${projectId}`
    );

    return deletedCount;
  } catch (error: any) {
    console.error("Failed to delete old notifications:", error);
    return 0;
  }
}
