# New Features Documentation

## 1. Contact Form Rate Limiting & CAPTCHA

### Overview
Implemented robust spam prevention for the contact form with:
- **Rate Limiting**: Maximum 5 submissions per IP address per hour
- **CAPTCHA Verification**: hCaptcha integration for bot prevention

### Files
- `server/services/rateLimitService.ts` - Rate limiting logic with in-memory storage
- `server/services/captchaService.ts` - hCaptcha verification service
- `client/src/components/ContactForm.tsx` - Updated contact form with CAPTCHA
- `server/routers.ts` - Updated contact submission endpoint

### How It Works

#### Rate Limiting
1. Client submits contact form
2. Server extracts client IP from request headers
3. Checks if IP has exceeded 5 submissions in the last hour
4. Returns `TOO_MANY_REQUESTS` error if limit exceeded
5. Otherwise, allows submission and increments counter

#### CAPTCHA
1. Contact form displays hCaptcha widget
2. User completes CAPTCHA challenge
3. Token is sent with form submission
4. Server verifies token with hCaptcha API
5. Submission proceeds only if verification succeeds

### Configuration
Set these environment variables for CAPTCHA:
```
HCAPTCHA_SITE_KEY=your_site_key_here
HCAPTCHA_SECRET_KEY=your_secret_key_here
```

### Usage
```typescript
// Contact form automatically includes CAPTCHA
// Rate limiting is transparent to users
// Error messages inform users of rate limit status
```

---

## 2. Contact Submission Dashboard

### Overview
Real-time admin dashboard for managing contact submissions with:
- **Statistics**: Total, new, read, and replied submissions
- **Filtering**: By date range, status, and search
- **Status Management**: Mark submissions as new, read, or replied
- **Real-time Updates**: See all contact details and replies

### Files
- `client/src/components/admin/ContactDashboard.tsx` - Dashboard component
- `server/routers.ts` - Contact management endpoints

### Features
1. **Statistics Cards**: Shows submission counts by status
2. **Advanced Filters**:
   - Search by email or name
   - Filter by status (new, read, replied)
   - Filter by date range (today, last 7 days, last 30 days)
3. **Contact List**: Scrollable list of all submissions
4. **Detail View**: Full contact information and message
5. **Status Actions**: Quick buttons to change submission status
6. **Reply History**: View all replies to a submission

### Accessing the Dashboard
1. Go to Admin Panel
2. Click "Contact Dashboard" in sidebar
3. Use filters to find submissions
4. Click on any submission to view details
5. Update status as needed

---

## 3. Email Marketing Module

### Overview
Complete email marketing solution with:
- **Professional Templates**: Pre-designed for architects and builders
- **Bulk Email Upload**: CSV import for recipient lists
- **BCC Sending**: Recipients don't see each other's emails
- **Campaign Management**: Create, schedule, and track campaigns
- **Analytics**: Monitor campaign performance

### Files
- `server/services/emailMarketingTemplates.ts` - Email templates
- `server/services/bulkEmailService.ts` - Bulk sending logic
- `server/routers/emailMarketing.ts` - tRPC procedures
- `client/src/components/admin/EmailMarketing.tsx` - Admin interface

### Email Templates

#### 1. Architect Template
- Highlights BIM coordination and design expertise
- Emphasizes clash detection and 3D visualization
- Targets architectural firms and design studios

#### 2. Builder Template
- Focuses on construction efficiency and timelines
- Highlights MEP coordination for on-site execution
- Targets construction companies and builders

#### 3. Custom Template
- Flexible template for custom messaging
- Allows full HTML customization

### How to Use

#### Step 1: Upload Recipients
1. Go to Admin Panel → Email Marketing
2. Click "Recipients" tab
3. Prepare CSV file with format:
   ```
   email,name,recipientType,company,city,state
   john@example.com,John Doe,architect,ABC Architects,Mumbai,Maharashtra
   ```
4. Click "Upload" and select CSV file
5. System validates and imports new recipients

#### Step 2: Create Campaign
1. Click "Campaigns" tab
2. Fill in campaign details:
   - Campaign Name
   - Select Template (Architect/Builder/Custom)
   - Email Subject
   - Email Content (HTML)
3. Select recipients from list
4. Click "Create Campaign"

#### Step 3: Send Campaign
1. Campaign appears in "Existing Campaigns" list
2. Click "Send" button
3. Confirm sending
4. System sends emails with BCC (recipients don't see each other)
5. Track progress in campaign list

### CSV Format
```
email,name,recipientType,company,city,state
john@example.com,John Doe,architect,ABC Architects,Mumbai,Maharashtra
jane@example.com,Jane Smith,builder,XYZ Builders,Bangalore,Karnataka
```

**Fields:**
- `email` (required): Valid email address
- `name` (optional): Recipient's full name
- `recipientType`: architect, builder, or other
- `company` (optional): Company name
- `city` (optional): City name
- `state` (optional): State/Province name

### BCC Functionality
- **Primary Recipient**: Your email (projects@imidesign.in)
- **BCC Recipients**: All campaign recipients
- **Benefit**: Recipients can't see other recipients' emails
- **Privacy**: Maintains recipient privacy and list confidentiality

### Campaign Status
- **Draft**: Campaign created, not yet sent
- **Scheduled**: Campaign scheduled for future sending
- **Sending**: Campaign is currently being sent
- **Completed**: Campaign finished sending

### Tracking & Analytics
- View total recipients per campaign
- Track sent vs. failed emails
- Monitor success rate
- View recipient engagement

---

## Database Schema

### New Tables

#### `email_recipients`
Stores all email recipients for marketing campaigns
```sql
- id: Primary key
- email: Email address (unique)
- name: Recipient name
- recipientType: architect | builder | other
- company: Company name
- city: City
- state: State
- subscribed: Boolean flag
- lastEmailSentAt: Timestamp
- totalEmailsReceived: Counter
```

#### `email_campaigns`
Stores email campaign information
```sql
- id: Primary key
- name: Campaign name
- subject: Email subject
- content: Email HTML content
- templateType: architect | builder | custom
- status: draft | scheduled | sending | completed
- totalRecipients: Total count
- sentCount: Successfully sent
- failedCount: Failed sends
- startedAt: Campaign start time
- completedAt: Campaign completion time
```

#### `campaign_recipients`
Maps recipients to campaigns
```sql
- id: Primary key
- campaignId: Foreign key to campaigns
- recipientId: Foreign key to recipients
- email: Email address (denormalized)
- status: pending | sent | failed
- sentAt: Timestamp
- errorMessage: Error details if failed
```

#### `email_logs`
Audit trail for all email sends
```sql
- id: Primary key
- recipientEmail: Email(s) sent to
- subject: Email subject
- emailType: marketing_campaign | auto_reply | etc
- status: sent | failed
- errorMessage: Error details
- sentAt: Timestamp
```

---

## API Endpoints

### Contact Management
```typescript
// Submit contact form with rate limiting and CAPTCHA
POST /api/trpc/contacts.submit
{
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  captchaToken?: string
}

// Get all contacts (admin only)
GET /api/trpc/contacts.list

// Get contact by ID (admin only)
GET /api/trpc/contacts.getById
{ id: number }

// Update contact status (admin only)
POST /api/trpc/contacts.updateStatus
{ id: number, status: 'new' | 'read' | 'replied' }
```

### Email Marketing
```typescript
// Get email templates
GET /api/trpc/emailMarketing.templates.list

// Get specific template
GET /api/trpc/emailMarketing.templates.get
{ templateType: 'architect' | 'builder' | 'custom' }

// Upload recipients from CSV
POST /api/trpc/emailMarketing.recipients.upload
{ csvContent: string }

// Get all recipients
GET /api/trpc/emailMarketing.recipients.list
{ recipientType?: 'architect' | 'builder' | 'other' | 'all', subscribed?: boolean }

// Create campaign
POST /api/trpc/emailMarketing.campaigns.create
{
  name: string
  subject: string
  content: string
  templateType: 'architect' | 'builder' | 'custom'
  recipientIds: number[]
}

// Get all campaigns
GET /api/trpc/emailMarketing.campaigns.list

// Get campaign details
GET /api/trpc/emailMarketing.campaigns.getById
{ id: number }

// Send campaign
POST /api/trpc/emailMarketing.campaigns.send
{
  campaignId: number
  fromEmail: string
  fromName: string
}
```

---

## Security Considerations

### Rate Limiting
- **Storage**: In-memory (resets on server restart)
- **IP Extraction**: Respects X-Forwarded-For header for proxied requests
- **Limit**: 5 submissions per hour per IP
- **TTL**: Counters expire after 1 hour

### CAPTCHA
- **Provider**: hCaptcha (privacy-focused)
- **Verification**: Server-side only
- **Token Validation**: Checked against hCaptcha API
- **Fallback**: If not configured, submissions allowed (for development)

### Email Marketing
- **BCC Privacy**: Recipients can't see other recipients
- **Unsubscribe**: Include unsubscribe link in templates
- **GDPR**: Ensure consent before sending
- **Authentication**: Admin-only access

---

## Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/services/rateLimitService.test.ts

# Run with coverage
pnpm test --coverage
```

### Test Files
- `server/services/rateLimitService.test.ts` - Rate limiting tests
- `server/services/captchaService.test.ts` - CAPTCHA tests
- `server/services/autoEmailService.test.ts` - Email service tests

---

## Best Practices

### Contact Form
1. Always include CAPTCHA for public forms
2. Monitor rate limit errors for abuse patterns
3. Respond to contacts within 24 hours
4. Keep contact dashboard updated

### Email Marketing
1. **Compliance**: Ensure GDPR/CAN-SPAM compliance
2. **Testing**: Test campaigns with small recipient groups first
3. **Content**: Personalize templates for better engagement
4. **Frequency**: Don't spam - maintain reasonable send frequency
5. **Monitoring**: Track bounce rates and unsubscribes
6. **Unsubscribe**: Always include unsubscribe link

### Database
1. Regular backups of email lists
2. Monitor email_logs for delivery issues
3. Clean up old campaign data periodically
4. Maintain recipient list hygiene

---

## Troubleshooting

### Rate Limiting Issues
**Problem**: Users getting rate limited too quickly
**Solution**: Check if IP extraction is working correctly with your proxy setup

**Problem**: Rate limit not resetting
**Solution**: Server restart clears in-memory counters. Consider persistent storage for production.

### CAPTCHA Issues
**Problem**: CAPTCHA not appearing
**Solution**: Check if HCAPTCHA_SITE_KEY is configured

**Problem**: Verification always fails
**Solution**: Verify HCAPTCHA_SECRET_KEY is correct

### Email Marketing Issues
**Problem**: Emails not being sent
**Solution**: Check SMTP configuration in email settings

**Problem**: CSV upload fails
**Solution**: Verify CSV format matches expected structure

**Problem**: Recipients seeing each other's emails
**Solution**: Ensure BCC is being used, not CC

---

## Future Enhancements

1. **Persistent Rate Limiting**: Redis-based rate limiting for multi-server setup
2. **Advanced Analytics**: Email open rates, click tracking
3. **Automation**: Scheduled campaigns, drip campaigns
4. **Personalization**: Dynamic content based on recipient type
5. **A/B Testing**: Test different subject lines and content
6. **Webhook Integration**: Real-time delivery notifications
7. **List Management**: Segment recipients, manage preferences
