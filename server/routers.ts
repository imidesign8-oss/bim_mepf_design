import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { chatRouter } from "./routers/chat";
import { seoRouter } from "./routers/seo";
import { schemaValidatorRouter } from "./routers/schemaValidator";
import { emailMarketingRouter } from "./routers/emailMarketing";
import { campaignAnalyticsRouter } from "./routers/campaignAnalytics";
import { unsubscribeRouter } from "./routers/unsubscribe";
import { advancedEmailMarketing } from "./routers/advancedEmailMarketing";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createBlogPost, updateBlogPost, deleteBlogPost, getBlogPostById, getBlogPostBySlug,
  getAllBlogPosts, getBlogPostsPaginated,
  createService, updateService, deleteService, getServiceById, getServiceBySlug, getAllServices,
  createProject, updateProject, deleteProject, getProjectById, getProjectBySlug, getAllProjects, getProjectsPaginated,
  createContact, updateContact, getContactById, getAllContacts, getContactsByStatus,
  createContactReply, getContactRepliesByContactId,
  upsertPageContent, getPageContent,
  upsertCompanySettings, getCompanySettings,
  createCaseStudy, updateCaseStudy, deleteCaseStudy, getCaseStudyById, getCaseStudyBySlug, getCaseStudiesByCategory, getAllCaseStudies,
} from "./db";
import { validateContactForm } from "./contact-service";
import { autoEmailService } from "./services/autoEmailService";
import { emailService } from "./services/emailService";
import { checkRateLimit, getClientIp } from "./services/rateLimitService";
import { verifyCaptcha } from "./services/captchaService";
import { emailSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Utility function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Helper to ensure admin access
function ensureAdmin(ctx: any) {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

export const appRouter = router({
  system: systemRouter,
  emailMarketing: emailMarketingRouter,
  campaignAnalytics: campaignAnalyticsRouter,
  unsubscribe: unsubscribeRouter,
  advancedEmailMarketing: advancedEmailMarketing,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== BLOG ROUTES ====================
  blog: router({
    // Public: Get all published blog posts
    list: publicProcedure
      .input(z.object({ page: z.number().default(1), limit: z.number().default(10) }).optional())
      .query(async ({ input }) => {
        const page = input?.page || 1;
        const limit = input?.limit || 10;
        return getBlogPostsPaginated(page, limit, true);
      }),

    // Public: Get single blog post by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getBlogPostBySlug(input.slug);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        return post;
      }),

    // Admin: Get all blog posts (published and unpublished)
    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        ensureAdmin(ctx);
        return getAllBlogPosts();
      }),

    // Admin: Create blog post
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        featuredImage: z.string().optional(),
        author: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const slug = generateSlug(input.title);
        return createBlogPost({
          ...input,
          slug,
          published: false,
          canonicalUrl: `/blog/${slug}`,
        });
      }),

    // Admin: Update blog post
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        featuredImage: z.string().optional(),
        author: z.string().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const { id, ...data } = input;
        return updateBlogPost(id, data);
      }),

    // Admin: Delete blog post
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return deleteBlogPost(input.id);
      }),
  }),

  // ==================== SERVICES ROUTES ====================
  services: router({
    // Public: Get all published services
    list: publicProcedure.query(async () => {
      return getAllServices(true);
    }),

    // Public: Get single service by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const service = await getServiceBySlug(input.slug);
        if (!service) throw new TRPCError({ code: "NOT_FOUND" });
        return service;
      }),

    // Admin: Get all services
    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        ensureAdmin(ctx);
        return getAllServices();
      }),

    // Admin: Create service
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        shortDescription: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        category: z.enum(["BIM", "MEPF", "Quantities & Estimation"]),
        order: z.number().default(0),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const slug = generateSlug(input.title);
        return createService({
          ...input,
          slug,
          canonicalUrl: `/services/${slug}`,
        });
      }),

    // Admin: Update service
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        category: z.enum(["BIM", "MEPF", "Quantities & Estimation"]).optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const { id, ...data } = input;
        return updateService(id, data);
      }),

    // Admin: Delete service
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return deleteService(input.id);
      }),
  }),

  // ==================== CASE STUDIES ROUTES ====================
  caseStudies: router({
    // Public: Get case studies by category
    getByCategory: publicProcedure
      .input(z.object({ category: z.enum(["BIM", "MEPF", "Quantities & Estimation"]) }))
      .query(async ({ input }) => {
        return getCaseStudiesByCategory(input.category, true);
      }),

    // Public: Get single case study by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const caseStudy = await getCaseStudyBySlug(input.slug);
        if (!caseStudy) throw new TRPCError({ code: "NOT_FOUND" });
        return caseStudy;
      }),

    // Public: Get all case studies
    list: publicProcedure.query(async () => {
      return getAllCaseStudies(true);
    }),

    // Admin: Get all case studies
    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        ensureAdmin(ctx);
        return getAllCaseStudies();
      }),

    // Admin: Create case study
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        shortDescription: z.string().optional(),
        serviceCategory: z.enum(["BIM", "MEPF", "Quantities & Estimation"]),
        clientName: z.string().optional(),
        projectName: z.string().optional(),
        location: z.string().optional(),
        completionDate: z.string().optional(),
        budget: z.string().optional(),
        featuredImage: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        challenge: z.string().optional(),
        solution: z.string().optional(),
        results: z.string().optional(),
        relatedProjectId: z.number().optional(),
        order: z.number().default(0),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const slug = generateSlug(input.title);
        return createCaseStudy({
          ...input,
          slug,
          galleryImages: input.galleryImages ? JSON.stringify(input.galleryImages) : null,
          canonicalUrl: `/services/case-studies/${slug}`,
        });
      }),

    // Admin: Update case study
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        serviceCategory: z.enum(["BIM", "MEPF", "Quantities & Estimation"]).optional(),
        clientName: z.string().optional(),
        projectName: z.string().optional(),
        location: z.string().optional(),
        completionDate: z.string().optional(),
        budget: z.string().optional(),
        featuredImage: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        challenge: z.string().optional(),
        solution: z.string().optional(),
        results: z.string().optional(),
        relatedProjectId: z.number().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const { id, galleryImages, ...data } = input;
        const updateData = {
          ...data,
          galleryImages: galleryImages ? JSON.stringify(galleryImages) : undefined,
        };
        return updateCaseStudy(id, updateData);
      }),

    // Admin: Delete case study
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return deleteCaseStudy(input.id);
      }),
  }),

  // ==================== PROJECTS ROUTES ====================
  projects: router({
    // Public: Get all published projects
    list: publicProcedure
      .input(z.object({ page: z.number().default(1), limit: z.number().default(12) }).optional())
      .query(async ({ input }) => {
        const page = input?.page || 1;
        const limit = input?.limit || 12;
        return getProjectsPaginated(page, limit, true);
      }),

    // Public: Get single project by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const project = await getProjectBySlug(input.slug);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        return project;
      }),

    // Admin: Get all projects
    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        ensureAdmin(ctx);
        return getAllProjects();
      }),

    // Admin: Create project
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        shortDescription: z.string().optional(),
        featuredImage: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        client: z.string().optional(),
        completionDate: z.string().optional(),
        budget: z.string().optional(),
        status: z.enum(["completed", "ongoing", "planned"]).default("completed"),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const slug = generateSlug(input.title);
        return createProject({
          ...input,
          galleryImages: input.galleryImages ? JSON.stringify(input.galleryImages) : undefined,
          slug,
          canonicalUrl: `/projects/${slug}`,
        });
      }),

    // Admin: Update project
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        featuredImage: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        client: z.string().optional(),
        completionDate: z.string().optional(),
        budget: z.string().optional(),
        status: z.enum(["completed", "ongoing", "planned"]).optional(),
        published: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogImage: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const { id, ...data } = input;
        const processedData = {
          ...data,
          galleryImages: data.galleryImages ? JSON.stringify(data.galleryImages) : undefined,
        };
        return updateProject(id, processedData);
      }),

    // Admin: Delete project
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return deleteProject(input.id);
      }),
  }),

  // ==================== CONTACTS ROUTES ====================
  contacts: router({
    // Public: Submit contact form
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
        captchaToken: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check rate limiting
        const clientIp = getClientIp(ctx.req);
        const rateLimitResult = await checkRateLimit(clientIp, '/api/contact');
        
        if (!rateLimitResult.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limit exceeded. ${rateLimitResult.message}`,
          });
        }
        
        // Verify CAPTCHA if token provided
        if (input.captchaToken) {
          const captchaResult = await verifyCaptcha(input.captchaToken, clientIp);
          if (!captchaResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "CAPTCHA verification failed. Please try again.",
            });
          }
        }
        
        // Validate input
        const validation = validateContactForm(input);
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.errors.join(", "),
          });
        }
        
        // Save contact to database
        const contact = await createContact(input);
        
        // Send auto-reply and admin notification
        try {
          const autoEmailConfig = {
            clientEmail: input.email,
            clientName: input.name,
            subject: input.subject,
            message: input.message,
            phone: "+91 9405707777",
            servicesUrl: "https://imidesign.in/services",
            faqUrl: "https://imidesign.in/#faq",
            responseTime: "24 hours",
            companyName: "IMI DESIGN TEAM",
            adminEmail: "projects@imidesign.in",
          };
          
          await autoEmailService.sendAutoReply({
            name: input.name,
            email: input.email,
            phone: input.phone,
            subject: input.subject,
            message: input.message,
          }, autoEmailConfig);
        } catch (emailError) {
          console.error("Error sending auto-reply emails:", emailError);
        }
        
        return contact;
      }),

    // Admin: Get all contacts
    list: protectedProcedure
      .query(async ({ ctx }) => {
        ensureAdmin(ctx);
        return getAllContacts();
      }),

    // Admin: Get contact by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const contact = await getContactById(input.id);
        if (!contact) throw new TRPCError({ code: "NOT_FOUND" });
        const replies = await getContactRepliesByContactId(input.id);
        return { ...contact, replies };
      }),

    // Admin: Get contacts by status
    getByStatus: protectedProcedure
      .input(z.object({ status: z.enum(["new", "read", "replied"]) }))
      .query(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return getContactsByStatus(input.status);
      }),

    // Admin: Update contact status
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["new", "read", "replied"]) }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return updateContact(input.id, { status: input.status });
      }),

    // Admin: Reply to contact
    reply: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        reply: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const contact = await getContactById(input.contactId);
        if (!contact) throw new TRPCError({ code: "NOT_FOUND" });
        // Create reply
        await createContactReply({
          contactId: input.contactId,
          adminId: ctx.user!.id,
          reply: input.reply,
        });
        
        // Send reply email to client
        try {
          const { emailService } = await import("./services/emailService");
          await emailService.sendEmail({
            to: contact.email,
            subject: `Re: ${contact.subject} - IMI DESIGN`,
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><p>Dear ${contact.name},</p><p>Thank you for your inquiry. Here is our response:</p><div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ED1C24; margin: 20px 0;"><p style="white-space: pre-wrap;">${input.reply}</p></div><p>If you have any further questions, please don't hesitate to contact us:</p><p><strong>Phone:</strong> +91 9405707777<br><strong>Email:</strong> projects@imidesign.in</p><p>Best regards,<br>IMI DESIGN TEAM<br>BIM & MEPF Design Services</p></div>`,
          });
        } catch (emailError) {
          console.error("Error sending reply email:", emailError);
        }
        
        // Mark contact as replied
        return updateContact(input.contactId, { status: "replied" });
      }),
  }),

  // ==================== PAGE CONTENT ROUTES ====================
  pages: router({
    // Public: Get page content
    getContent: publicProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(async ({ input }) => {
        return getPageContent(input.pageKey);
      }),

    // Admin: Update page content
    updateContent: protectedProcedure
      .input(z.object({
        pageKey: z.string(),
        title: z.string().optional(),
        content: z.string(),
        image: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const { pageKey, ...data } = input;
        return upsertPageContent(pageKey, data);
      }),
  }),

  // ==================== COMPANY SETTINGS ROUTES ====================
  settings: router({
    // Public: Get company settings
    get: publicProcedure.query(async () => {
      return getCompanySettings();
    }),

    // Admin: Update company settings
    update: protectedProcedure
      .input(z.object({
        companyName: z.string().optional(),
        companyDescription: z.string().optional(),
        logo: z.string().optional(),
        favicon: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        socialLinks: z.string().optional(),
        siteTitle: z.string().optional(),
        siteDescription: z.string().optional(),
        siteKeywords: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return upsertCompanySettings(input);
      }),
  }),

  // ==================== SEO ROUTES ====================
  seo: seoRouter,

  // ==================== SITEMAP ====================
  sitemap: publicProcedure.query(async () => {
    const blogs = await getAllBlogPosts(true);
    const services = await getAllServices(true);
    const projects = await getAllProjects(true);
    
    return {
      blogs: blogs.map(b => ({ slug: b.slug, updatedAt: b.updatedAt })),
      services: services.map(s => ({ slug: s.slug, updatedAt: s.updatedAt })),
      projects: projects.map(p => ({ slug: p.slug, updatedAt: p.updatedAt })),
    };
  }),

  // ==================== CHAT ROUTES ====================
  chat: chatRouter,

  // ==================== SCHEMA VALIDATOR ROUTES ====================
  schemaValidator: router(schemaValidatorRouter),
  email: router({
    configureSettings: protectedProcedure
      .input(z.object({
        smtpHost: z.string(),
        smtpPort: z.number(),
        smtpUser: z.string(),
        smtpPassword: z.string(),
        fromEmail: z.string().email(),
        fromName: z.string(),
        replyTo: z.string().email(),
        enableSSL: z.boolean(),
        enableTLS: z.boolean(),
        notifyOnContactSubmission: z.boolean(),
        notifyOnHighScoreLead: z.boolean(),
        notificationEmails: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const success = await emailService.updateSettings(input);
        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to configure email settings',
          });
        }
        return { success: true, message: 'Email settings configured' };
      }),
    testConnection: protectedProcedure.mutation(async ({ ctx }) => {
      ensureAdmin(ctx);
      return emailService.testConnection();
    }),
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx);
      return emailService.getSettings();
    }),
    getAnalytics: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx);
      return emailService.getAnalytics();
    }),
    getLogs: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        return emailService.getLogs(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
