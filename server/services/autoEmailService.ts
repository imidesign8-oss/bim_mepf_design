import { emailService } from './emailService';

interface AutoEmailConfig {
  clientEmail: string;
  clientName: string;
  subject: string;
  message: string;
  phone: string;
  servicesUrl: string;
  faqUrl: string;
  responseTime: string;
  companyName: string;
  adminEmail: string;
}

export class AutoEmailService {
  /**
   * Generate HTML template for client auto-reply
   */
  private generateClientTemplate(config: AutoEmailConfig, clientName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ED1C24; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #ED1C24; margin-bottom: 10px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .links { margin: 15px 0; }
          .links a { color: #ED1C24; text-decoration: none; margin-right: 20px; }
          .contact-info { background-color: #fff; padding: 15px; border-left: 4px solid #ED1C24; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.companyName}</h1>
            <p>Thank You for Contacting Us</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Dear ${clientName},</p>
              <p>Thank you for reaching out to us! We have received your inquiry and appreciate your interest in our BIM & MEPF Design Services.</p>
            </div>

            <div class="section">
              <h3>Your Message Details</h3>
              <p><strong>Subject:</strong> ${config.subject}</p>
              <p>We will review your message carefully and get back to you as soon as possible.</p>
            </div>

            <div class="section">
              <h3>Expected Response Time</h3>
              <p>Our team typically responds to all inquiries within <strong>${config.responseTime}</strong>. We appreciate your patience!</p>
            </div>

            <div class="section">
              <h3>In the Meantime</h3>
              <p>Feel free to explore our services and learn more about our expertise:</p>
              <div class="links">
                <a href="${config.servicesUrl}">View Our Services</a>
                <a href="${config.faqUrl}">FAQ</a>
              </div>
            </div>

            <div class="contact-info">
              <h3 style="margin-top: 0; color: #ED1C24;">Quick Contact</h3>
              <p><strong>Phone:</strong> <a href="tel:${config.phone.replace(/\s/g, '')}" style="color: #ED1C24; text-decoration: none;">${config.phone}</a></p>
              <p><strong>Email:</strong> <a href="mailto:${config.clientEmail}" style="color: #ED1C24; text-decoration: none;">${config.clientEmail}</a></p>
            </div>

            <div class="section">
              <p>Best regards,<br><strong>${config.companyName}</strong></p>
            </div>

            <div class="footer">
              <p>This is an automated response. Please do not reply to this email. Your inquiry has been recorded and will be addressed by our team shortly.</p>
              <p>&copy; ${new Date().getFullYear()} ${config.companyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for admin notification
   */
  private generateAdminTemplate(config: AutoEmailConfig, clientData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ED1C24; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #ED1C24; margin-bottom: 10px; }
          .info-box { background-color: #fff; padding: 15px; border: 1px solid #ED1C24; margin: 15px 0; border-radius: 5px; }
          .message-box { background-color: #fff; padding: 15px; border-left: 4px solid #ED1C24; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .action-link { display: inline-block; background-color: #ED1C24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>${new Date().toLocaleString()}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h3>Client Information</h3>
              <div class="info-box">
                <p><strong>Name:</strong> ${clientData.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${clientData.email}">${clientData.email}</a></p>
                ${clientData.phone ? `<p><strong>Phone:</strong> <a href="tel:${clientData.phone.replace(/\s/g, '')}">${clientData.phone}</a></p>` : ''}
              </div>
            </div>

            <div class="section">
              <h3>Inquiry Details</h3>
              <p><strong>Subject:</strong> ${clientData.subject}</p>
            </div>

            <div class="section">
              <h3>Message</h3>
              <div class="message-box">
                <p>${clientData.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>

            <div class="section">
              <p>An automated response has been sent to the client confirming receipt of their inquiry.</p>
              <p><strong>Expected Response Time:</strong> ${config.responseTime}</p>
            </div>

            <div class="footer">
              <p>This is an automated notification. Please log in to your admin panel to view and respond to this inquiry.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send auto-reply to client and notification to admin
   */
  async sendAutoReply(clientData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }, config: AutoEmailConfig): Promise<{ clientEmailSent: boolean; adminEmailSent: boolean }> {
    try {
      let clientEmailSent = false;
      let adminEmailSent = false;

      // Send auto-reply to client
      try {
        const clientTemplate = this.generateClientTemplate(config, clientData.name);
        clientEmailSent = await emailService.sendEmail({
          to: clientData.email,
          subject: `Re: ${clientData.subject} - We've Received Your Inquiry`,
          html: clientTemplate,
          replyTo: config.clientEmail,
        });
        console.log('✓ Auto-reply sent to client:', clientData.email);
      } catch (error) {
        console.error('✗ Failed to send client auto-reply:', error);
      }

      // Send notification to admin
      try {
        const adminTemplate = this.generateAdminTemplate(config, clientData);
        adminEmailSent = await emailService.sendNotification({
          type: 'contact_submission',
          subject: `New Contact Form Submission: ${clientData.subject}`,
          html: adminTemplate,
        });
        console.log('✓ Admin notification sent');
      } catch (error) {
        console.error('✗ Failed to send admin notification:', error);
      }

      return { clientEmailSent, adminEmailSent };
    } catch (error) {
      console.error('✗ Error in auto-reply process:', error);
      return { clientEmailSent: false, adminEmailSent: false };
    }
  }
}

// Export singleton instance
export const autoEmailService = new AutoEmailService();
