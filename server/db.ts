import { eq, desc, and, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  InsertUser, users, 
  blogPosts, InsertBlogPost, BlogPost,
  services, InsertService, Service,
  projects, InsertProject, Project,
  contacts, InsertContact, Contact,
  contactReplies, InsertContactReply, ContactReply,
  pageContent, InsertPageContent, PageContent,
  companySettings, InsertCompanySettings, CompanySettings,
  caseStudies, InsertCaseStudy, CaseStudy,
  subscriptions, InsertSubscription, Subscription,
  pageMetadata, InsertPageMetadata, PageMetadata,
  leadScores, InsertLeadScore, LeadScore,
  leadScoringRules, InsertLeadScoringRule, LeadScoringRule,
  leadRouting, InsertLeadRouting, LeadRouting,
  crmIntegrations, InsertCrmIntegration, CrmIntegration,
  crmSyncLogs, InsertCrmSyncLog, CrmSyncLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/bim_mepf";
      _pool = mysql.createPool(connectionString);
      _db = drizzle(_pool);
      console.log('[Database] MySQL database initialized');
    } catch (error) {
      console.error('[Database] Failed to initialize MySQL:', error);
      _db = null;
    }
  }
  return _db;
}

export async function executeRawQuery(query: string, params?: any[]) {
  if (!_pool) {
    throw new Error("Database pool not initialized");
  }
  const connection = await _pool.getConnection();
  try {
    const [result] = await connection.execute(query, params || []);
    return result;
  } finally {
    connection.release();
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== BLOG POSTS ====================

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogPosts).values(data);
  return result;
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllBlogPosts(published?: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = published !== undefined ? [eq(blogPosts.published, published)] : [];
  return db.select().from(blogPosts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt));
}

export async function getBlogPostsPaginated(page: number = 1, limit: number = 10, published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const offset = (page - 1) * limit;
  return db.select().from(blogPosts)
    .where(eq(blogPosts.published, published))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
}

// ==================== SERVICES ====================

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(services).values(data);
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(services).where(eq(services.id, id));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getServiceBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllServices(published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(services)
    .where(eq(services.published, published))
    .orderBy(asc(services.order));
}

// ==================== PROJECTS ====================

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(projects).values(data);
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllProjects(published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(projects)
    .where(eq(projects.published, published))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectsPaginated(page: number = 1, limit: number = 12, published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const offset = (page - 1) * limit;
  return db.select().from(projects)
    .where(eq(projects.published, published))
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);
}

// ==================== CONTACTS ====================

export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(contacts).values(data);
}

export async function updateContact(id: number, data: Partial<InsertContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(contacts).set(data).where(eq(contacts.id, id));
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllContacts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(contacts).orderBy(desc(contacts.createdAt));
}

export async function getContactsByStatus(status: "new" | "read" | "replied") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(contacts)
    .where(eq(contacts.status, status))
    .orderBy(desc(contacts.createdAt));
}

// ==================== CONTACT REPLIES ====================

export async function createContactReply(data: InsertContactReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(contactReplies).values(data);
}

export async function getContactReplies(contactId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(contactReplies)
    .where(eq(contactReplies.contactId, contactId))
    .orderBy(desc(contactReplies.createdAt));
}

export async function getContactRepliesByContactId(contactId: number) {
  return getContactReplies(contactId);
}

// ==================== PAGE CONTENT ====================

export async function upsertPageContent(pageKey: string, data: Partial<InsertPageContent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const fullData = { pageSlug: pageKey, ...data };
  return db.insert(pageContent).values(fullData as InsertPageContent).onDuplicateKeyUpdate({
    set: fullData,
  });
}

export async function getPageContent(pageSlug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(pageContent)
    .where(eq(pageContent.pageSlug, pageSlug))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== COMPANY SETTINGS ====================

export async function upsertCompanySettings(data: InsertCompanySettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(companySettings).values(data).onDuplicateKeyUpdate({
    set: data,
  });
}

export async function getCompanySettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(companySettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== CASE STUDIES ====================

export async function createCaseStudy(data: InsertCaseStudy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(caseStudies).values(data);
}

export async function updateCaseStudy(id: number, data: Partial<InsertCaseStudy>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(caseStudies).set(data).where(eq(caseStudies.id, id));
}

export async function deleteCaseStudy(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(caseStudies).where(eq(caseStudies.id, id));
}

export async function getCaseStudyById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(caseStudies).where(eq(caseStudies.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCaseStudyBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCaseStudiesByCategory(category: string, published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(caseStudies)
    .where(published ? eq(caseStudies.published, true) : undefined)
    .orderBy(desc(caseStudies.createdAt));
}

export async function getAllCaseStudies(published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(caseStudies)
    .where(eq(caseStudies.published, published))
    .orderBy(desc(caseStudies.createdAt));
}

// ==================== SUBSCRIPTIONS ====================

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(subscriptions).values(data);
}

export async function getSubscriptionByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getSubscriptionByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.email, token))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(subscriptions);
}

// ==================== PAGE METADATA ====================

export async function upsertPageMetadata(data: InsertPageMetadata) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(pageMetadata).values(data).onDuplicateKeyUpdate({
    set: data,
  });
}

export async function getPageMetadata(pageSlug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(pageMetadata)
    .where(eq(pageMetadata.pageSlug, pageSlug))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== LEAD SCORES ====================

export async function createLeadScore(data: InsertLeadScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(leadScores).values(data);
}

export async function getLeadScoreByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(leadScores)
    .where(eq(leadScores.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== LEAD SCORING RULES ====================

export async function getAllLeadScoringRules() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(leadScoringRules);
}

// ==================== LEAD ROUTING ====================

export async function createLeadRouting(data: InsertLeadRouting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(leadRouting).values(data);
}

export async function getLeadRoutingByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(leadRouting)
    .where(eq(leadRouting.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== CRM INTEGRATIONS ====================

export async function createCrmIntegration(data: InsertCrmIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(crmIntegrations).values(data);
}

export async function getCrmIntegrationByType(type: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(crmIntegrations)
    .where(eq(crmIntegrations.type, type))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== CRM SYNC LOGS ====================

export async function createCrmSyncLog(data: InsertCrmSyncLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(crmSyncLogs).values(data);
}

export async function getCrmSyncLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(crmSyncLogs)
    .orderBy(desc(crmSyncLogs.createdAt))
    .limit(limit);
}


// ==================== SUBSCRIPTIONS (Additional) ====================

export async function listSubscriptions(limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(subscriptions);
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}

export async function unsubscribeEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(subscriptions).where(eq(subscriptions.email, email));
}

export async function deleteSubscription(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(subscriptions).where(eq(subscriptions.id, id));
}
