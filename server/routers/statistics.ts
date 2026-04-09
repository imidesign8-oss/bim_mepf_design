import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb, getAllProjects } from "../db";
import { projects, users } from "../../drizzle/schema";
import { eq, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function ensureAdmin(ctx: any) {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

export const statisticsRouter = router({
  // Get project statistics (completed, ongoing, total)
  getProjectStats: publicProcedure.query(async () => {
    try {
      const allProjects = await getAllProjects();
      const published = allProjects.filter(p => p.published);
      
      const completed = published.filter(p => p.status === "completed").length;
      const ongoing = published.filter(p => p.status === "ongoing").length;
      const total = published.length;
      
      return { completed, ongoing, total };
    } catch (error) {
      console.error("[STATS] Error fetching project stats:", error);
      return { completed: 0, ongoing: 0, total: 0 };
    }
  }),

  // Get unique clients count
  getUniqueClients: publicProcedure.query(async () => {
    try {
      const allProjects = await getAllProjects();
      const published = allProjects.filter(p => p.published);
      
      // Get unique clients
      const uniqueClients = new Set(
        published
          .filter(p => p.client && p.client.trim())
          .map(p => (p.client as string).toLowerCase())
      );
      
      return { count: uniqueClients.size };
    } catch (error) {
      console.error("[STATS] Error fetching unique clients:", error);
      return { count: 0 };
    }
  }),

  // Get team members count (admin only)
  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    ensureAdmin(ctx);
    try {
      const db = await getDb();
      if (!db) return { count: 0 };
      
      const result = await db
        .select({ count: count() })
        .from(users);
      
      return { count: result[0]?.count || 0 };
    } catch (error) {
      console.error("[STATS] Error fetching team members:", error);
      return { count: 0 };
    }
  }),

  // Get years in business (based on earliest project)
  getYearsInBusiness: publicProcedure.query(async () => {
    try {
      const allProjects = await getAllProjects();
      
      if (allProjects.length === 0) {
        return { years: 10 }; // Default fallback
      }
      
      // Find earliest project creation date
      const earliestProject = allProjects.reduce((earliest, current) => {
        if (!earliest.createdAt) return current;
        return new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest;
      });
      
      if (earliestProject.createdAt) {
        const startDate = new Date(earliestProject.createdAt);
        const now = new Date();
        const years = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
        return { years: Math.max(years, 1) };
      }
      
      return { years: 10 };
    } catch (error) {
      console.error("[STATS] Error fetching years in business:", error);
      return { years: 10 };
    }
  }),

  // Get all statistics at once
  getAllStats: publicProcedure.query(async () => {
    try {
      const allProjects = await getAllProjects();
      const published = allProjects.filter(p => p.published);
      
      const projectStats = {
        completed: published.filter(p => p.status === "completed").length,
        ongoing: published.filter(p => p.status === "ongoing").length,
        total: published.length,
      };
      
      const uniqueClients = new Set(
        published
          .filter(p => p.client && p.client.trim())
          .map(p => (p.client as string).toLowerCase())
      );
      
      let years = 10;
      if (allProjects.length > 0) {
        const earliestProject = allProjects.reduce((earliest, current) => {
          if (!earliest.createdAt) return current;
          return new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest;
        });
        
        if (earliestProject.createdAt) {
          const startDate = new Date(earliestProject.createdAt);
          const now = new Date();
          years = Math.max(Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)), 1);
        }
      }
      
      return {
        projectsCompleted: projectStats.completed,
        projectsOngoing: projectStats.ongoing,
        projectsTotal: projectStats.total,
        uniqueClients: uniqueClients.size,
        yearsInBusiness: years,
      };
    } catch (error) {
      console.error("[STATS] Error fetching all stats:", error);
      return {
        projectsCompleted: 0,
        projectsOngoing: 0,
        projectsTotal: 0,
        uniqueClients: 0,
        yearsInBusiness: 10,
      };
    }
  }),
});
