import { eq, desc, and, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  blogPosts, InsertBlogPost, BlogPost,
  services, InsertService, Service,
  projects, InsertProject, Project,
  contacts, InsertContact, Contact,
  contactReplies, InsertContactReply, ContactReply,
  pageContent, InsertPageContent, PageContent,
  companySettings, InsertCompanySettings, CompanySettings,
  caseStudies, InsertCaseStudy, CaseStudy
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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

export async function getContactRepliesByContactId(contactId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(contactReplies)
    .where(eq(contactReplies.contactId, contactId))
    .orderBy(desc(contactReplies.createdAt));
}

// ==================== PAGE CONTENT ====================

export async function upsertPageContent(pageKey: string, data: Omit<InsertPageContent, 'pageKey'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey)).limit(1);
  
  if (existing.length > 0) {
    return db.update(pageContent).set(data).where(eq(pageContent.pageKey, pageKey));
  } else {
    return db.insert(pageContent).values({ ...data, pageKey });
  }
}

export async function getPageContent(pageKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ==================== COMPANY SETTINGS ====================

export async function upsertCompanySettings(data: Partial<InsertCompanySettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(companySettings).limit(1);
  
  if (existing.length > 0) {
    return db.update(companySettings).set(data).where(eq(companySettings.id, existing[0].id));
  } else {
    return db.insert(companySettings).values(data as InsertCompanySettings);
  }
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

export async function getCaseStudiesByCategory(category: "BIM" | "MEPF" | "Quantities & Estimation", published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(caseStudies.serviceCategory, category)];
  if (published) {
    conditions.push(eq(caseStudies.published, true));
  }
  return db.select().from(caseStudies)
    .where(and(...conditions))
    .orderBy(desc(caseStudies.order), desc(caseStudies.createdAt));
}

export async function getAllCaseStudies(published: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (published) {
    return db.select().from(caseStudies)
      .where(eq(caseStudies.published, true))
      .orderBy(desc(caseStudies.order), desc(caseStudies.createdAt));
  }
  return db.select().from(caseStudies)
    .orderBy(desc(caseStudies.order), desc(caseStudies.createdAt));
}
