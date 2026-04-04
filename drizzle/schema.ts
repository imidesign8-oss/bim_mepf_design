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
