import nodemailer from "nodemailer";
import { getDb } from "../db";
import { emailTracking } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Email configuration from environment variables
const emailConfig = {
  host: process.env.GMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.GMAIL_PORT || "587"),
  secure: process.env.GMAIL_SECURE === "true",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Email template for proposal delivery
 */
function getProposalEmailTemplate(
  clientName: string,
  projectName: string,
  quoteAmount: string,
  quoteCode: string,
  trackingPixelUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .quote-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
          .amount { font-size: 28px; font-weight: bold; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your BIM & MEPF Design Proposal</h1>
            <p>Professional Design Services</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>
            
            <p>Thank you for choosing IMI Design for your project. We're excited to present our professional proposal for:</p>
            
            <div class="quote-box">
              <h3>${projectName}</h3>
              <p><strong>Quote Code:</strong> ${quoteCode}</p>
              <p><strong>Proposed Investment:</strong></p>
              <div class="amount">₹${quoteAmount}</div>
              <p style="color: #666; font-size: 12px;">This quote is valid for 30 days from the date of this email.</p>
            </div>
            
            <h3>What's Included:</h3>
            <ul>
              <li>Comprehensive BIM modeling and coordination</li>
              <li>MEP (Mechanical, Electrical, Plumbing) design and analysis</li>
              <li>Detailed drawings and specifications</li>
              <li>Project timeline and deliverables schedule</li>
              <li>Professional support throughout the project lifecycle</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review the attached detailed proposal</li>
              <li>Schedule a consultation with our team</li>
              <li>Confirm project scope and timeline</li>
              <li>Proceed with contract signing</li>
            </ol>
            
            <center>
              <a href="https://bimdesign-dqgmwfpz.manus.space/quote/${quoteCode}" class="button">View Full Proposal</a>
            </center>
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              <strong>Questions?</strong> Contact us at <a href="mailto:projects@imidesign.in">projects@imidesign.in</a> or call us for immediate assistance.
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 IMI Design. All rights reserved.</p>
            <p>Professional BIM & MEPF Design Services</p>
            <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;">
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send proposal email with PDF attachment and tracking
 */
export async function sendProposalEmail(
  quoteRequestId: number,
  recipientEmail: string,
  clientName: string,
  projectName: string,
  quoteAmount: string,
  quoteCode: string,
  pdfBuffer: Buffer,
  pdfFileName: string
): Promise<{ success: boolean; trackingId?: number; messageId?: string; error?: string }> {
  try {
    // Create email tracking record first
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const trackingResult = await db.insert(emailTracking).values({
      quoteRequestId,
      recipientEmail,
      subject: `Your BIM & MEPF Design Proposal - ${quoteCode}`,
      status: "pending",
    });

    const trackingId = trackingResult[0]?.insertId || 0;

    // Generate tracking pixel URL
    const trackingPixelUrl = `https://bimdesign-dqgmwfpz.manus.space/api/email-tracking/pixel/${trackingId}`;

    // Prepare email content
    const htmlContent = getProposalEmailTemplate(
      clientName,
      projectName,
      quoteAmount,
      quoteCode,
      trackingPixelUrl
    );

    // Send email with PDF attachment
    const mailOptions = {
      from: process.env.GMAIL_USER || "projects@imidesign.in",
      to: recipientEmail,
      subject: `Your BIM & MEPF Design Proposal - ${quoteCode}`,
      html: htmlContent,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      headers: {
        "X-Tracking-Id": trackingId.toString(),
        "X-Quote-Code": quoteCode,
      },
    };

    const info = await transporter.sendMail(mailOptions);

    // Update tracking record with sent status
    if (trackingId > 0) {
      const updateDb = await getDb();
      if (updateDb) {
        await updateDb
          .update(emailTracking)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(emailTracking.id, trackingId));
      }
    }

    console.log(`✓ Proposal email sent to ${recipientEmail}:`, info.messageId);

    return {
      success: true,
      trackingId,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("✗ Failed to send proposal email:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send notification email to admin
 */
export async function sendAdminNotificationEmail(
  subject: string,
  message: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminEmail = process.env.CONTACT_EMAIL_TO || "admin@imidesign.in";

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>${subject}</h2>
          <p>${message}</p>
          ${
            metadata
              ? `
            <h3>Details:</h3>
            <pre>${JSON.stringify(metadata, null, 2)}</pre>
          `
              : ""
          }
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from IMI Design Portal.
          </p>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER || "projects@imidesign.in",
      to: adminEmail,
      subject: `[Admin Notification] ${subject}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Admin notification sent:`, info.messageId);

    return { success: true };
  } catch (error: any) {
    console.error("✗ Failed to send admin notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("✓ Email service configured correctly");
    return true;
  } catch (error: any) {
    console.error("✗ Email configuration error:", error);
    return false;
  }
}

/**
 * Track email open
 */
export async function trackEmailOpen(trackingId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    
    const record = await db.select().from(emailTracking).where(eq(emailTracking.id, trackingId)).limit(1);
    if (!record || record.length === 0) return;

    const rec = record[0];
    await db
      .update(emailTracking)
      .set({
        openCount: (rec.openCount || 0) + 1,
        firstOpenedAt: rec.firstOpenedAt || new Date(),
        lastOpenedAt: new Date(),
      })
      .where(eq(emailTracking.id, trackingId));

    console.log(`✓ Email open tracked: ID ${trackingId}`);
  } catch (error: any) {
    console.error("Failed to track email open:", error);
  }
}

/**
 * Track PDF download
 */
export async function trackPdfDownload(trackingId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    
    const record = await db.select().from(emailTracking).where(eq(emailTracking.id, trackingId)).limit(1);
    if (!record || record.length === 0) return;

    const rec = record[0];
    await db
      .update(emailTracking)
      .set({
        downloadCount: (rec.downloadCount || 0) + 1,
        firstDownloadedAt: rec.firstDownloadedAt || new Date(),
        lastDownloadedAt: new Date(),
      })
      .where(eq(emailTracking.id, trackingId));

    console.log(`✓ PDF download tracked: ID ${trackingId}`);
  } catch (error: any) {
    console.error("Failed to track PDF download:", error);
  }
}

/**
 * Get email tracking statistics
 */
export async function getEmailTrackingStats(quoteRequestId: number): Promise<any> {
  try {
    const db = await getDb();
    if (!db) return null;
    
    const record = await db.select().from(emailTracking).where(eq(emailTracking.quoteRequestId, quoteRequestId)).limit(1);
    if (!record || record.length === 0) return null;
    
    const rec = record[0];

    return {
      id: rec.id,
      status: rec.status,
      sentAt: rec.sentAt,
      deliveredAt: rec.deliveredAt,
      openCount: rec.openCount,
      firstOpenedAt: rec.firstOpenedAt,
      lastOpenedAt: rec.lastOpenedAt,
      downloadCount: rec.downloadCount,
      firstDownloadedAt: rec.firstDownloadedAt,
      lastDownloadedAt: rec.lastDownloadedAt,
    };
  } catch (error: any) {
    console.error("Failed to get email tracking stats:", error);
    return null;
  }
}
