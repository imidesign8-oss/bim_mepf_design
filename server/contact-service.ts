/**
 * Contact Management Service
 * Handles contact form submissions and admin responses
 * All communications are managed through the admin panel
 */

/**
 * Format contact submission for display
 */
export function formatContactSubmission(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt?: Date;
}) {
  return {
    ...data,
    submittedAt: data.submittedAt || new Date(),
    displayName: `${data.name} (${data.email})`,
  };
}

/**
 * Validate contact form input
 */
export function validateContactForm(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!data.email || typeof data.email !== "string" || !isValidEmail(data.email)) {
    errors.push("Valid email is required");
  }

  if (!data.subject || typeof data.subject !== "string" || data.subject.trim().length === 0) {
    errors.push("Subject is required");
  }

  if (!data.message || typeof data.message !== "string" || data.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters");
  }

  if (data.phone && typeof data.phone !== "string") {
    errors.push("Phone must be a valid string");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format reply for display
 */
export function formatReply(data: {
  reply: string;
  adminName?: string;
  repliedAt?: Date;
}) {
  return {
    ...data,
    repliedAt: data.repliedAt || new Date(),
    adminName: data.adminName || "Admin",
  };
}

/**
 * Generate email template for admin notification (for reference/logging)
 */
export function generateAdminNotificationTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): string {
  return `
New Contact Form Submission
===========================

From: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ""}
Subject: ${data.subject}

Message:
${data.message}

---
Please respond through the admin panel at /admin
  `;
}

/**
 * Generate email template for visitor confirmation
 */
export function generateConfirmationTemplate(data: {
  name: string;
  subject: string;
}): string {
  return `
Dear ${data.name},

Thank you for reaching out to IMI DESIGN! We have successfully received your message regarding "${data.subject}".

Our team will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.

If you have any urgent matters, please don't hesitate to call us directly.

Best regards,
IMI DESIGN Team
BIM & MEPF Design Services
  `;
}
