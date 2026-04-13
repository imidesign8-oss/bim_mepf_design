import nodemailer from "nodemailer";
import { getDb } from "../db";
import { emailTracking, quoteRequests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendQuoteApprovalEmailParams {
  clientEmail: string;
  clientName: string;
  projectName: string;
  quoteAmount: number;
  accessToken: string;
  expiresAt: Date;
  quoteCode: string;
}

export async function sendQuoteApprovalEmail(
  params: SendQuoteApprovalEmailParams
) {
  const {
    clientEmail,
    clientName,
    projectName,
    quoteAmount,
    accessToken,
    expiresAt,
    quoteCode,
  } = params;

  const portalUrl = `${process.env.VITE_FRONTEND_URL || "https://imidesign.in"}/portal?token=${accessToken}`;
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ED1C24 0%, #c41420 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .quote-details { background: #f5f5f5; padding: 20px; border-left: 4px solid #ED1C24; margin: 20px 0; border-radius: 4px; }
          .quote-details p { margin: 10px 0; }
          .quote-details strong { color: #ED1C24; }
          .cta-button { display: inline-block; background: #ED1C24; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .cta-button:hover { background: #c41420; }
          .token-section { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace; word-break: break-all; }
          .instructions { background: #e8f4f8; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .instructions h3 { color: #0066cc; margin-top: 0; }
          .instructions ol { margin: 10px 0; padding-left: 20px; }
          .instructions li { margin: 8px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 30px; }
          .expiry-warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Quote Approved</h1>
            <p>Your project quote is ready for review</p>
          </div>

          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>

            <p>Thank you for requesting a quote for your project. We're pleased to inform you that your quote has been approved and is now ready for your review.</p>

            <div class="quote-details">
              <p><strong>Project:</strong> ${projectName}</p>
              <p><strong>Quote Code:</strong> ${quoteCode}</p>
              <p><strong>Quote Amount:</strong> ₹${quoteAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Valid Until:</strong> ${expiryDate}</p>
            </div>

            <div class="instructions">
              <h3>📋 How to Access Your Quote</h3>
              <ol>
                <li>Click the button below to access your client portal</li>
                <li>Your portal will display the complete quote details and project timeline</li>
                <li>Review the deliverables, pricing breakdown, and project milestones</li>
                <li>Accept or request modifications to the quote</li>
                <li>Track project progress in real-time once approved</li>
              </ol>
            </div>

            <center>
              <a href="${portalUrl}" class="cta-button">Access Your Quote</a>
            </center>

            <div class="token-section">
              <strong>Portal Access Token:</strong><br>
              ${accessToken}
            </div>

            <div class="expiry-warning">
              <strong>⏰ Important:</strong> This access link expires on <strong>${expiryDate}</strong>. Please review your quote before the expiration date.
            </div>

            <p><strong>What's Included in Your Quote:</strong></p>
            <ul>
              <li>Detailed project scope and deliverables</li>
              <li>Itemized pricing breakdown</li>
              <li>Project timeline and milestones</li>
              <li>Terms and conditions</li>
              <li>Next steps for project initiation</li>
            </ul>

            <p>If you have any questions or need clarification on any aspect of the quote, please don't hesitate to reach out to us. We're here to help!</p>

            <p>Best regards,<br>
            <strong>IMI Design Team</strong><br>
            BIM & MEPF Design Services</p>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>For support, contact us at <a href="mailto:Projects@imidesign.in">Projects@imidesign.in</a></p>
              <p>&copy; 2026 IMI Design. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: clientEmail,
      subject: `Your Quote is Ready - ${projectName} (${quoteCode})`,
      html: htmlContent,
      replyTo: process.env.CONTACT_EMAIL_TO || "Projects@imidesign.in",
    });

    // Log email tracking
    const db = await getDb();
    if (db) {
      // Get the quote request ID from database
      const quotes = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.quoteCode, quoteCode));
      
      if (quotes.length > 0) {
        await db.insert(emailTracking).values({
          quoteRequestId: quotes[0].id,
          recipientEmail: clientEmail,
          subject: `Your Quote is Ready - ${projectName}`,
          status: "sent",
          sentAt: new Date(),
        });
      }
    }

    return {
      success: true,
      messageId: result.messageId,
      message: "Quote approval email sent successfully",
    };
  } catch (error: any) {
    console.error("Failed to send quote approval email:", error);

    // Log failed email
    const db = await getDb();
    if (db) {
      const quotes = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.quoteCode, quoteCode));
      
      if (quotes.length > 0) {
        await db.insert(emailTracking).values({
          quoteRequestId: quotes[0].id,
          recipientEmail: clientEmail,
          subject: `Your Quote is Ready - ${projectName}`,
          status: "failed",
          sentAt: new Date(),
        });
      }
    }

    return {
      success: false,
      error: error.message,
      message: "Failed to send quote approval email",
    };
  }
}

/**
 * Send quote expiration reminder email
 */
export async function sendQuoteExpirationReminder(
  clientEmail: string,
  clientName: string,
  projectName: string,
  quoteCode: string,
  expiresAt: Date,
  daysRemaining: number,
  accessToken: string
) {
  const portalUrl = `${process.env.VITE_FRONTEND_URL || "https://imidesign.in"}/portal?token=${accessToken}`;
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .cta-button { display: inline-block; background: #ED1C24; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Quote Expiration Reminder</h1>
          </div>

          <div class="content">
            <p>Dear <strong>${clientName}</strong>,</p>

            <div class="warning-box">
              <p><strong>⚠️ Your quote expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}!</strong></p>
              <p>Quote Code: <strong>${quoteCode}</strong></p>
              <p>Expiration Date: <strong>${expiryDate}</strong></p>
            </div>

            <p>This is a friendly reminder that your quote for <strong>${projectName}</strong> will expire soon. If you're interested in proceeding with this project, please review and accept the quote before it expires.</p>

            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Review the quote details and project timeline</li>
              <li>Accept the quote to move forward</li>
              <li>Request modifications if needed</li>
              <li>Contact us with any questions</li>
            </ul>

            <center>
              <a href="${portalUrl}" class="cta-button">Review Quote Now</a>
            </center>

            <p>If you need more time to review or have questions, please reach out to us. We can extend the quote validity or provide additional information as needed.</p>

            <p>Best regards,<br>
            <strong>IMI Design Team</strong></p>

            <div class="footer">
              <p>This is an automated reminder email.</p>
              <p>For support, contact us at <a href="mailto:Projects@imidesign.in">Projects@imidesign.in</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: clientEmail,
      subject: `Reminder: Your Quote Expires in ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} - ${quoteCode}`,
      html: htmlContent,
      replyTo: process.env.CONTACT_EMAIL_TO || "Projects@imidesign.in",
    });

    // Log email tracking
    const db = await getDb();
    if (db) {
      const quotes = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.quoteCode, quoteCode));
      
      if (quotes.length > 0) {
        await db.insert(emailTracking).values({
          quoteRequestId: quotes[0].id,
          recipientEmail: clientEmail,
          subject: `Reminder: Your Quote Expires in ${daysRemaining} Days`,
          status: "sent",
          sentAt: new Date(),
        });
      }
    }

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Failed to send expiration reminder:", error);
    return { success: false, error: error.message };
  }
}
