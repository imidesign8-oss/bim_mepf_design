import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, longtext, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Blog posts table with SEO metadata
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: longtext("content").notNull(),
  featuredImage: text("featuredImage"),
  author: varchar("author", { length: 255 }),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  views: int("views").default(0).notNull(),
  
  // SEO fields
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 255 }),
  metaKeywords: text("metaKeywords"),
  canonicalUrl: text("canonicalUrl"),
  ogImage: text("ogImage"),
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: varchar("ogDescription", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  publishedIdx: index("published_idx").on(table.published),
}));

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Services table with SEO metadata
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: longtext("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  icon: text("icon"),
  image: text("image"),
  category: mysqlEnum("category", ["BIM", "MEPF", "Quantities & Estimation"]).notNull(),
  order: int("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  
  // SEO fields
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 255 }),
  metaKeywords: text("metaKeywords"),
  canonicalUrl: text("canonicalUrl"),
  ogImage: text("ogImage"),
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: varchar("ogDescription", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("service_slug_idx").on(table.slug),
  publishedIdx: index("service_published_idx").on(table.published),
}));

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Projects table with SEO metadata and gallery support
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: longtext("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  featuredImage: text("featuredImage"),
  galleryImages: longtext("galleryImages"), // JSON array of image URLs
  client: varchar("client", { length: 255 }),
  completionDate: varchar("completionDate", { length: 50 }),
  budget: varchar("budget", { length: 100 }),
  status: mysqlEnum("status", ["completed", "ongoing", "planned"]).default("completed").notNull(),
  published: boolean("published").default(true).notNull(),
  
  // SEO fields
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 255 }),
  metaKeywords: text("metaKeywords"),
  canonicalUrl: text("canonicalUrl"),
  ogImage: text("ogImage"),
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: varchar("ogDescription", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("project_slug_idx").on(table.slug),
  publishedIdx: index("project_published_idx").on(table.published),
}));

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Contact submissions table
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: longtext("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied"]).default("new").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("contact_status_idx").on(table.status),
  emailIdx: index("contact_email_idx").on(table.email),
}));

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Contact replies table - admin responses to contact submissions
 */
export const contactReplies = mysqlTable("contact_replies", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  adminId: int("adminId").notNull(),
  reply: longtext("reply").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactReply = typeof contactReplies.$inferSelect;
export type InsertContactReply = typeof contactReplies.$inferInsert;

/**
 * Page content table for static pages (About, Home sections, etc.)
 */
export const pageContent = mysqlTable("page_content", {
  id: int("id").autoincrement().primaryKey(),
  pageKey: varchar("pageKey", { length: 100 }).notNull().unique(), // e.g., "about", "home-hero"
  title: varchar("title", { length: 255 }),
  content: longtext("content").notNull(),
  image: text("image"),
  
  // SEO fields
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 255 }),
  metaKeywords: text("metaKeywords"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageContent = typeof pageContent.$inferSelect;
export type InsertPageContent = typeof pageContent.$inferInsert;

/**
 * Company settings table for global configuration
 */
export const companySettings = mysqlTable("company_settings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyDescription: text("companyDescription"),
  logo: text("logo"),
  favicon: text("favicon"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  socialLinks: longtext("socialLinks"), // JSON object
  
  // Global SEO
  siteTitle: varchar("siteTitle", { length: 255 }),
  siteDescription: varchar("siteDescription", { length: 255 }),
  siteKeywords: text("siteKeywords"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = typeof companySettings.$inferInsert;

/**
 * Chat conversations table for AI assistant
 */
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 255 }).notNull(),
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  visitorName: varchar("visitorName", { length: 255 }),
  visitorPhone: varchar("visitorPhone", { length: 20 }),
  
  // Lead qualification fields
  leadQualified: boolean("leadQualified").default(false).notNull(),
  leadScore: int("leadScore").default(0).notNull(),
  serviceInterest: varchar("serviceInterest", { length: 255 }),
  projectBudget: varchar("projectBudget", { length: 100 }),
  projectTimeline: varchar("projectTimeline", { length: 100 }),
  
  // Routing
  routedToAdmin: boolean("routedToAdmin").default(false).notNull(),
  assignedAdminId: int("assignedAdminId"),
  routingReason: text("routingReason"),
  
  // Status
  status: mysqlEnum("status", ["active", "closed", "routed"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  visitorIdIdx: index("chat_visitor_idx").on(table.visitorId),
  statusIdx: index("chat_status_idx").on(table.status),
  emailIdx: index("chat_email_idx").on(table.visitorEmail),
}));

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Chat messages table
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: longtext("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("chat_message_conversation_idx").on(table.conversationId),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * SEO Settings table for managing meta tags and code-level SEO
 */
export const seoSettings = mysqlTable("seo_settings", {
  id: int("id").autoincrement().primaryKey(),
  pageType: mysqlEnum("pageType", ["home", "about", "services", "projects", "blog", "contact", "global"]).notNull(),
  pageSlug: varchar("pageSlug", { length: 255 }), // For specific pages like blog posts
  
  // Meta tags
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 255 }),
  metaKeywords: text("metaKeywords"),
  
  // Open Graph
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: varchar("ogDescription", { length: 255 }),
  ogImage: text("ogImage"),
  ogType: varchar("ogType", { length: 50 }),
  
  // Twitter Card
  twitterTitle: varchar("twitterTitle", { length: 255 }),
  twitterDescription: varchar("twitterDescription", { length: 255 }),
  twitterImage: text("twitterImage"),
  
  // Structured Data (JSON-LD)
  structuredData: longtext("structuredData"), // JSON-LD schema
  
  // Custom Code
  customHeadCode: longtext("customHeadCode"), // Custom code to inject in <head>
  customBodyCode: longtext("customBodyCode"), // Custom code to inject in <body>
  
  // Robots and Crawling
  robotsIndex: boolean("robotsIndex").default(true).notNull(),
  robotsFollow: boolean("robotsFollow").default(true).notNull(),
  canonicalUrl: text("canonicalUrl"),
  
  // Status
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  pageTypeIdx: index("seo_page_type_idx").on(table.pageType),
  pageSlugIdx: index("seo_page_slug_idx").on(table.pageSlug),
}));

export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = typeof seoSettings.$inferInsert;


/**
 * Email Settings table for SMTP configuration
 */
export const emailSettings = mysqlTable("email_settings", {
  id: int("id").autoincrement().primaryKey(),
  smtpHost: varchar("smtpHost", { length: 255 }).notNull(),
  smtpPort: int("smtpPort").notNull(),
  smtpUser: varchar("smtpUser", { length: 255 }).notNull(),
  smtpPassword: text("smtpPassword").notNull(),
  fromEmail: varchar("fromEmail", { length: 320 }).notNull(),
  fromName: varchar("fromName", { length: 255 }).notNull(),
  replyTo: varchar("replyTo", { length: 320 }),
  enableTLS: boolean("enableTLS").default(true).notNull(),
  enableSSL: boolean("enableSSL").default(false).notNull(),
  notifyOnContactSubmission: boolean("notifyOnContactSubmission").default(true).notNull(),
  notifyOnHighScoreLead: boolean("notifyOnHighScoreLead").default(true).notNull(),
  highScoreThreshold: int("highScoreThreshold").default(80).notNull(),
  notificationEmails: longtext("notificationEmails").notNull(), // JSON array of emails
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSettings = typeof emailSettings.$inferSelect;
export type InsertEmailSettings = typeof emailSettings.$inferInsert;

/**
 * Email Logs table for tracking sent emails
 */
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  emailType: varchar("emailType", { length: 50 }).notNull(), // 'contact_submission', 'high_score_lead', 'custom'
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("email_log_status_idx").on(table.status),
  emailTypeIdx: index("email_log_type_idx").on(table.emailType),
  recipientIdx: index("email_log_recipient_idx").on(table.recipientEmail),
}));

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;


/**
 * Email Bounces - Track bounced and suppressed email addresses
 */
export const emailBounces = mysqlTable("email_bounces", {
  id: varchar("id", { length: 100 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  bounceType: mysqlEnum("bounceType", ["permanent", "temporary", "complaint"]).notNull(),
  reason: text("reason"),
  bounceCount: int("bounceCount").default(1).notNull(),
  lastBounceAt: timestamp("lastBounceAt").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_bounce_email_idx").on(table.email),
  bounceTypeIdx: index("email_bounce_type_idx").on(table.bounceType),
  lastBounceIdx: index("email_bounce_last_bounce_idx").on(table.lastBounceAt),
}));

export type EmailBounce = typeof emailBounces.$inferSelect;
export type InsertEmailBounce = typeof emailBounces.$inferInsert;


/**
 * Rate Limiting table - Track contact form submissions by IP
 */
export const rateLimits = mysqlTable("rate_limits", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(), // IPv4 or IPv6
  endpoint: varchar("endpoint", { length: 255 }).notNull(), // e.g., '/api/contact'
  submissionCount: int("submissionCount").default(1).notNull(),
  firstSubmissionAt: timestamp("firstSubmissionAt").defaultNow().notNull(),
  lastSubmissionAt: timestamp("lastSubmissionAt").defaultNow().onUpdateNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ipEndpointIdx: index("rate_limit_ip_endpoint_idx").on(table.ipAddress, table.endpoint),
  lastSubmissionIdx: index("rate_limit_last_submission_idx").on(table.lastSubmissionAt),
}));

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;

/**
 * Email Marketing Campaigns table
 */
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: longtext("content").notNull(),
  templateType: mysqlEnum("templateType", ["architect", "builder", "custom"]).default("custom").notNull(),
  
  // Campaign status
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "completed", "paused"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  // Statistics
  totalRecipients: int("totalRecipients").default(0).notNull(),
  sentCount: int("sentCount").default(0).notNull(),
  failedCount: int("failedCount").default(0).notNull(),
  openCount: int("openCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  
  // Settings
  sendAsTest: boolean("sendAsTest").default(false).notNull(),
  testEmails: longtext("testEmails"), // JSON array of test emails
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("campaign_status_idx").on(table.status),
  createdAtIdx: index("campaign_created_idx").on(table.createdAt),
}));

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

/**
 * Email Recipients list - Architects and Builders
 */
export const emailRecipients = mysqlTable("email_recipients", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  recipientType: mysqlEnum("recipientType", ["architect", "builder", "other"]).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  
  // Subscription status
  subscribed: boolean("subscribed").default(true).notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  unsubscribeReason: text("unsubscribeReason"),
  
  // Tracking
  lastEmailSentAt: timestamp("lastEmailSentAt"),
  totalEmailsReceived: int("totalEmailsReceived").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("recipient_email_idx").on(table.email),
  typeIdx: index("recipient_type_idx").on(table.recipientType),
  subscribedIdx: index("recipient_subscribed_idx").on(table.subscribed),
}));

export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type InsertEmailRecipient = typeof emailRecipients.$inferInsert;

/**
 * Campaign Recipients tracking - Which recipients received which campaigns
 */
export const campaignRecipients = mysqlTable("campaign_recipients", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  recipientId: int("recipientId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  
  // Delivery status
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  
  // Tracking
  opened: boolean("opened").default(false).notNull(),
  openedAt: timestamp("openedAt"),
  clicked: boolean("clicked").default(false).notNull(),
  clickedAt: timestamp("clickedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  campaignIdx: index("campaign_recipient_campaign_idx").on(table.campaignId),
  recipientIdx: index("campaign_recipient_recipient_idx").on(table.recipientId),
  statusIdx: index("campaign_recipient_status_idx").on(table.status),
}));

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;

/**
 * Case Studies table for service detail pages
 */
export const caseStudies = mysqlTable("case_studies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: longtext("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  
  // Service category this case study belongs to
  serviceCategory: mysqlEnum("serviceCategory", ["BIM", "MEPF", "Quantities & Estimation"]).notNull(),
  
  // Project details
  clientName: varchar("clientName", { length: 255 }),
  projectName: varchar("projectName", { length: 255 }),
  location: varchar("location", { length: 255 }),
  completionDate: varchar("completionDate", { length: 50 }),
  budget: varchar("budget", { length: 100 }),
  
  // Media
  featuredImage: text("featuredImage"),
  galleryImages: longtext("galleryImages"), // JSON array of image URLs
  
  // Challenge, Solution, Results
  challenge: longtext("challenge"),
  solution: longtext("solution"),
  results: longtext("results"),
  
  // Related project ID (optional)
  relatedProjectId: int("relatedProjectId"),
  
  // Publishing
  published: boolean("published").default(true).notNull(),
  order: int("order").default(0).notNull(),
  
  // SEO fields
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 255 }),
  metaKeywords: text("metaKeywords"),
  canonicalUrl: text("canonicalUrl"),
  ogImage: text("ogImage"),
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: varchar("ogDescription", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("case_study_slug_idx").on(table.slug),
  categoryIdx: index("case_study_category_idx").on(table.serviceCategory),
  publishedIdx: index("case_study_published_idx").on(table.published),
}));

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = typeof caseStudies.$inferInsert;


/**
 * Email subscriptions table for newsletter/updates
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 255 }).unique(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("subscription_email_idx").on(table.email),
  activeIdx: index("subscription_active_idx").on(table.isActive),
  tokenIdx: index("subscription_token_idx").on(table.unsubscribeToken),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * MEP Cost Estimation - States and Cities
 */
export const mepStates = mysqlTable("mep_states", {
  id: int("id").autoincrement().primaryKey(),
  stateName: varchar("stateName", { length: 100 }).notNull().unique(),
  stateCode: varchar("stateCode", { length: 10 }).notNull().unique(),
  region: mysqlEnum("region", ["North", "South", "East", "West", "Northeast", "Central"]).notNull(),
  baseMultiplier: decimal("baseMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stateNameIdx: index("mep_state_name_idx").on(table.stateName),
  regionIdx: index("mep_region_idx").on(table.region),
}));

export type MepState = typeof mepStates.$inferSelect;
export type InsertMepState = typeof mepStates.$inferInsert;

/**
 * MEP Cost Estimation - Cities
 */
export const mepCities = mysqlTable("mep_cities", {
  id: int("id").autoincrement().primaryKey(),
  stateId: int("stateId").notNull().references(() => mepStates.id),
  cityName: varchar("cityName", { length: 100 }).notNull(),
  tier: mysqlEnum("tier", ["Tier-1", "Tier-2", "Tier-3"]).notNull(),
  
  // Base construction costs per sq ft
  baseCostResidential: decimal("baseCostResidential", { precision: 10, scale: 2 }).notNull(),
  baseCostCommercial: decimal("baseCostCommercial", { precision: 10, scale: 2 }).notNull(),
  baseCostIndustrial: decimal("baseCostIndustrial", { precision: 10, scale: 2 }).notNull(),
  
  // MEP percentage of total construction cost
  mepPercentageResidential: decimal("mepPercentageResidential", { precision: 5, scale: 2 }).default("12.00").notNull(),
  mepPercentageCommercial: decimal("mepPercentageCommercial", { precision: 5, scale: 2 }).default("15.00").notNull(),
  mepPercentageIndustrial: decimal("mepPercentageIndustrial", { precision: 5, scale: 2 }).default("13.00").notNull(),
  
  // Regional multiplier
  regionalMultiplier: decimal("regionalMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  
  // Climate adjustment
  climateZone: mysqlEnum("climateZone", ["hot-humid", "hot-dry", "moderate", "cold"]).notNull(),
  climateAdjustment: decimal("climateAdjustment", { precision: 5, scale: 2 }).default("0.00").notNull(),
  
  // Labor cost multiplier
  laborCostMultiplier: decimal("laborCostMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stateIdIdx: index("mep_city_state_idx").on(table.stateId),
  cityNameIdx: index("mep_city_name_idx").on(table.cityName),
  tierIdx: index("mep_city_tier_idx").on(table.tier),
}));

export type MepCity = typeof mepCities.$inferSelect;
export type InsertMepCity = typeof mepCities.$inferInsert;

/**
 * MEP Component Costs
 */
export const mepComponentCosts = mysqlTable("mep_component_costs", {
  id: int("id").autoincrement().primaryKey(),
  componentType: mysqlEnum("componentType", ["mechanical", "electrical", "plumbing", "fire-safety", "smart-systems"]).notNull(),
  subComponent: varchar("subComponent", { length: 100 }).notNull(),
  description: text("description"),
  
  // Cost data
  costPerUnit: decimal("costPerUnit", { precision: 12, scale: 2 }).notNull(),
  unitType: mysqlEnum("unitType", ["per-sqft", "per-unit", "per-room", "per-fixture", "lump-sum"]).notNull(),
  
  // LOD levels
  lodLevel: mysqlEnum("lodLevel", ["100", "200", "300", "350", "400", "500"]).notNull(),
  
  // Project types this applies to
  applicableProjectTypes: varchar("applicableProjectTypes", { length: 255 }).notNull(), // JSON array
  
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  componentTypeIdx: index("mep_component_type_idx").on(table.componentType),
  lodLevelIdx: index("mep_component_lod_idx").on(table.lodLevel),
}));

export type MepComponentCost = typeof mepComponentCosts.$inferSelect;
export type InsertMepComponentCost = typeof mepComponentCosts.$inferInsert;

/**
 * MEP Discipline Costs - Individual discipline pricing by city
 */
export const mepDisciplineCosts = mysqlTable("mep_discipline_costs", {
  id: int("id").autoincrement().primaryKey(),
  cityId: int("cityId").notNull().references(() => mepCities.id),
  
  // Discipline types
  discipline: mysqlEnum("discipline", ["electrical", "plumbing", "hvac", "fire-system"]).notNull(),
  
  // Cost per sq ft for each discipline
  costResidential: decimal("costResidential", { precision: 10, scale: 2 }).notNull(),
  costCommercial: decimal("costCommercial", { precision: 10, scale: 2 }).notNull(),
  costIndustrial: decimal("costIndustrial", { precision: 10, scale: 2 }).notNull(),
  
  // Percentage of total MEP cost
  percentageOfMep: decimal("percentageOfMep", { precision: 5, scale: 2 }).notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cityDisciplineIdx: index("mep_discipline_city_idx").on(table.cityId, table.discipline),
  disciplineIdx: index("mep_discipline_idx").on(table.discipline),
}));

export type MepDisciplineCost = typeof mepDisciplineCosts.$inferSelect;
export type InsertMepDisciplineCost = typeof mepDisciplineCosts.$inferInsert;

/**
 * MEP Cost Estimates - User generated estimates
 */
export const mepEstimates = mysqlTable("mep_estimates", {
  id: int("id").autoincrement().primaryKey(),
  estimateCode: varchar("estimateCode", { length: 50 }).notNull().unique(),
  
  // Project details
  projectName: varchar("projectName", { length: 255 }),
  projectType: mysqlEnum("projectType", ["residential", "commercial", "industrial", "hospitality", "mixed-use"]).notNull(),
  projectSubType: varchar("projectSubType", { length: 100 }),
  buildingArea: decimal("buildingArea", { precision: 12, scale: 2 }).notNull(),
  
  // Location
  cityId: int("cityId").notNull().references(() => mepCities.id),
  
  // Project specifications
  buildingComplexity: mysqlEnum("buildingComplexity", ["simple", "moderate", "complex"]).default("moderate").notNull(),
  greenCertification: mysqlEnum("greenCertification", ["none", "LEED", "IGBC"]).default("none").notNull(),
  materialQuality: mysqlEnum("materialQuality", ["standard", "premium", "imported"]).default("standard").notNull(),
  projectTimeline: mysqlEnum("projectTimeline", ["standard", "fast-track", "delayed"]).default("standard").notNull(),
  
  // LOD level
  lodLevel: mysqlEnum("lodLevel", ["100", "200", "300", "350", "400", "500"]).default("300").notNull(),
  
  // Calculated costs
  baseMepCost: decimal("baseMepCost", { precision: 14, scale: 2 }).notNull(),
  adjustedMepCost: decimal("adjustedMepCost", { precision: 14, scale: 2 }).notNull(),
  costPerSqft: decimal("costPerSqft", { precision: 10, scale: 2 }).notNull(),
  accuracyRange: varchar("accuracyRange", { length: 50 }).notNull(), // e.g., "±15%"
  
  // Cost breakdown
  mechanicalCost: decimal("mechanicalCost", { precision: 14, scale: 2 }),
  electricalCost: decimal("electricalCost", { precision: 14, scale: 2 }),
  plumbingCost: decimal("plumbingCost", { precision: 14, scale: 2 }),
  fireSafetyCost: decimal("fireSafetyCost", { precision: 14, scale: 2 }),
  smartSystemsCost: decimal("smartSystemsCost", { precision: 14, scale: 2 }),
  
  // Applied adjustments (JSON)
  appliedAdjustments: longtext("appliedAdjustments"), // JSON object with multipliers
  
  // User info
  userId: int("userId"),
  userEmail: varchar("userEmail", { length: 320 }),
  
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  estimateCodeIdx: index("mep_estimate_code_idx").on(table.estimateCode),
  cityIdIdx: index("mep_estimate_city_idx").on(table.cityId),
  userIdIdx: index("mep_estimate_user_idx").on(table.userId),
  createdAtIdx: index("mep_estimate_created_idx").on(table.createdAt),
}));

export type MepEstimate = typeof mepEstimates.$inferSelect;
export type InsertMepEstimate = typeof mepEstimates.$inferInsert;

/**
 * MEP Estimate History - Track all user estimates for comparison and history
 */
export const mepEstimateHistory = mysqlTable("mep_estimate_history", {
  id: int("id").autoincrement().primaryKey(),
  estimateId: int("estimateId").notNull().references(() => mepEstimates.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Estimate details
  projectName: varchar("projectName", { length: 255 }),
  projectNotes: longtext("projectNotes"),
  
  // Selected disciplines
  selectedDisciplines: varchar("selectedDisciplines", { length: 500 }), // JSON array: ["electrical", "plumbing", "hvac"]
  
  // Cost breakdown by discipline
  disciplineCosts: longtext("disciplineCosts"), // JSON: { "electrical": 50000, "plumbing": 30000, ... }
  totalCost: decimal("totalCost", { precision: 14, scale: 2 }).notNull(),
  
  // Metadata
  isCompared: boolean("isCompared").default(false).notNull(),
  comparedWithEstimateIds: varchar("comparedWithEstimateIds", { length: 500 }), // JSON array of IDs
  
  // Email tracking
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  emailRecipient: varchar("emailRecipient", { length: 320 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("mep_history_user_idx").on(table.userId),
  estimateIdIdx: index("mep_history_estimate_idx").on(table.estimateId),
  createdAtIdx: index("mep_history_created_idx").on(table.createdAt),
  emailSentIdx: index("mep_history_email_idx").on(table.emailSent),
}));

export type MepEstimateHistory = typeof mepEstimateHistory.$inferSelect;
export type InsertMepEstimateHistory = typeof mepEstimateHistory.$inferInsert;
