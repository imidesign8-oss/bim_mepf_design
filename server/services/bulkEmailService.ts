import { getDb } from '../db';
import { emailCampaigns, campaignRecipients, emailRecipients, emailLogs } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import nodemailer from 'nodemailer';
import { emailService } from './emailService';

/**
 * Bulk Email Service
 * Handles sending marketing campaigns to multiple recipients using BCC
 */

export interface BulkEmailOptions {
  campaignId: number;
  subject: string;
  content: string;
  recipients: Array<{ id: number; email: string }>;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  batchSize?: number; // Number of emails to send in each batch
}

export interface CampaignStats {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
}

/**
 * Send bulk email campaign with BCC
 * BCC ensures recipients don't see each other's email addresses
 */
export async function sendBulkEmailCampaign(options: BulkEmailOptions): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  message: string;
}> {
  const {
    campaignId,
    subject,
    content,
    recipients,
    fromEmail,
    fromName,
    replyTo,
    batchSize = 50, // Send 50 emails per batch
  } = options;

  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    let sentCount = 0;
    let failedCount = 0;

    // Get transporter from email service
    const transporter = await getEmailTransporter();
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const bccEmails = batch.map(r => r.email);

      try {
        // Send email with all recipients in BCC
        await transporter.sendMail({
          from: `${fromName} <${fromEmail}>`,
          to: fromEmail, // Primary recipient (will see the email)
          bcc: bccEmails, // All recipients in BCC (won't see each other)
          subject,
          html: content,
          replyTo: replyTo || fromEmail,
        });

        // Update campaign recipients status to 'sent'
        for (const recipient of batch) {
          await db
            .update(campaignRecipients)
            .set({
              status: 'sent',
              sentAt: new Date(),
            })
            .where(
              and(
                eq(campaignRecipients.campaignId, campaignId),
                eq(campaignRecipients.recipientId, recipient.id)
              )
            );

          // Update recipient's last email sent timestamp
          await db
            .update(emailRecipients)
            .set({
              lastEmailSentAt: new Date(),
              totalEmailsReceived: (await db.select().from(emailRecipients).where(eq(emailRecipients.id, recipient.id)))[0]?.totalEmailsReceived + 1 || 1,
            })
            .where(eq(emailRecipients.id, recipient.id));

          sentCount++;
        }

        // Log successful batch
        await db.insert(emailLogs).values({
          recipientEmail: bccEmails.join(', '),
          subject,
          emailType: 'marketing_campaign',
          status: 'sent',
          sentAt: new Date(),
        });
      } catch (batchError) {
        console.error(`Failed to send batch starting at index ${i}:`, batchError);

        // Mark batch as failed
        for (const recipient of batch) {
          await db
            .update(campaignRecipients)
            .set({
              status: 'failed',
              errorMessage: batchError instanceof Error ? batchError.message : 'Unknown error',
            })
            .where(
              and(
                eq(campaignRecipients.campaignId, campaignId),
                eq(campaignRecipients.recipientId, recipient.id)
              )
            );

          failedCount++;
        }

        // Log failed batch
        await db.insert(emailLogs).values({
          recipientEmail: bccEmails.join(', '),
          subject,
          emailType: 'marketing_campaign',
          status: 'failed',
          errorMessage: batchError instanceof Error ? batchError.message : 'Unknown error',
        });
      }
    }

    // Update campaign status
    await db
      .update(emailCampaigns)
      .set({
        status: 'completed',
        sentCount,
        failedCount,
        completedAt: new Date(),
      })
      .where(eq(emailCampaigns.id, campaignId));

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
      message: `Campaign sent: ${sentCount} successful, ${failedCount} failed`,
    };
  } catch (error) {
    console.error('Bulk email campaign error:', error);
    return {
      success: false,
      sentCount: 0,
      failedCount: recipients.length,
      message: error instanceof Error ? error.message : 'Failed to send campaign',
    };
  }
}

/**
 * Get email transporter from email service
 */
async function getEmailTransporter(): Promise<nodemailer.Transporter | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const settings = await db.select().from(emailCampaigns).limit(1);
    if (!settings || settings.length === 0) {
      // Try to get settings from email settings table
      const { emailSettings } = await import('../../drizzle/schema');
      const emailSettingsData = await db.select().from(emailSettings).limit(1);
      
      if (!emailSettingsData || emailSettingsData.length === 0) {
        return null;
      }

      const config = emailSettingsData[0];
      return nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.enableSSL || config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword,
        },
        tls: {
          rejectUnauthorized: !config.enableTLS,
        },
      });
    }

    return null;
  } catch (error) {
    console.error('Failed to get email transporter:', error);
    return null;
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: number): Promise<CampaignStats> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        totalRecipients: 0,
        sentCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0,
      };
    }

    const recipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));

    const sentCount = recipients.filter(r => r.status === 'sent').length;
    const failedCount = recipients.filter(r => r.status === 'failed').length;
    const pendingCount = recipients.filter(r => r.status === 'pending').length;
    const totalRecipients = recipients.length;
    const successRate = totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0;

    return {
      totalRecipients,
      sentCount,
      failedCount,
      pendingCount,
      successRate,
    };
  } catch (error) {
    console.error('Failed to get campaign stats:', error);
    return {
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
      pendingCount: 0,
      successRate: 0,
    };
  }
}

/**
 * Parse CSV file and extract email recipients
 */
export function parseEmailCSV(csvContent: string): Array<{
  email: string;
  name?: string;
  recipientType: 'architect' | 'builder' | 'other';
  company?: string;
  city?: string;
  state?: string;
}> {
  const lines = csvContent.trim().split('\n');
  const recipients = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(col => col.trim());
    
    // Expected CSV format: email, name, recipientType, company, city, state
    if (columns.length >= 1) {
      const email = columns[0];
      if (isValidEmail(email)) {
        recipients.push({
          email,
          name: columns[1] || undefined,
          recipientType: (columns[2] as any) || 'other',
          company: columns[3] || undefined,
          city: columns[4] || undefined,
          state: columns[5] || undefined,
        });
      }
    }
  }

  return recipients;
}

/**
 * Validate email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
