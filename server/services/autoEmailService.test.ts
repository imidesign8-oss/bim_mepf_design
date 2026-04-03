import { describe, it, expect, vi, beforeEach } from "vitest";
import { autoEmailService } from "./autoEmailService";
import { emailService } from "./emailService";

// Mock the emailService
vi.mock("./emailService", () => ({
  emailService: {
    sendEmail: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

describe("AutoEmailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send auto-reply to client", async () => {
    const mockSendEmail = vi.spyOn(emailService, "sendEmail").mockResolvedValue(true);
    const mockSendNotification = vi.spyOn(emailService, "sendNotification").mockResolvedValue(true);

    const clientData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9405707777",
      subject: "BIM Coordination Request",
      message: "I need help with my project",
    };

    const config = {
      clientEmail: "projects@imidesign.in",
      clientName: "John Doe",
      subject: "BIM Coordination Request",
      message: "I need help with my project",
      phone: "+91 9405707777",
      servicesUrl: "https://imidesign.in/services",
      faqUrl: "https://imidesign.in/#faq",
      responseTime: "24 hours",
      companyName: "IMI DESIGN TEAM",
      adminEmail: "projects@imidesign.in",
    };

    const result = await autoEmailService.sendAutoReply(clientData, config);

    expect(result.clientEmailSent).toBe(true);
    expect(result.adminEmailSent).toBe(true);
    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendNotification).toHaveBeenCalled();
  });

  it("should include client name in auto-reply template", async () => {
    vi.spyOn(emailService, "sendEmail").mockResolvedValue(true);
    vi.spyOn(emailService, "sendNotification").mockResolvedValue(true);

    const clientData = {
      name: "Jane Smith",
      email: "jane@example.com",
      subject: "MEP Design Services",
      message: "Interested in your MEP design services",
    };

    const config = {
      clientEmail: "projects@imidesign.in",
      clientName: "Jane Smith",
      subject: "MEP Design Services",
      message: "Interested in your MEP design services",
      phone: "+91 9405707777",
      servicesUrl: "https://imidesign.in/services",
      faqUrl: "https://imidesign.in/#faq",
      responseTime: "24 hours",
      companyName: "IMI DESIGN TEAM",
      adminEmail: "projects@imidesign.in",
    };

    await autoEmailService.sendAutoReply(clientData, config);

    const sendEmailCall = vi.mocked(emailService.sendEmail).mock.calls[0];
    expect(sendEmailCall[0].to).toBe("jane@example.com");
    expect(sendEmailCall[0].html).toContain("Jane Smith");
    expect(sendEmailCall[0].html).toContain("24 hours");
    expect(sendEmailCall[0].html).toContain("+91 9405707777");
  });

  it("should send admin notification with client details", async () => {
    vi.spyOn(emailService, "sendEmail").mockResolvedValue(true);
    vi.spyOn(emailService, "sendNotification").mockResolvedValue(true);

    const clientData = {
      name: "Test Client",
      email: "test@example.com",
      phone: "+91 1234567890",
      subject: "Test Subject",
      message: "Test message content",
    };

    const config = {
      clientEmail: "projects@imidesign.in",
      clientName: "Test Client",
      subject: "Test Subject",
      message: "Test message content",
      phone: "+91 9405707777",
      servicesUrl: "https://imidesign.in/services",
      faqUrl: "https://imidesign.in/#faq",
      responseTime: "24 hours",
      companyName: "IMI DESIGN TEAM",
      adminEmail: "projects@imidesign.in",
    };

    await autoEmailService.sendAutoReply(clientData, config);

    const notificationCall = vi.mocked(emailService.sendNotification).mock.calls[0];
    expect(notificationCall[0].type).toBe("contact_submission");
    expect(notificationCall[0].html).toContain("Test Client");
    expect(notificationCall[0].html).toContain("test@example.com");
    expect(notificationCall[0].html).toContain("Test Subject");
  });

  it("should handle email sending errors gracefully", async () => {
    vi.spyOn(emailService, "sendEmail").mockRejectedValue(new Error("SMTP Error"));
    vi.spyOn(emailService, "sendNotification").mockRejectedValue(new Error("Notification Error"));

    const clientData = {
      name: "Error Test",
      email: "error@example.com",
      subject: "Error Test",
      message: "This should handle errors",
    };

    const config = {
      clientEmail: "projects@imidesign.in",
      clientName: "Error Test",
      subject: "Error Test",
      message: "This should handle errors",
      phone: "+91 9405707777",
      servicesUrl: "https://imidesign.in/services",
      faqUrl: "https://imidesign.in/#faq",
      responseTime: "24 hours",
      companyName: "IMI DESIGN TEAM",
      adminEmail: "projects@imidesign.in",
    };

    const result = await autoEmailService.sendAutoReply(clientData, config);

    // Should return false for failed emails but not throw
    expect(result.clientEmailSent).toBe(false);
    expect(result.adminEmailSent).toBe(false);
  });
});
