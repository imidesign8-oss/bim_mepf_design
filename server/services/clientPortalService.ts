import { getDb } from "../db";
import { clientProjects, projectMilestones, projectDeliverables } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/**
 * Generate secure access token for client portal
 */
export function generatePortalAccessToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get client projects by access token
 */
export async function getClientProjectsByToken(accessToken: string) {
  const db = await getDb();
  if (!db) return [];
  
  const projects = await db
    .select()
    .from(clientProjects)
    .where(
      and(
        eq(clientProjects.portalAccessToken, accessToken),
        eq(clientProjects.portalAccessEnabled, true)
      )
    );
  
  return projects;
}

/**
 * Get single project with all details
 */
export async function getProjectWithDetails(projectId: number, accessToken: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Verify access token matches project
  const project = await db
    .select()
    .from(clientProjects)
    .where(
      and(
        eq(clientProjects.id, projectId),
        eq(clientProjects.portalAccessToken, accessToken),
        eq(clientProjects.portalAccessEnabled, true)
      )
    );
  
  if (!project || project.length === 0) {
    return null;
  }
  
  // Get milestones
  const milestones = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId));
  
  // Get deliverables
  const deliverables = await db
    .select()
    .from(projectDeliverables)
    .where(
      and(
        eq(projectDeliverables.projectId, projectId),
        eq(projectDeliverables.visibleToClient, true)
      )
    );
  
  return {
    project: project[0],
    milestones,
    deliverables,
  };
}

/**
 * Get project milestones
 */
export async function getProjectMilestones(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId));
}

/**
 * Get project deliverables visible to client
 */
export async function getProjectDeliverables(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projectDeliverables)
    .where(
      and(
        eq(projectDeliverables.projectId, projectId),
        eq(projectDeliverables.visibleToClient, true)
      )
    );
}

/**
 * Calculate project progress percentage
 */
export function calculateProjectProgress(milestones: any[]): number {
  if (milestones.length === 0) return 0;
  
  const totalCompletion = milestones.reduce((sum, m) => sum + m.completionPercentage, 0);
  return Math.round(totalCompletion / milestones.length);
}

/**
 * Get milestone status summary
 */
export function getMilestoneStatusSummary(milestones: any[]) {
  return {
    total: milestones.length,
    completed: milestones.filter(m => m.status === "completed").length,
    inProgress: milestones.filter(m => m.status === "in-progress").length,
    pending: milestones.filter(m => m.status === "pending").length,
    delayed: milestones.filter(m => m.status === "delayed").length,
  };
}

/**
 * Get deliverable status summary
 */
export function getDeliverableStatusSummary(deliverables: any[]) {
  return {
    total: deliverables.length,
    delivered: deliverables.filter(d => d.status === "delivered").length,
    ready: deliverables.filter(d => d.status === "ready").length,
    inProgress: deliverables.filter(d => d.status === "in-progress").length,
    pending: deliverables.filter(d => d.status === "pending").length,
  };
}
