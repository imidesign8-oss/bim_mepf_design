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
import { generateProposalPDF } from "../services/pdfGeneratorService";

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

  generateProposalPDF: publicProcedure
    .input(
      z.object({
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientCompany: z.string().optional(),
        projectName: z.string(),
        projectType: z.string(),
        buildingArea: z.number(),
        complexity: z.string(),
        timeline: z.string(),
        disciplines: z.array(z.string()),
        additionalServices: z.array(z.string()),
        coordinationRequired: z.boolean(),
        estimatedPrice: z.number(),
        priceBreakdown: z.object({
          basePrice: z.number(),
          complexityMultiplier: z.number(),
          timelineMultiplier: z.number(),
          coordinationBonus: z.number(),
          existingModelsDiscount: z.number(),
        }),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        // Default deliverables based on disciplines
        const deliverables = [
          "3D BIM Model (Revit/IFC format)",
          "Architectural Drawings (Plans, Elevations, Sections)",
          "MEP Coordination Drawings",
          "Specifications & BOQ",
          "Project Report & Documentation",
        ];

        // Default milestones
        const milestones = [
          {
            name: "Concept Design",
            duration: "2-3 weeks",
            description: "Initial design concept and client approval",
          },
          {
            name: "Design Development",
            duration: "3-4 weeks",
            description: "Detailed design development and coordination",
          },
          {
            name: "Construction Documents",
            duration: "2-3 weeks",
            description: "Final construction documents and specifications",
          },
          {
            name: "Project Delivery",
            duration: "1 week",
            description: "Final deliverables and project handover",
          },
        ];

        const proposalData = {
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientCompany: input.clientCompany || "N/A",
          projectName: input.projectName,
          projectType: input.projectType,
          buildingArea: input.buildingArea,
          complexity: input.complexity,
          timeline: input.timeline,
          disciplines: input.disciplines,
          additionalServices: input.additionalServices,
          coordinationRequired: input.coordinationRequired,
          estimatedPrice: input.estimatedPrice,
          priceBreakdown: input.priceBreakdown,
          deliverables,
          milestones,
          proposalDate: new Date(),
          validityDays: 30,
        };

        const pdfBuffer = await generateProposalPDF(proposalData);

        // Return base64 encoded PDF for download
        return {
          success: true,
          pdf: pdfBuffer.toString("base64"),
          fileName: `Proposal_${input.projectName.replace(/\s+/g, "_")}_${Date.now()}.pdf`,
          message: "Proposal PDF generated successfully",
        };
      } catch (error) {
        console.error("Error generating proposal PDF:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate proposal PDF",
        });
      }
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

      return {
        message: "Quote accepted successfully. Our team will contact you soon.",
      };
    }),

  rejectQuote: publicProcedure
    .input(z.object({ quoteCode: z.string() }))
    .mutation(async ({ input }: any) => {
      const success = await updateQuoteStatus(input.quoteCode, "rejected");
      if (!success) {
        throw new Error("Failed to reject quote");
      }

      return {
        message: "Quote rejected. We appreciate your consideration.",
      };
    }),
});
