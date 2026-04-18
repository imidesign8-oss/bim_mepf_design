/**
 * Mock Database Service
 * Simulates database operations for testing without external dependencies
 * This is used when DATABASE_URL is not available or connection fails
 */

interface MockStore {
  quoteRequests: Map<number, any>;
  quotePricingRules: Map<number, any>;
  users: Map<string, any>;
  [key: string]: Map<number | string, any>;
}

const mockStore: MockStore = {
  quoteRequests: new Map(),
  quotePricingRules: new Map(),
  users: new Map(),
};

let idCounter = {
  quoteRequests: 0,
  quotePricingRules: 0,
};

// Initialize default pricing rules
export function initializeMockDb() {
  // Add default pricing rule
  const defaultRule = {
    id: ++idCounter.quotePricingRules,
    ruleName: 'Default BIM & MEP Pricing',
    description: 'Default pricing rule for BIM and MEP services',
    basePrice: 50000,
    pricePerSqft: 5.0,
    simpleMultiplier: 1.0,
    moderateMultiplier: 1.2,
    complexMultiplier: 1.5,
    standardTimelineMultiplier: 1.0,
    fastTrackMultiplier: 1.3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockStore.quotePricingRules.set(defaultRule.id, defaultRule);
  console.log('[MockDB] Initialized with default pricing rule');
}

// Quote Requests
export function createMockQuoteRequest(data: any) {
  const id = ++idCounter.quoteRequests;
  const quoteRequest = {
    id,
    quoteCode: `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockStore.quoteRequests.set(id, quoteRequest);
  console.log('[MockDB] Created quote request:', quoteRequest.quoteCode);
  return quoteRequest;
}

export function getMockQuoteRequest(id: number) {
  return mockStore.quoteRequests.get(id) || null;
}

export function getAllMockQuoteRequests() {
  return Array.from(mockStore.quoteRequests.values());
}

export function updateMockQuoteRequest(id: number, data: any) {
  const existing = mockStore.quoteRequests.get(id);
  if (!existing) return null;
  
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date(),
  };
  mockStore.quoteRequests.set(id, updated);
  return updated;
}

// Pricing Rules
export function getMockPricingRules() {
  return Array.from(mockStore.quotePricingRules.values()).filter(r => r.isActive);
}

export function getActiveMockPricingRule() {
  const rules = Array.from(mockStore.quotePricingRules.values()).filter(r => r.isActive);
  return rules.length > 0 ? rules[0] : null;
}

// Users
export function createMockUser(data: any) {
  const user = {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockStore.users.set(user.openId || user.email, user);
  return user;
}

export function getMockUserByOpenId(openId: string) {
  return mockStore.users.get(openId) || null;
}

// Utility functions
export function clearMockDb() {
  mockStore.quoteRequests.clear();
  mockStore.quotePricingRules.clear();
  mockStore.users.clear();
  idCounter = { quoteRequests: 0, quotePricingRules: 0 };
  console.log('[MockDB] Cleared all mock data');
}

export function getMockDbStats() {
  return {
    quoteRequests: mockStore.quoteRequests.size,
    quotePricingRules: mockStore.quotePricingRules.size,
    users: mockStore.users.size,
  };
}

// Initialize on load
initializeMockDb();
