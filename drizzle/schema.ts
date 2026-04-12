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
  location: varchar("location", { length: 255 }), // City/State or custom location
  services: longtext("services"), // JSON array of services or custom text
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


/**
 * BIM LOD Pricing - Level of Development pricing for BIM services
 */
export const bimLodPricing = mysqlTable("bim_lod_pricing", {
  id: int("id").autoincrement().primaryKey(),
  cityId: int("cityId").notNull().references(() => mepCities.id),
  
  // LOD levels
  lodLevel: mysqlEnum("lodLevel", ["100", "200", "300", "400", "500"]).notNull(),
  
  // BIM service cost as percentage of project cost (4-10%)
  bimPercentageResidential: decimal("bimPercentageResidential", { precision: 5, scale: 2 }).notNull(),
  bimPercentageCommercial: decimal("bimPercentageCommercial", { precision: 5, scale: 2 }).notNull(),
  bimPercentageIndustrial: decimal("bimPercentageIndustrial", { precision: 5, scale: 2 }).notNull(),
  
  // Description of LOD level
  description: text("description"),
  
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cityLodIdx: index("bim_lod_city_idx").on(table.cityId, table.lodLevel),
  lodIdx: index("bim_lod_idx").on(table.lodLevel),
}));

export type BimLodPricing = typeof bimLodPricing.$inferSelect;
export type InsertBimLodPricing = typeof bimLodPricing.$inferInsert;

/**
 * MEP Discipline Weightage - Weightage for each discipline in MEP cost
 */
export const mepDisciplineWeightage = mysqlTable("mep_discipline_weightage", {
  id: int("id").autoincrement().primaryKey(),
  
  // Discipline types
  discipline: mysqlEnum("discipline", ["electrical", "plumbing", "hvac", "fire-system"]).notNull().unique(),
  
  // Weightage as percentage of total MEP cost (should sum to 100%)
  weightagePercentage: decimal("weightagePercentage", { precision: 5, scale: 2 }).notNull(),
  
  // Description
  description: text("description"),
  
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  disciplineIdx: index("mep_weightage_discipline_idx").on(table.discipline),
}));

export type MepDisciplineWeightage = typeof mepDisciplineWeightage.$inferSelect;
export type InsertMepDisciplineWeightage = typeof mepDisciplineWeightage.$inferInsert;

/**
 * MEP Cost Range - Base MEP cost percentage range (1-2%) by project type
 */
export const mepCostRange = mysqlTable("mep_cost_range", {
  id: int("id").autoincrement().primaryKey(),
  
  // Project type
  projectType: mysqlEnum("projectType", ["residential", "commercial", "industrial", "hospitality", "mixed-use"]).notNull().unique(),
  
  // MEP cost as percentage of construction cost (1-2%)
  minPercentage: decimal("minPercentage", { precision: 5, scale: 2 }).notNull(), // e.g., 1.00
  maxPercentage: decimal("maxPercentage", { precision: 5, scale: 2 }).notNull(), // e.g., 2.00
  
  // Default percentage to use
  defaultPercentage: decimal("defaultPercentage", { precision: 5, scale: 2 }).notNull(),
  
  // Description
  description: text("description"),
  
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectTypeIdx: index("mep_cost_range_type_idx").on(table.projectType),
}));

export type MepCostRange = typeof mepCostRange.$inferSelect;
export type InsertMepCostRange = typeof mepCostRange.$inferInsert;

/**
 * BIM Estimates - User generated BIM cost estimates
 */
export const bimEstimates = mysqlTable("bim_estimates", {
  id: int("id").autoincrement().primaryKey(),
  estimateCode: varchar("estimateCode", { length: 50 }).notNull().unique(),
  
  // Project details
  projectName: varchar("projectName", { length: 255 }),
  projectType: mysqlEnum("projectType", ["residential", "commercial", "industrial", "hospitality", "mixed-use"]).notNull(),
  buildingArea: decimal("buildingArea", { precision: 12, scale: 2 }).notNull(),
  areaUnit: mysqlEnum("areaUnit", ["sqft", "sqm"]).default("sqft").notNull(),
  
  // Location
  cityId: int("cityId").notNull().references(() => mepCities.id),
  
  // BIM specifications
  lodLevel: mysqlEnum("lodLevel", ["100", "200", "300", "400", "500"]).notNull(),
  buildingComplexity: mysqlEnum("buildingComplexity", ["simple", "moderate", "complex"]).default("moderate").notNull(),
  
  // Project cost
  projectCost: decimal("projectCost", { precision: 14, scale: 2 }).notNull(),
  
  // Calculated BIM cost
  baseBimCost: decimal("baseBimCost", { precision: 14, scale: 2 }).notNull(),
  adjustedBimCost: decimal("adjustedBimCost", { precision: 14, scale: 2 }).notNull(),
  
  // User info
  userEmail: varchar("userEmail", { length: 255 }),
  userName: varchar("userName", { length: 255 }),
  
  // Status
  emailSent: boolean("emailSent").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  estimateCodeIdx: index("bim_estimate_code_idx").on(table.estimateCode),
  cityIdIdx: index("bim_estimate_city_idx").on(table.cityId),
  userEmailIdx: index("bim_estimate_email_idx").on(table.userEmail),
  createdAtIdx: index("bim_estimate_created_idx").on(table.createdAt),
}));

export type BimEstimate = typeof bimEstimates.$inferSelect;
export type InsertBimEstimate = typeof bimEstimates.$inferInsert;


/**
 * Report Generation Analytics - Track all report generations for analytics
 */
export const reportGenerationAnalytics = mysqlTable("report_generation_analytics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Report details
  reportType: mysqlEnum("reportType", ["mep", "bim"]).notNull(),
  projectType: mysqlEnum("projectType", ["residential", "commercial", "industrial", "hospitality", "mixed-use"]).notNull(),
  
  // Location
  cityId: int("cityId").notNull().references(() => mepCities.id),
  stateId: int("stateId").notNull().references(() => mepStates.id),
  
  // BIM specific
  lodLevel: varchar("lodLevel", { length: 10 }),
  
  // Metrics
  buildingArea: decimal("buildingArea", { precision: 12, scale: 2 }),
  estimatedCost: decimal("estimatedCost", { precision: 14, scale: 2 }),
  
  // User info
  userEmail: varchar("userEmail", { length: 255 }),
  
  // Tracking
  emailShared: boolean("emailShared").default(false).notNull(),
  downloadedAsPdf: boolean("downloadedAsPdf").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  reportTypeIdx: index("analytics_report_type_idx").on(table.reportType),
  cityIdIdx: index("analytics_city_idx").on(table.cityId),
  stateIdIdx: index("analytics_state_idx").on(table.stateId),
  lodLevelIdx: index("analytics_lod_idx").on(table.lodLevel),
  createdAtIdx: index("analytics_created_idx").on(table.createdAt),
  userEmailIdx: index("analytics_email_idx").on(table.userEmail),
}));

export type ReportGenerationAnalytics = typeof reportGenerationAnalytics.$inferSelect;
export type InsertReportGenerationAnalytics = typeof reportGenerationAnalytics.$inferInsert;


// ==================== PAGE METADATA ====================
/**
 * Page metadata table for managing SEO meta tags and Open Graph tags
 * Allows admins to customize meta descriptions and OG images per page
 */
export const pageMetadata = mysqlTable("page_metadata", {
  id: int("id").autoincrement().primaryKey(),
  pageSlug: varchar("pageSlug", { length: 255 }).notNull().unique(), // e.g., "/services", "/about", "/blog/post-slug"
  metaTitle: varchar("metaTitle", { length: 255 }), // Custom meta title for SEO
  metaDescription: varchar("metaDescription", { length: 255 }), // Custom meta description (160 chars recommended)
  ogTitle: varchar("ogTitle", { length: 255 }), // Open Graph title
  ogDescription: varchar("ogDescription", { length: 255 }), // Open Graph description
  ogImage: text("ogImage"), // Open Graph image URL
  ogImageAlt: varchar("ogImageAlt", { length: 255 }), // Alt text for OG image
  twitterCard: varchar("twitterCard", { length: 50 }).default("summary_large_image"), // Twitter card type
  twitterImage: text("twitterImage"), // Twitter image URL
  canonicalUrl: text("canonicalUrl"), // Canonical URL
  keywords: text("keywords"), // SEO keywords (comma-separated)
  robots: varchar("robots", { length: 100 }).default("index, follow"), // Robots meta tag
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("page_metadata_slug_idx").on(table.pageSlug),
}));

export type PageMetadata = typeof pageMetadata.$inferSelect;
export type InsertPageMetadata = typeof pageMetadata.$inferInsert;


// ==================== LEAD SCORING & CRM ====================
/**
 * Lead Scoring Rules - defines scoring criteria and weights
 */
export const leadScoringRules = mysqlTable("lead_scoring_rules", {
  id: int("id").autoincrement().primaryKey(),
  criterion: varchar("criterion", { length: 100 }).notNull().unique(),
  weight: int("weight").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadScoringRule = typeof leadScoringRules.$inferSelect;
export type InsertLeadScoringRule = typeof leadScoringRules.$inferInsert;

/**
 * Lead Scores - stores calculated scores for each contact
 */
export const leadScores = mysqlTable("lead_scores", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  totalScore: int("totalScore").notNull(),
  qualification: mysqlEnum("qualification", ["cold", "warm", "hot", "qualified"]).notNull(),
  projectType: varchar("projectType", { length: 100 }),
  projectSize: varchar("projectSize", { length: 50 }),
  estimatedBudget: varchar("estimatedBudget", { length: 50 }),
  timeline: varchar("timeline", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contactIdIdx: index("lead_score_contact_idx").on(table.contactId),
  qualificationIdx: index("lead_score_qualification_idx").on(table.qualification),
}));

export type LeadScore = typeof leadScores.$inferSelect;
export type InsertLeadScore = typeof leadScores.$inferInsert;

/**
 * CRM Integrations - stores CRM credentials and settings
 */
export const crmIntegrations = mysqlTable("crm_integrations", {
  id: int("id").autoincrement().primaryKey(),
  crmType: mysqlEnum("crmType", ["hubspot", "pipedrive", "salesforce"]).notNull(),
  apiKey: text("apiKey").notNull(),
  accountId: varchar("accountId", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  syncEnabled: boolean("syncEnabled").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmIntegration = typeof crmIntegrations.$inferSelect;
export type InsertCrmIntegration = typeof crmIntegrations.$inferInsert;

/**
 * Lead Routing - tracks which sales team member is assigned to each lead
 */
export const leadRouting = mysqlTable("lead_routing", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  assignedToUserId: int("assignedToUserId"),
  routingReason: varchar("routingReason", { length: 255 }),
  crmContactId: varchar("crmContactId", { length: 255 }),
  crmDealId: varchar("crmDealId", { length: 255 }),
  syncStatus: mysqlEnum("syncStatus", ["pending", "synced", "failed"]).default("pending").notNull(),
  syncError: text("syncError"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contactIdIdx: index("lead_routing_contact_idx").on(table.contactId),
  assignedToIdx: index("lead_routing_assigned_idx").on(table.assignedToUserId),
  syncStatusIdx: index("lead_routing_sync_idx").on(table.syncStatus),
}));

export type LeadRouting = typeof leadRouting.$inferSelect;
export type InsertLeadRouting = typeof leadRouting.$inferInsert;

/**
 * CRM Sync Logs - tracks all CRM synchronization activities
 */
export const crmSyncLogs = mysqlTable("crm_sync_logs", {
  id: int("id").autoincrement().primaryKey(),
  crmIntegrationId: int("crmIntegrationId").notNull(),
  contactId: int("contactId"),
  action: mysqlEnum("action", ["create", "update", "delete", "sync"]).notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  errorMessage: text("errorMessage"),
  requestPayload: longtext("requestPayload"),
  responsePayload: longtext("responsePayload"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  crmIntegrationIdx: index("crm_sync_log_integration_idx").on(table.crmIntegrationId),
  contactIdIdx: index("crm_sync_log_contact_idx").on(table.contactId),
  statusIdx: index("crm_sync_log_status_idx").on(table.status),
}));

export type CrmSyncLog = typeof crmSyncLogs.$inferSelect;
export type InsertCrmSyncLog = typeof crmSyncLogs.$inferInsert;


/**
 * Sales Team Members - stores sales team contact information for lead notifications
 */
export const salesTeamMembers = mysqlTable("sales_team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 100 }), // e.g., "Senior Sales Executive", "Account Manager"
  specialization: varchar("specialization", { length: 255 }), // e.g., "BIM", "MEPF", "All"
  isActive: boolean("isActive").default(true).notNull(),
  notificationPreference: mysqlEnum("notificationPreference", ["all", "qualified_only", "hot_and_qualified", "none"]).default("all").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("sales_team_email_idx").on(table.email),
  isActiveIdx: index("sales_team_active_idx").on(table.isActive),
}));

export type SalesTeamMember = typeof salesTeamMembers.$inferSelect;
export type InsertSalesTeamMember = typeof salesTeamMembers.$inferInsert;

/**
 * Lead Notifications - tracks which notifications have been sent for each lead
 */
export const leadNotifications = mysqlTable("lead_notifications", {
  id: int("id").autoincrement().primaryKey(),
  contactId: int("contactId").notNull(),
  leadScoreId: int("leadScoreId"),
  salesTeamMemberId: int("salesTeamMemberId").notNull(),
  notificationType: mysqlEnum("notificationType", ["email", "slack", "sms"]).default("email").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contactIdIdx: index("lead_notification_contact_idx").on(table.contactId),
  statusIdx: index("lead_notification_status_idx").on(table.status),
  salesTeamIdx: index("lead_notification_sales_team_idx").on(table.salesTeamMemberId),
}));

export type LeadNotification = typeof leadNotifications.$inferSelect;
export type InsertLeadNotification = typeof leadNotifications.$inferInsert;


/**
 * SEO Audits table for tracking page SEO performance
 */
export const seoAudits = mysqlTable("seo_audits", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("pagePath", { length: 255 }).notNull(),
  score: int("score").notNull(), // 0-100
  issues: longtext("issues"), // JSON array of SEO issues
  recommendations: longtext("recommendations"), // JSON array of recommendations
  auditedAt: timestamp("auditedAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  pagePathIdx: index("seo_audit_page_idx").on(table.pagePath),
  auditedAtIdx: index("seo_audit_date_idx").on(table.auditedAt),
}));

export type SEOAudit = typeof seoAudits.$inferSelect;
export type InsertSEOAudit = typeof seoAudits.$inferInsert;


/**
 * Keywords table for tracking target keywords and their performance
 */
export const keywords = mysqlTable("keywords", {
  id: int("id").autoincrement().primaryKey(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // e.g., "BIM", "MEPF", "Design"
  searchVolume: int("searchVolume"), // Monthly search volume
  difficulty: int("difficulty"), // Keyword difficulty (0-100)
  relatedPages: longtext("relatedPages"), // JSON array of page IDs/slugs
  targetPosition: int("targetPosition"), // Target ranking position
  currentPosition: int("currentPosition"), // Current ranking position
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keywordIdx: index("keyword_idx").on(table.keyword),
  categoryIdx: index("keyword_category_idx").on(table.category),
}));

export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = typeof keywords.$inferInsert;

/**
 * Internal Links table for tracking internal linking strategy
 */
export const internalLinks = mysqlTable("internal_links", {
  id: int("id").autoincrement().primaryKey(),
  sourcePagePath: varchar("sourcePagePath", { length: 255 }).notNull(), // e.g., "/blog/post-slug"
  targetPagePath: varchar("targetPagePath", { length: 255 }).notNull(), // e.g., "/services/bim-design"
  anchorText: varchar("anchorText", { length: 255 }).notNull(),
  linkType: mysqlEnum("linkType", ["contextual", "related", "navigation", "footer"]).default("contextual").notNull(),
  keywordTarget: varchar("keywordTarget", { length: 255 }), // Target keyword for this link
  position: int("position"), // Position in the page (1st, 2nd, etc.)
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("internal_link_source_idx").on(table.sourcePagePath),
  targetIdx: index("internal_link_target_idx").on(table.targetPagePath),
  linkTypeIdx: index("internal_link_type_idx").on(table.linkType),
}));

export type InternalLink = typeof internalLinks.$inferSelect;
export type InsertInternalLink = typeof internalLinks.$inferInsert;

/**
 * Keyword Density Analysis table for tracking keyword usage on pages
 */
export const keywordDensity = mysqlTable("keyword_density", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("pagePath", { length: 255 }).notNull(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  density: decimal("density", { precision: 5, scale: 2 }), // Percentage (e.g., 2.5%)
  count: int("count"), // Number of times keyword appears
  wordCount: int("wordCount"), // Total words on page
  recommendations: text("recommendations"), // Optimization suggestions
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  pageKeywordIdx: index("keyword_density_page_keyword_idx").on(table.pagePath, table.keyword),
  pageIdx: index("keyword_density_page_idx").on(table.pagePath),
}));

export type KeywordDensity = typeof keywordDensity.$inferSelect;
export type InsertKeywordDensity = typeof keywordDensity.$inferInsert;


/**
 * Client Projects - Track projects for client portal
 */
export const clientProjects = mysqlTable("client_projects", {
  id: int("id").autoincrement().primaryKey(),
  projectCode: varchar("projectCode", { length: 50 }).notNull().unique(),
  
  // Project details
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectDescription: longtext("projectDescription"),
  clientId: int("clientId").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  
  // Project scope
  projectType: mysqlEnum("projectType", ["residential", "commercial", "industrial", "hospitality", "mixed-use"]).notNull(),
  buildingArea: decimal("buildingArea", { precision: 12, scale: 2 }),
  location: varchar("location", { length: 255 }),
  
  // Project timeline
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  currentPhase: mysqlEnum("currentPhase", ["concept", "dd", "cd", "construction", "as-built"]).default("concept").notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "on-hold", "cancelled"]).default("active").notNull(),
  
  // Portal access
  portalAccessToken: varchar("portalAccessToken", { length: 255 }).unique(),
  portalAccessEnabled: boolean("portalAccessEnabled").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectCodeIdx: index("project_code_idx").on(table.projectCode),
  clientIdIdx: index("project_client_idx").on(table.clientId),
  statusIdx: index("project_status_idx").on(table.status),
}));

export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = typeof clientProjects.$inferInsert;

/**
 * Project Milestones - Track project phases and milestones
 */
export const projectMilestones = mysqlTable("project_milestones", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => clientProjects.id, { onDelete: "cascade" }),
  
  // Milestone details
  milestoneName: varchar("milestoneName", { length: 255 }).notNull(),
  description: longtext("description"),
  phase: mysqlEnum("phase", ["concept", "dd", "cd", "construction", "as-built"]).notNull(),
  
  // Timeline
  plannedDate: timestamp("plannedDate"),
  completedDate: timestamp("completedDate"),
  status: mysqlEnum("status", ["pending", "in-progress", "completed", "delayed"]).default("pending").notNull(),
  
  // Progress
  completionPercentage: int("completionPercentage").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectIdIdx: index("milestone_project_idx").on(table.projectId),
  statusIdx: index("milestone_status_idx").on(table.status),
}));

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = typeof projectMilestones.$inferInsert;

/**
 * Project Deliverables - Track deliverable files and status
 */
export const projectDeliverables = mysqlTable("project_deliverables", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => clientProjects.id, { onDelete: "cascade" }),
  
  // Deliverable details
  deliverableName: varchar("deliverableName", { length: 255 }).notNull(),
  description: longtext("description"),
  deliverableType: mysqlEnum("deliverableType", ["bim-model", "drawing", "specification", "report", "schedule", "other"]).notNull(),
  
  // File details
  fileUrl: text("fileUrl"),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"), // in bytes
  fileType: varchar("fileType", { length: 50 }), // e.g., "application/pdf", "application/vnd.autodesk.revit"
  
  // Status
  status: mysqlEnum("status", ["pending", "in-progress", "ready", "delivered"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  deliveredDate: timestamp("deliveredDate"),
  
  // Visibility
  visibleToClient: boolean("visibleToClient").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectIdIdx: index("deliverable_project_idx").on(table.projectId),
  statusIdx: index("deliverable_status_idx").on(table.status),
  typeIdx: index("deliverable_type_idx").on(table.deliverableType),
}));

export type ProjectDeliverable = typeof projectDeliverables.$inferSelect;
export type InsertProjectDeliverable = typeof projectDeliverables.$inferInsert;

/**
 * Quote Requests - Track quote requests from questionnaire
 */
export const quoteRequests = mysqlTable("quote_requests", {
  id: int("id").autoincrement().primaryKey(),
  quoteCode: varchar("quoteCode", { length: 50 }).notNull().unique(),
  
  // Client details
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientCompany: varchar("clientCompany", { length: 255 }),
  
  // Project questionnaire responses (JSON)
  questionnaireResponses: longtext("questionnaireResponses").notNull(), // JSON object with all Q&A
  
  // Calculated quote
  quoteAmount: decimal("quoteAmount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  
  // Quote details
  quoteValidityDays: int("quoteValidityDays").default(30).notNull(),
  quoteValidUntil: timestamp("quoteValidUntil"),
  
  // PDF proposal
  proposalPdfUrl: text("proposalPdfUrl"),
  proposalFileName: varchar("proposalFileName", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["generated", "sent", "viewed", "accepted", "rejected", "expired"]).default("generated").notNull(),
  sentDate: timestamp("sentDate"),
  viewedDate: timestamp("viewedDate"),
  acceptedDate: timestamp("acceptedDate"),
  rejectedDate: timestamp("rejectedDate"),
  rejectionReason: longtext("rejectionReason"),
  
  // Tracking
  emailsSent: int("emailsSent").default(0).notNull(),
  lastEmailSentAt: timestamp("lastEmailSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  quoteCodeIdx: index("quote_code_idx").on(table.quoteCode),
  clientEmailIdx: index("quote_email_idx").on(table.clientEmail),
  statusIdx: index("quote_status_idx").on(table.status),
  createdAtIdx: index("quote_created_idx").on(table.createdAt),
}));

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;

/**
 * Quote Pricing Rules - Define pricing rules for quote generation
 */
export const quotePricingRules = mysqlTable("quote_pricing_rules", {
  id: int("id").autoincrement().primaryKey(),
  
  // Rule name
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  description: longtext("description"),
  
  // Pricing parameters
  basePrice: decimal("basePrice", { precision: 14, scale: 2 }).notNull(),
  pricePerSqft: decimal("pricePerSqft", { precision: 10, scale: 2 }),
  
  // Complexity multipliers
  simpleMultiplier: decimal("simpleMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  moderateMultiplier: decimal("moderateMultiplier", { precision: 5, scale: 2 }).default("1.20").notNull(),
  complexMultiplier: decimal("complexMultiplier", { precision: 5, scale: 2 }).default("1.50").notNull(),
  
  // Timeline multipliers
  standardTimelineMultiplier: decimal("standardTimelineMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  fastTrackMultiplier: decimal("fastTrackMultiplier", { precision: 5, scale: 2 }).default("1.30").notNull(),
  
  // Active status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuotePricingRule = typeof quotePricingRules.$inferSelect;
export type InsertQuotePricingRule = typeof quotePricingRules.$inferInsert;
