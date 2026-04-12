import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getClientProjectsByToken,
  getProjectWithDetails,
  calculateProjectProgress,
  getMilestoneStatusSummary,
  getDeliverableStatusSummary,
} from "../services/clientPortalService";
import {
  calculateQuoteAmount,
  createQuoteRequest,
  getQuoteByCode,
  updateQuoteStatus,
} from "../services/quoteGeneratorService";

export const clientPortalRouter = router({
  // Client Portal Procedures
  getProjectsByToken: publicProcedure
    .input(z.object({ accessToken: z.string() }))
    .query(async ({ input }: any) => {
      const projects = await getClientProjectsByToken(input.accessToken);
      return projects;
    }),

  getProjectDetails: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        accessToken: z.string(),
      })
    )
    .query(async ({ input }: any) => {
      const details = await getProjectWithDetails(input.projectId, input.accessToken);
      if (!details) {
        throw new Error("Project not found or access denied");
      }

      const progress = calculateProjectProgress(details.milestones);
      const milestoneStatus = getMilestoneStatusSummary(details.milestones);
      const deliverableStatus = getDeliverableStatusSummary(details.deliverables);

      return {
        project: details.project,
        milestones: details.milestones,
        deliverables: details.deliverables,
        progress,
        milestoneStatus,
        deliverableStatus,
      };
    }),

  // Quote Generator Procedures
  calculateQuote: publicProcedure
    .input(
      z.object({
        projectName: z.string(),
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        buildingArea: z.number(),
        complexity: z.enum(["simple", "moderate", "complex"]),
        timeline: z.enum(["standard", "fast-track"]),
        disciplines: z.array(z.string()),
        numberOfFloors: z.number(),
        hasExistingModels: z.boolean(),
        coordinationRequired: z.boolean(),
        additionalServices: z.array(z.string()),
      })
    )
    .query(async ({ input }: any) => {
      const result = await calculateQuoteAmount(input);
      return result;
    }),

  submitQuoteRequest: publicProcedure
    .input(
      z.object({
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientPhone: z.string(),
        clientCompany: z.string(),
        projectName: z.string(),
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        buildingArea: z.number(),
        complexity: z.enum(["simple", "moderate", "complex"]),
        timeline: z.enum(["standard", "fast-track"]),
        disciplines: z.array(z.string()),
        numberOfFloors: z.number(),
        hasExistingModels: z.boolean(),
        coordinationRequired: z.boolean(),
        additionalServices: z.array(z.string()),
        quoteAmount: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      const questionnaire = {
        projectName: input.projectName,
        projectType: input.projectType,
        buildingArea: input.buildingArea,
        complexity: input.complexity,
        timeline: input.timeline,
        disciplines: input.disciplines,
        numberOfFloors: input.numberOfFloors,
        hasExistingModels: input.hasExistingModels,
        coordinationRequired: input.coordinationRequired,
        additionalServices: input.additionalServices,
      };

      const result = await createQuoteRequest(
        input.clientName,
        input.clientEmail,
        input.clientPhone,
        input.clientCompany,
        questionnaire,
        input.quoteAmount
      );

      if (!result) {
        throw new Error("Failed to create quote request");
      }

      // TODO: Send email with quote
      // TODO: Trigger GA4 event for quote submission

      return {
        quoteCode: result.quoteCode,
        message: "Quote request submitted successfully. Check your email for the proposal.",
      };
    }),

  getQuote: publicProcedure
    .input(z.object({ quoteCode: z.string() }))
    .query(async ({ input }: any) => {
      const quote = await getQuoteByCode(input.quoteCode);
      if (!quote) {
        throw new Error("Quote not found");
      }

      // Mark as viewed
      await updateQuoteStatus(input.quoteCode, "viewed");

      return quote;
    }),

  acceptQuote: publicProcedure
    .input(z.object({ quoteCode: z.string() }))
    .mutation(async ({ input }: any) => {
      const success = await updateQuoteStatus(input.quoteCode, "accepted");
      if (!success) {
        throw new Error("Failed to accept quote");
      }

      // TODO: Send acceptance notification to admin
      // TODO: Create project from quote

      return { message: "Quote accepted successfully" };
    }),

  rejectQuote: publicProcedure
    .input(
      z.object({
        quoteCode: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const success = await updateQuoteStatus(input.quoteCode, "rejected");
      if (!success) {
        throw new Error("Failed to reject quote");
      }

      // TODO: Send rejection notification to admin

      return { message: "Quote rejected" };
    }),
});
