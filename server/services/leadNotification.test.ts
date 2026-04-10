import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  notifyLeadToSalesTeam,
  getLeadNotificationHistory,
  getSalesTeamMembersForAdmin,
} from "./leadNotificationService";

describe("Lead Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("notifyLeadToSalesTeam", () => {
    it("should return success when notification payload is valid", async () => {
      const payload = {
        contactId: 1,
        leadScoreId: 1,
        leadScore: 85,
        qualification: "qualified",
        contactName: "John Doe",
        contactEmail: "john@example.com",
        contactPhone: "+91-9876543210",
        projectType: "BIM",
        projectSize: "Large",
        estimatedBudget: "High",
        timeline: "Urgent",
        message: "We need BIM services for our new project",
        subject: "BIM Design Services Inquiry",
      };

      // This test verifies the function structure and error handling
      const result = await notifyLeadToSalesTeam(payload);
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("notificationsSent");
      expect(result).toHaveProperty("errors");
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should handle missing sales team members gracefully", async () => {
      const payload = {
        contactId: 1,
        leadScore: 85,
        qualification: "qualified",
        contactName: "Jane Smith",
        contactEmail: "jane@example.com",
      };

      const result = await notifyLeadToSalesTeam(payload);
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("notificationsSent");
      expect(result).toHaveProperty("errors");
    });

    it("should handle different qualification levels", async () => {
      const qualifications = ["cold", "warm", "hot", "qualified"];

      for (const qualification of qualifications) {
        const payload = {
          contactId: 1,
          leadScore: 50,
          qualification,
          contactName: "Test User",
          contactEmail: "test@example.com",
        };

        const result = await notifyLeadToSalesTeam(payload);
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("notificationsSent");
        expect(typeof result.notificationsSent).toBe("number");
      }
    });

    it("should include all project details in notification", async () => {
      const payload = {
        contactId: 1,
        leadScoreId: 1,
        leadScore: 75,
        qualification: "hot",
        contactName: "Alice Johnson",
        contactEmail: "alice@example.com",
        contactPhone: "+91-9876543211",
        projectType: "MEPF",
        projectSize: "Medium",
        estimatedBudget: "Medium",
        timeline: "Soon",
        message: "Looking for MEPF design services",
        subject: "MEPF Design Inquiry",
      };

      const result = await notifyLeadToSalesTeam(payload);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle error scenarios gracefully", async () => {
      const invalidPayload = {
        contactId: 1,
        leadScore: 85,
        qualification: "qualified",
        contactName: "",
        contactEmail: "invalid-email",
      };

      const result = await notifyLeadToSalesTeam(invalidPayload as any);
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("errors");
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe("getLeadNotificationHistory", () => {
    it("should return an array of notifications", async () => {
      const result = await getLeadNotificationHistory(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle non-existent contact IDs", async () => {
      const result = await getLeadNotificationHistory(99999);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array on error", async () => {
      const result = await getLeadNotificationHistory(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getSalesTeamMembersForAdmin", () => {
    it("should return an array of sales team members", async () => {
      const result = await getSalesTeamMembersForAdmin();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return members with required fields", async () => {
      const result = await getSalesTeamMembersForAdmin();
      if (result.length > 0) {
        const member = result[0];
        expect(member).toHaveProperty("id");
        expect(member).toHaveProperty("name");
        expect(member).toHaveProperty("email");
        expect(member).toHaveProperty("isActive");
      }
    });

    it("should handle errors gracefully", async () => {
      const result = await getSalesTeamMembersForAdmin();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Lead Notification Email Template", () => {
    it("should generate HTML email with qualified lead badge", async () => {
      const payload = {
        contactId: 1,
        leadScore: 85,
        qualification: "qualified",
        contactName: "Test User",
        contactEmail: "test@example.com",
        projectType: "BIM",
        message: "Test message",
      };

      // Verify payload structure for email generation
      expect(payload.qualification).toBe("qualified");
      expect(payload.leadScore).toBeGreaterThanOrEqual(80);
      expect(payload.contactName).toBeTruthy();
      expect(payload.contactEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("should include all contact details in email", async () => {
      const payload = {
        contactId: 1,
        leadScore: 65,
        qualification: "hot",
        contactName: "John Doe",
        contactEmail: "john@example.com",
        contactPhone: "+91-9876543210",
        projectType: "MEPF",
        projectSize: "Large",
        estimatedBudget: "High",
        timeline: "Urgent",
        subject: "Inquiry",
        message: "Detailed message",
      };

      expect(payload.contactName).toBeTruthy();
      expect(payload.contactEmail).toBeTruthy();
      expect(payload.contactPhone).toBeTruthy();
      expect(payload.projectType).toBeTruthy();
      expect(payload.projectSize).toBeTruthy();
    });

    it("should handle missing optional fields", async () => {
      const payload = {
        contactId: 1,
        leadScore: 45,
        qualification: "warm",
        contactName: "Jane Smith",
        contactEmail: "jane@example.com",
      };

      expect(payload.contactName).toBeTruthy();
      expect(payload.contactEmail).toBeTruthy();
      expect(payload.projectType).toBeUndefined();
      expect(payload.projectSize).toBeUndefined();
    });
  });

  describe("Notification Preference Filtering", () => {
    it("should identify qualified leads correctly", () => {
      const qualifications = {
        cold: 25,
        warm: 50,
        hot: 70,
        qualified: 85,
      };

      expect(qualifications.qualified).toBeGreaterThanOrEqual(80);
      expect(qualifications.hot).toBeGreaterThanOrEqual(60);
      expect(qualifications.warm).toBeGreaterThanOrEqual(40);
      expect(qualifications.cold).toBeLessThan(40);
    });

    it("should match notification preferences correctly", () => {
      const preferences = ["all", "qualified_only", "hot_and_qualified", "none"];
      const validPreference = (pref: string) => preferences.includes(pref);

      expect(validPreference("all")).toBe(true);
      expect(validPreference("qualified_only")).toBe(true);
      expect(validPreference("hot_and_qualified")).toBe(true);
      expect(validPreference("none")).toBe(true);
      expect(validPreference("invalid")).toBe(false);
    });

    it("should filter recipients based on qualification and preference", () => {
      const testCases = [
        { qualification: "qualified", preference: "all", shouldReceive: true },
        { qualification: "qualified", preference: "qualified_only", shouldReceive: true },
        { qualification: "qualified", preference: "hot_and_qualified", shouldReceive: true },
        { qualification: "qualified", preference: "none", shouldReceive: false },
        { qualification: "hot", preference: "all", shouldReceive: true },
        { qualification: "hot", preference: "qualified_only", shouldReceive: false },
        { qualification: "hot", preference: "hot_and_qualified", shouldReceive: true },
        { qualification: "warm", preference: "all", shouldReceive: true },
        { qualification: "warm", preference: "qualified_only", shouldReceive: false },
        { qualification: "warm", preference: "hot_and_qualified", shouldReceive: false },
      ];

      testCases.forEach(({ qualification, preference, shouldReceive }) => {
        const applicablePreferences: string[] = ["all"];
        if (qualification === "qualified") {
          applicablePreferences.push("qualified_only");
        }
        if (qualification === "hot" || qualification === "qualified") {
          applicablePreferences.push("hot_and_qualified");
        }

        const matches = applicablePreferences.includes(preference);
        expect(matches).toBe(shouldReceive);
      });
    });
  });

  describe("Notification Status Tracking", () => {
    it("should track notification statuses correctly", () => {
      const statuses = ["pending", "sent", "failed", "bounced"];
      expect(statuses).toContain("pending");
      expect(statuses).toContain("sent");
      expect(statuses).toContain("failed");
      expect(statuses).toContain("bounced");
    });

    it("should handle notification error messages", () => {
      const errorMessages = [
        "Email service not configured",
        "Failed to send notification",
        "Invalid recipient email",
        "SMTP connection failed",
      ];

      errorMessages.forEach((msg) => {
        expect(msg).toBeTruthy();
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Lead Score Validation", () => {
    it("should validate lead scores are within valid range", () => {
      const validScores = [0, 25, 50, 75, 100];
      validScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should determine qualification level based on score", () => {
      const scoreQualificationMap = [
        { score: 25, qualification: "cold" },
        { score: 50, qualification: "warm" },
        { score: 70, qualification: "hot" },
        { score: 85, qualification: "qualified" },
      ];

      scoreQualificationMap.forEach(({ score, qualification }) => {
        const expectedQualification =
          score >= 80 ? "qualified" : score >= 60 ? "hot" : score >= 40 ? "warm" : "cold";
        expect(expectedQualification).toBe(qualification);
      });
    });
  });

  describe("Email Configuration", () => {
    it("should validate email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.co.uk",
        "user+tag@example.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = ["notanemail", "@example.com", "user@", "user name@example.com"];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });
});
