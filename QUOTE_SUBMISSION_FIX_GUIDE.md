# Quote Submission Database Fix Guide

## Problem Summary

The quote form submission is failing with "Failed to create quote request" error. The root cause is a mismatch between the Drizzle ORM schema definition and the physical database table structure.

## Root Cause Analysis

1. **Schema Definition**: The `quoteRequests` table in `drizzle/schema.ts` (lines 1376-1420) defines these fields:
   - Core fields: quoteCode, clientName, clientEmail, clientPhone, clientCompany, questionnaireResponses, quoteAmount, currency, quoteValidityDays, quoteValidUntil
   - Optional fields: proposalPdfUrl, proposalFileName, sentDate, viewedDate, acceptedDate, rejectedDate, rejectionReason, emailsSent, lastEmailSentAt

2. **Physical Database**: The TiDB Cloud MySQL database may not have all these columns, or they may have different types/constraints

3. **Migration Issue**: The `pnpm db:push` command failed with "Table already exists" errors, suggesting the database was partially set up but not fully synced

## Solutions (in order of preference)

### Solution 1: Force Schema Sync (Recommended)

Run the following command to force Drizzle to sync the schema:

```bash
cd /home/ubuntu/bim_mepf_design
pnpm db:push --force
```

This will:
- Drop and recreate all tables to match the current schema
- Ensure all fields are properly created
- Resolve any type mismatches

**Note**: This will clear any existing data in the tables. If you need to preserve data, use Solution 2 instead.

### Solution 2: Manual Migration (Preserves Data)

If you need to keep existing data, manually add missing columns:

```bash
# Connect to your TiDB database and run these ALTER TABLE commands:

ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS proposalPdfUrl TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS proposalFileName VARCHAR(255);
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS sentDate TIMESTAMP NULL;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS viewedDate TIMESTAMP NULL;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS acceptedDate TIMESTAMP NULL;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS rejectedDate TIMESTAMP NULL;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS rejectionReason LONGTEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS lastEmailSentAt TIMESTAMP NULL;

# Verify the table structure:
DESCRIBE quote_requests;
```

### Solution 3: Simplify Schema (Temporary Workaround)

If you want a quick fix without full schema sync, you can temporarily reduce the schema to only essential fields:

Edit `drizzle/schema.ts` and remove the optional fields from the quoteRequests table definition. However, this is not recommended as it will lose functionality.

## Implementation Steps

### Step 1: Backup Current State
```bash
cd /home/ubuntu/bim_mepf_design
git status  # Check current state
```

### Step 2: Apply Solution 1 (Force Sync)
```bash
pnpm db:push --force
```

### Step 3: Verify Database
```bash
# The database should now have all required tables and columns
# You can verify by checking the schema in your TiDB console
```

### Step 4: Test Quote Submission
1. Navigate to `/quote` in the browser
2. Fill out the quote form with test data
3. Click "Get Quote & Proposal"
4. Check the browser console for any errors
5. Verify the quote appears in the Admin Quote Management panel

### Step 5: Run Tests
```bash
pnpm test -- quoteGeneratorService.test.ts
```

## Current Code Changes

The `createQuoteRequest` function in `server/services/quoteGeneratorService.ts` has been updated to:

1. **Explicitly map all fields** - No more relying on partial field insertion
2. **Include null values for optional fields** - Ensures all columns are accounted for
3. **Better error logging** - Captures SQL error details for debugging

```typescript
const result = await db.insert(quoteRequests).values({
  quoteCode: quoteCode,
  clientName: clientName,
  clientEmail: clientEmail,
  clientPhone: clientPhone || "",
  clientCompany: clientCompany || "",
  questionnaireResponses: JSON.stringify(questionnaire),
  quoteAmount: quoteAmount.toString(),
  currency: "INR",
  quoteValidityDays: 30,
  quoteValidUntil: quoteValidUntil,
  proposalPdfUrl: null,
  proposalFileName: null,
  status: "generated",
  sentDate: null,
  viewedDate: null,
  acceptedDate: null,
  rejectedDate: null,
  rejectionReason: null,
  emailsSent: 0,
  lastEmailSentAt: null,
});
```

## Troubleshooting

### Error: "Table already exists"
This means the database has old tables that don't match the schema. Run `pnpm db:push --force` to recreate them.

### Error: "Column doesn't exist"
This means the physical table is missing columns. Use Solution 2 (Manual Migration) to add them.

### Error: "Type mismatch"
This means a column has a different type than expected. Check the DESCRIBE output and adjust the schema or database accordingly.

### Database Connection Timeout
If you see connection timeouts:
1. Check your DATABASE_URL environment variable
2. Verify TiDB Cloud instance is running
3. Check network connectivity to the database

## Files Modified

- `server/services/quoteGeneratorService.ts` - Updated createQuoteRequest function with explicit field mapping
- `server/services/quoteGeneratorService.test.ts` - Added comprehensive tests for quote generation

## Next Steps After Fix

1. **Email Integration**: Configure SMTP credentials for sending proposal PDFs
2. **Admin Approval Workflow**: Test the admin panel quote approval process
3. **Client Portal**: Verify client can access portal with generated token
4. **Notifications**: Test real-time notifications for quote status updates
5. **Quote Expiration**: Set up scheduled reminders for expiring quotes

## Support

If you continue to experience issues:

1. Check the server logs: `tail -f .manus-logs/devserver.log`
2. Verify database connection: Use TiDB console to check table structure
3. Review error messages in browser console (F12)
4. Check tRPC error details in Network tab of browser DevTools
