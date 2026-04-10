import nodemailer from "nodemailer";
import { getDb } from "../db";
import { leadNotifications, salesTeamMembers, contacts, leadScores } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * Lead Notification Service - Handles sending email notifications to sales team
 */

interface LeadNotificationPayload {
  contactId: number;
  leadScoreId?: number;
  leadScore: number;
  qualification: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  projectType?: string;
  projectSize?: string;
  estimatedBudget?: string;
  timeline?: string;
  message?: string;
  subject?: string;
}

/**
 * Create email transporter using Gmail configuration
 */
function createEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    console.warn("Gmail credentials not configured for lead notifications");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
}

/**
 * Get sales team members who should receive the notification
 */
async function getSalesTeamRecipients(
  qualification: string
): Promise<(typeof salesTeamMembers.$inferSelect)[]> {
  try {
    // Determine which notification preferences should receive this lead
    const applicablePreferences: ("all" | "qualified_only" | "hot_and_qualified" | "none")[] = ["all"];
    
    if (qualification === "qualified") {
      applicablePreferences.push("qualified_only");
    }
    
    if (qualification === "hot" || qualification === "qualified") {
      applicablePreferences.push("hot_and_qualified");
    }

    const database = await getDb();
    if (!database) return [];
    
    const recipients = await database
      .select()
      .from(salesTeamMembers)
      .where(
        and(
          eq(salesTeamMembers.isActive, true),
          inArray(salesTeamMembers.notificationPreference, applicablePreferences)
        )
      );

    return recipients;
  } catch (error) {
    console.error("Error fetching sales team members:", error);
    return [];
  }
}

/**
 * Generate HTML email template for lead notification
 */
function generateLeadNotificationEmail(
  payload: LeadNotificationPayload,
  recipientName: string
): string {
  const qualificationColor =
    payload.qualification === "qualified"
      ? "#22c55e"
      : payload.qualification === "hot"
        ? "#f97316"
        : payload.qualification === "warm"
          ? "#eab308"
          : "#6b7280";

  const qualificationLabel =
    payload.qualification.charAt(0).toUpperCase() +
    payload.qualification.slice(1);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ED1C24; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .lead-badge { display: inline-block; background-color: ${qualificationColor}; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
          .lead-score { font-size: 24px; font-weight: bold; color: ${qualificationColor}; }
          .info-row { margin: 12px 0; padding: 10px; background-color: white; border-left: 4px solid #ED1C24; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; margin-top: 4px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background-color: #ED1C24; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎯 New Lead Alert</h2>
            <p>A new qualified lead has arrived!</p>
          </div>
          
          <div class="content">
            <p>Hi ${recipientName},</p>
            
            <p>A new lead has been submitted and is ready for follow-up. Here are the details:</p>
            
            <div class="lead-badge">${qualificationLabel} Lead</div>
            <div style="text-align: center; margin: 15px 0;">
              <div>Lead Score</div>
              <div class="lead-score">${payload.leadScore}/100</div>
            </div>
            
            <h3 style="border-bottom: 2px solid #ED1C24; padding-bottom: 10px;">Contact Information</h3>
            
            <div class="info-row">
              <div class="info-label">Name</div>
              <div class="info-value">${payload.contactName}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Email</div>
              <div class="info-value"><a href="mailto:${payload.contactEmail}">${payload.contactEmail}</a></div>
            </div>
            
            ${
              payload.contactPhone
                ? `
              <div class="info-row">
                <div class="info-label">Phone</div>
                <div class="info-value"><a href="tel:${payload.contactPhone}">${payload.contactPhone}</a></div>
              </div>
            `
                : ""
            }
            
            <h3 style="border-bottom: 2px solid #ED1C24; padding-bottom: 10px; margin-top: 20px;">Project Details</h3>
            
            ${
              payload.projectType
                ? `
              <div class="info-row">
                <div class="info-label">Project Type</div>
                <div class="info-value">${payload.projectType}</div>
              </div>
            `
                : ""
            }
            
            ${
              payload.projectSize
                ? `
              <div class="info-row">
                <div class="info-label">Project Size</div>
                <div class="info-value">${payload.projectSize}</div>
              </div>
            `
                : ""
            }
            
            ${
              payload.estimatedBudget
                ? `
              <div class="info-row">
                <div class="info-label">Estimated Budget</div>
                <div class="info-value">${payload.estimatedBudget}</div>
              </div>
            `
                : ""
            }
            
            ${
              payload.timeline
                ? `
              <div class="info-row">
                <div class="info-label">Timeline</div>
                <div class="info-value">${payload.timeline}</div>
              </div>
            `
                : ""
            }
            
            ${
              payload.subject
                ? `
              <div class="info-row">
                <div class="info-label">Subject</div>
                <div class="info-value">${payload.subject}</div>
              </div>
            `
                : ""
            }
            
            ${
              payload.message
                ? `
              <h3 style="border-bottom: 2px solid #ED1C24; padding-bottom: 10px; margin-top: 20px;">Message</h3>
              <div class="info-row">
                <div class="info-value">${payload.message}</div>
              </div>
            `
                : ""
            }
            
            <p style="margin-top: 20px;">
              <strong>Next Steps:</strong> Please log in to the admin panel to view this lead and take appropriate action.
            </p>
          </div>
          
          <div class="footer">
            <p>IMI Design - BIM & MEPF Design Services</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} IMI Design. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send lead notification to a sales team member
 */
async function sendLeadNotificationEmail(
  recipient: typeof salesTeamMembers.$inferSelect,
  payload: LeadNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const htmlContent = generateLeadNotificationEmail(payload, recipient.name);

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@imidesign.in",
      to: recipient.email,
      subject: `🎯 New ${payload.qualification === "qualified" ? "Qualified" : payload.qualification.charAt(0).toUpperCase() + payload.qualification.slice(1)} Lead - ${payload.contactName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log the notification in database
    const database = await getDb();
    if (database) {
      await database.insert(leadNotifications).values({
        contactId: payload.contactId,
        leadScoreId: payload.leadScoreId,
        salesTeamMemberId: recipient.id,
        notificationType: "email",
        status: "sent",
        sentAt: new Date(),
        recipientEmail: recipient.email,
      });
    }

    console.log(`Lead notification sent to ${recipient.email}:`, info.messageId);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to send lead notification to ${recipient.email}:`, error);

    // Log failed notification in database
    try {
      const database = await getDb();
      if (database) {
        await database.insert(leadNotifications).values({
          contactId: payload.contactId,
          leadScoreId: payload.leadScoreId,
          salesTeamMemberId: recipient.id,
          notificationType: "email",
          status: "failed",
          errorMessage: errorMessage,
          recipientEmail: recipient.email,
        });
      }
    } catch (dbError) {
      console.error("Failed to log notification error:", dbError);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Main function to send notifications to all relevant sales team members
 */
export async function notifyLeadToSalesTeam(
  payload: LeadNotificationPayload
): Promise<{ success: boolean; notificationsSent: number; errors: string[] }> {
  try {
    // Get recipients based on qualification level
    const recipients = await getSalesTeamRecipients(payload.qualification);

    if (recipients.length === 0) {
      console.warn(
        `No sales team members configured to receive ${payload.qualification} lead notifications`
      );
      return {
        success: false,
        notificationsSent: 0,
        errors: ["No sales team members configured for this lead tier"],
      };
    }

    // Send notifications to all recipients
    const results = await Promise.all(
      recipients.map((recipient) =>
        sendLeadNotificationEmail(recipient, payload)
      )
    );

    const successCount = results.filter((r) => r.success).length;
    const errors = results
      .filter((r) => !r.success && r.error)
      .map((r) => r.error!);

    return {
      success: successCount > 0,
      notificationsSent: successCount,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notifyLeadToSalesTeam:", error);
    return {
      success: false,
      notificationsSent: 0,
      errors: [errorMessage],
    };
  }
}

/**
 * Get notification history for a lead
 */
export async function getLeadNotificationHistory(contactId: number) {
  try {
    const database = await getDb();
    if (!database) return [];
    const notifications = await database
      .select()
      .from(leadNotifications)
      .where(eq(leadNotifications.contactId, contactId));

    return notifications;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
}

/**
 * Get sales team members for admin management
 */
export async function getSalesTeamMembersForAdmin() {
  try {
    const database = await getDb();
    if (!database) return [];
    const members = await database.select().from(salesTeamMembers);
    return members;
  } catch (error) {
    console.error("Error fetching sales team members:", error);
    return [];
  }
}
