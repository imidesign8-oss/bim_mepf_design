import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { leadScores, leadScoringRules, leadRouting, contacts, salesTeamMembers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyLeadToSalesTeam, getLeadNotificationHistory, getSalesTeamMembersForAdmin } from "../services/leadNotificationService";

/**
 * Lead Scoring Router - Handles lead qualification and scoring logic
 */
export const leadScoringRouter = router({
  /**
   * Calculate lead score for a contact based on provided criteria
   */
  calculateScore: adminProcedure
    .input(
      z.object({
        contactId: z.number(),
        projectType: z.enum(["BIM", "MEPF", "Quantities & Estimation"]).optional(),
        projectSize: z.enum(["Small", "Medium", "Large"]).optional(),
        estimatedBudget: z.string().optional(),
        timeline: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let totalScore = 0;
        const scoringBreakdown: Record<string, number> = {};

        // Score based on project type
        if (input.projectType) {
          const typeScore = input.projectType === "BIM" ? 25 : input.projectType === "MEPF" ? 20 : 15;
          totalScore += typeScore;
          scoringBreakdown["projectType"] = typeScore;
        }

        // Score based on project size
        if (input.projectSize) {
          const sizeScore = input.projectSize === "Large" ? 30 : input.projectSize === "Medium" ? 20 : 10;
          totalScore += sizeScore;
          scoringBreakdown["projectSize"] = sizeScore;
        }

        // Score based on budget
        if (input.estimatedBudget) {
          const budgetScore = input.estimatedBudget.includes("High") ? 25 : input.estimatedBudget.includes("Medium") ? 15 : 5;
          totalScore += budgetScore;
          scoringBreakdown["budget"] = budgetScore;
        }

        // Score based on timeline
        if (input.timeline) {
          const timelineScore = input.timeline.includes("Urgent") ? 20 : input.timeline.includes("Soon") ? 15 : 5;
          totalScore += timelineScore;
          scoringBreakdown["timeline"] = timelineScore;
        }

        // Determine qualification level
        const qualification = totalScore >= 80 ? "qualified" : totalScore >= 60 ? "hot" : totalScore >= 40 ? "warm" : "cold";

        // Upsert lead score
        const existingScore = await (db as any)
          .select()
          .from(leadScores)
          .where(eq(leadScores.contactId, input.contactId))
          .limit(1);

        if (existingScore.length > 0) {
          await (db as any)
            .update(leadScores)
            .set({
              totalScore,
              qualification,
              projectType: input.projectType,
              projectSize: input.projectSize,
              estimatedBudget: input.estimatedBudget,
              timeline: input.timeline,
              updatedAt: new Date(),
            })
            .where(eq(leadScores.contactId, input.contactId));
        } else {
          await (db as any).insert(leadScores).values({
            contactId: input.contactId,
            totalScore,
            qualification,
            projectType: input.projectType,
            projectSize: input.projectSize,
            estimatedBudget: input.estimatedBudget,
            timeline: input.timeline,
          });
        }

        return {
          success: true,
          score: totalScore,
          qualification,
          breakdown: scoringBreakdown,
        };
      } catch (error) {
        console.error("Error calculating lead score:", error);
        return {
          success: false,
          error: "Failed to calculate lead score",
        };
      }
    }),

  /**
   * Get all leads with their scores and qualification levels
   */
  getAllLeads: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const leads = await (db as any)
        .select({
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
          phone: contacts.phone,
          subject: contacts.subject,
          createdAt: contacts.createdAt,
          score: leadScores.totalScore,
          qualification: leadScores.qualification,
          projectType: leadScores.projectType,
          projectSize: leadScores.projectSize,
          estimatedBudget: leadScores.estimatedBudget,
          timeline: leadScores.timeline,
        })
        .from(contacts)
        .leftJoin(leadScores, eq(contacts.id, leadScores.contactId));

      return leads;
    } catch (error) {
      console.error("Error fetching leads:", error);
      return [];
    }
  }),

  /**
   * Get lead scoring statistics
   */
  getStatistics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allLeads = await (db as any)
        .select({ qualification: leadScores.qualification })
        .from(leadScores);

      const stats = {
        total: allLeads.length,
        qualified: allLeads.filter((l: any) => l.qualification === "qualified").length,
        hot: allLeads.filter((l: any) => l.qualification === "hot").length,
        warm: allLeads.filter((l: any) => l.qualification === "warm").length,
        cold: allLeads.filter((l: any) => l.qualification === "cold").length,
      };

      return stats;
    } catch (error) {
      console.error("Error fetching lead statistics:", error);
      return {
        total: 0,
        qualified: 0,
        hot: 0,
        warm: 0,
        cold: 0,
      };
    }
  }),

  /**
   * Assign lead to sales team member
   */
  assignLead: adminProcedure
    .input(
      z.object({
        contactId: z.number(),
        assignedToUserId: z.number(),
        routingReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const existingRouting = await (db as any)
          .select()
          .from(leadRouting)
          .where(eq(leadRouting.contactId, input.contactId))
          .limit(1);

        if (existingRouting.length > 0) {
          await (db as any)
            .update(leadRouting)
            .set({
              assignedToUserId: input.assignedToUserId,
              routingReason: input.routingReason,
              updatedAt: new Date(),
            })
            .where(eq(leadRouting.contactId, input.contactId));
        } else {
          await (db as any).insert(leadRouting).values({
            contactId: input.contactId,
            assignedToUserId: input.assignedToUserId,
            routingReason: input.routingReason,
          });
        }

        return {
          success: true,
          message: "Lead assigned successfully",
        };
      } catch (error) {
        console.error("Error assigning lead:", error);
        return {
          success: false,
          error: "Failed to assign lead",
        };
      }
    }),

  /**
   * Send lead notification to sales team
   */
  sendLeadNotification: adminProcedure
    .input(
      z.object({
        contactId: z.number(),
        leadScoreId: z.number().optional(),
        leadScore: z.number(),
        qualification: z.string(),
        contactName: z.string(),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        projectType: z.string().optional(),
        projectSize: z.string().optional(),
        estimatedBudget: z.string().optional(),
        timeline: z.string().optional(),
        message: z.string().optional(),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await notifyLeadToSalesTeam(input);
        return result;
      } catch (error) {
        console.error("Error sending lead notification:", error);
        return {
          success: false,
          notificationsSent: 0,
          errors: ["Failed to send lead notification"],
        };
      }
    }),

  /**
   * Get notification history for a lead
   */
  getNotificationHistory: adminProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ input }) => {
      try {
        const notifications = await getLeadNotificationHistory(input.contactId);
        return notifications;
      } catch (error) {
        console.error("Error fetching notification history:", error);
        return [];
      }
    }),

  /**
   * Get sales team members
   */
  getSalesTeamMembers: adminProcedure.query(async () => {
    try {
      const members = await getSalesTeamMembersForAdmin();
      return members;
    } catch (error) {
      console.error("Error fetching sales team members:", error);
      return [];
    }
  }),

  /**
   * Add sales team member
   */
  addSalesTeamMember: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        role: z.string().optional(),
        specialization: z.string().optional(),
        notificationPreference: z.enum(["all", "qualified_only", "hot_and_qualified", "none"]).default("all"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await (db as any).insert(salesTeamMembers).values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: input.role,
          specialization: input.specialization,
          notificationPreference: input.notificationPreference,
          isActive: true,
        });

        return {
          success: true,
          message: "Sales team member added successfully",
        };
      } catch (error) {
        console.error("Error adding sales team member:", error);
        return {
          success: false,
          error: "Failed to add sales team member",
        };
      }
    }),

  /**
   * Update sales team member
   */
  updateSalesTeamMember: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.string().optional(),
        specialization: z.string().optional(),
        notificationPreference: z.enum(["all", "qualified_only", "hot_and_qualified", "none"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...updateData } = input;
        const updateFields: any = {};
        
        if (updateData.name) updateFields.name = updateData.name;
        if (updateData.email) updateFields.email = updateData.email;
        if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
        if (updateData.role !== undefined) updateFields.role = updateData.role;
        if (updateData.specialization !== undefined) updateFields.specialization = updateData.specialization;
        if (updateData.notificationPreference) updateFields.notificationPreference = updateData.notificationPreference;
        if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
        updateFields.updatedAt = new Date();

        await (db as any)
          .update(salesTeamMembers)
          .set(updateFields)
          .where(eq(salesTeamMembers.id, id));

        return {
          success: true,
          message: "Sales team member updated successfully",
        };
      } catch (error) {
        console.error("Error updating sales team member:", error);
        return {
          success: false,
          error: "Failed to update sales team member",
        };
      }
    }),
});
