import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { chatConversations, chatMessages } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an expert AI assistant for IMI DESIGN, a professional BIM and MEPF design services company. Your role is to:

1. Answer questions about BIM (Building Information Modeling), MEPF (Mechanical, Electrical, Plumbing, Fire Fighting) design services
2. Help clients understand the value of professional BIM coordination and MEP design
3. Qualify leads by understanding their project needs, budget, and timeline
4. Provide helpful information about the company's services: BIM Coordination, MEP Design & Modeling, 3D Visualization & Rendering, Clash Detection, and Consulting

When interacting with visitors:
- Be professional, friendly, and helpful
- Ask clarifying questions about their project needs
- Provide specific examples from residential and commercial projects
- Mention relevant services that could help them
- Collect information about: project type, budget range, timeline, specific challenges
- If a query is complex or requires human expertise, suggest routing to the team

Key services to mention:
- BIM Coordination: Expert coordination for seamless multi-discipline integration
- MEP Design & Modeling: Complete mechanical, electrical, and plumbing design solutions
- 3D Visualization & Rendering: Stunning 3D renderings for client presentations
- Clash Detection: Identifying and resolving conflicts before construction
- Consulting: Expert guidance on BIM implementation and MEP coordination strategies

Always be honest about what you can help with and when human expertise is needed.`;

// Lead qualification scoring
function calculateLeadScore(
  conversation: any,
  messageCount: number
): number {
  let score = 0;

  // Email provided: +20 points
  if (conversation.visitorEmail) score += 20;

  // Phone provided: +15 points
  if (conversation.visitorPhone) score += 15;

  // Name provided: +10 points
  if (conversation.visitorName) score += 10;

  // Service interest specified: +20 points
  if (conversation.serviceInterest) score += 20;

  // Budget mentioned: +15 points
  if (conversation.projectBudget) score += 15;

  // Timeline mentioned: +10 points
  if (conversation.projectTimeline) score += 10;

  // Engagement (message count): +1 point per message (max 10)
  score += Math.min(messageCount, 10);

  return Math.min(score, 100);
}

// Extract lead information from conversation
function extractLeadInfo(messages: any[]) {
  const conversationText = messages.map((m) => m.content).join(" ");

  const emailMatch = conversationText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = conversationText.match(/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/);

  const services = ["BIM Coordination", "MEP Design", "3D Visualization", "Clash Detection", "Consulting"];
  let serviceInterest = null;
  for (const service of services) {
    if (conversationText.toLowerCase().includes(service.toLowerCase())) {
      serviceInterest = service;
      break;
    }
  }

  const budgetKeywords = ["budget", "cost", "price", "investment"];
  let projectBudget = null;
  for (const keyword of budgetKeywords) {
    if (conversationText.toLowerCase().includes(keyword)) {
      projectBudget = "Interested";
      break;
    }
  }

  const timelineKeywords = ["timeline", "deadline", "schedule", "when", "soon"];
  let projectTimeline = null;
  for (const keyword of timelineKeywords) {
    if (conversationText.toLowerCase().includes(keyword)) {
      projectTimeline = "Mentioned";
      break;
    }
  }

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    serviceInterest,
    projectBudget,
    projectTimeline,
  };
}

export const chatRouter = router({
  // Create or get conversation
  getOrCreateConversation: publicProcedure
    .input(z.object({ visitorId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db.select().from(chatConversations)
        .where(eq(chatConversations.visitorId, input.visitorId))
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      await db.insert(chatConversations).values({
        visitorId: input.visitorId,
        status: "active",
      });

      const newConv = await db.select().from(chatConversations)
        .where(eq(chatConversations.visitorId, input.visitorId))
        .limit(1);

      return newConv[0];
    }),

  // Send message and get AI response
  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        visitorId: z.string(),
        message: z.string(),
        visitorEmail: z.string().optional(),
        visitorName: z.string().optional(),
        visitorPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Save user message
      await db.insert(chatMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
      });

      // Update conversation with visitor info if provided
      if (input.visitorEmail || input.visitorName || input.visitorPhone) {
        await db
          .update(chatConversations)
          .set({
            visitorEmail: input.visitorEmail || undefined,
            visitorName: input.visitorName || undefined,
            visitorPhone: input.visitorPhone || undefined,
          })
          .where(eq(chatConversations.id, input.conversationId));
      }

      // Get conversation history
      const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(desc(chatMessages.createdAt));

      // Build message array for LLM
      const llmMessages: any[] = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Get AI response
      const response = await invokeLLM({
        messages: llmMessages,
      });

      const assistantContent = response.choices[0].message.content;
      const assistantMessage = typeof assistantContent === 'string' ? assistantContent : JSON.stringify(assistantContent);

      // Save assistant message
      await db.insert(chatMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: assistantMessage,
      });

      // Update lead qualification
      const allMessages = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId));

      const leadInfo = extractLeadInfo(allMessages);
      const convData = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, input.conversationId))
        .limit(1);
      
      const leadScore = calculateLeadScore(
        convData[0],
        allMessages.length
      );

      // Check if should be routed to admin (high lead score or complex query)
      const shouldRoute =
        leadScore >= 60 ||
        input.message.toLowerCase().includes("need to speak with") ||
        input.message.toLowerCase().includes("talk to someone") ||
        input.message.toLowerCase().includes("human");

      await db
        .update(chatConversations)
        .set({
          visitorEmail: leadInfo.email || undefined,
          serviceInterest: leadInfo.serviceInterest || undefined,
          projectBudget: leadInfo.projectBudget || undefined,
          projectTimeline: leadInfo.projectTimeline || undefined,
          leadScore,
          leadQualified: leadScore >= 50,
          routedToAdmin: shouldRoute,
          status: shouldRoute ? "routed" : "active",
          routingReason: shouldRoute ? "High lead score or requested human contact" : undefined,
        })
        .where(eq(chatConversations.id, input.conversationId));

      return {
        message: assistantMessage,
        leadScore,
        routed: shouldRoute,
      };
    }),

  // Get conversation history
  getHistory: publicProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      return await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(desc(chatMessages.createdAt));
    }),

  // Get conversation details
  getConversation: publicProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, input.conversationId))
        .limit(1);
      
      return result.length > 0 ? result[0] : null;
    }),

  // Close conversation
  closeConversation: publicProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(chatConversations)
        .set({ status: "closed" })
        .where(eq(chatConversations.id, input.conversationId));

      return { success: true };
    }),
});
