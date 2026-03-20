import nodemailer from 'nodemailer';
import { getDb } from '../db';
import { emailSettings, emailLogs } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailNotificationOptions {
  type: 'contact_submission' | 'high_score_lead' | 'custom';
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private settings: any = null;

  async initializeTransporter() {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const settings = await db.select().from(emailSettings).limit(1);
      
      if (!settings || settings.length === 0) {
        throw new Error('Email settings not configured');
      }

      this.settings = settings[0];

      this.transporter = nodemailer.createTransport({
        host: this.settings.smtpHost,
        port: this.settings.smtpPort,
        secure: this.settings.enableSSL || this.settings.smtpPort === 465,
        auth: {
          user: this.settings.smtpUser,
          pass: this.settings.smtpPassword,
        },
        tls: {
          rejectUnauthorized: !this.settings.enableTLS,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✓ Email service initialized successfully');
    } catch (error) {
      console.error('✗ Failed to initialize email service:', error);
      throw error;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const info = await this.transporter!.sendMail({
        from: `${this.settings.fromName} <${this.settings.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.settings.replyTo,
      });

      // Log successful email
      const db = await getDb();
      if (db) {
        const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        
        await db.insert(emailLogs).values({
          recipientEmail: recipients,
          subject: options.subject,
          emailType: 'custom',
          status: 'sent',
          sentAt: new Date(),
        });
      }

      console.log('✓ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('✗ Failed to send email:', error);
      
      // Log failed email
      try {
        const db = await getDb();
        if (db) {
          const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
          
          await db.insert(emailLogs).values({
            recipientEmail: recipients,
            subject: options.subject,
            emailType: 'custom',
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      } catch (logError) {
        console.error('Failed to log email error:', logError);
      }

      return false;
    }
  }

  async sendNotification(options: EmailNotificationOptions): Promise<boolean> {
    try {
      if (!this.settings) {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const settings = await db.select().from(emailSettings).limit(1);
        if (!settings || settings.length === 0) {
          throw new Error('Email settings not configured');
        }
        this.settings = settings[0];
      }

      // Check if notifications are enabled for this type
      if (options.type === 'contact_submission' && !this.settings.notifyOnContactSubmission) {
        return false;
      }
      if (options.type === 'high_score_lead' && !this.settings.notifyOnHighScoreLead) {
        return false;
      }

      // Parse notification emails
      let notificationEmails: string[] = [];
      try {
        notificationEmails = JSON.parse(this.settings.notificationEmails);
      } catch {
        notificationEmails = [this.settings.fromEmail];
      }

      if (notificationEmails.length === 0) {
        notificationEmails = [this.settings.fromEmail];
      }

      // Send email to all notification recipients
      const result = await this.sendEmail({
        to: notificationEmails,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      // Log notification
      if (result) {
        const logDb = await getDb();
        if (logDb) {
          await logDb.insert(emailLogs).values({
            recipientEmail: notificationEmails.join(', '),
            subject: options.subject,
            emailType: options.type,
            status: 'sent',
            sentAt: new Date(),
          });
        }
      }

      return result;
    } catch (error) {
      console.error('✗ Failed to send notification:', error);
      return false;
    }
  }

  async getSettings() {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const settings = await db.select().from(emailSettings).limit(1);
      return settings[0] || null;
    } catch (error) {
      console.error('Failed to get email settings:', error);
      return null;
    }
  }

  async updateSettings(newSettings: any) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Check if settings exist
      const existing = await db.select().from(emailSettings).limit(1);
      
      if (existing && existing.length > 0) {
        // Update existing settings
        await db.update(emailSettings)
          .set({
            ...newSettings,
            updatedAt: new Date(),
          })
          .where(eq(emailSettings.id, existing[0].id));
      } else {
        // Create new settings
        await db.insert(emailSettings).values({
          ...newSettings,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Reset transporter to use new settings
      this.transporter = null;
      this.settings = null;

      return true;
    } catch (error) {
      console.error('Failed to update email settings:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      await this.transporter!.verify();
      return { success: true, message: 'SMTP connection successful!' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
