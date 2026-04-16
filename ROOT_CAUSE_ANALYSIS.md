# Quote Form Submission - Root Cause Analysis

## Issue Summary
Quote form submissions fail with 500 errors when users click "Get Quote & Proposal" button on the `/quote` page.

## Investigation Timeline

### Step 1: Initial Error (400 Bad Request)
**Error**: `Invalid input: expected number, received string`
- **Cause**: Form was sending `buildingArea` and `numberOfFloors` as strings
- **Fix Applied**: Updated router schema in `server/routers/clientPortal.ts` to use `z.coerce.number()`
- **Status**: ✅ RESOLVED

### Step 2: After Fix (500 Internal Server Error)
**Error**: `Failed query: select ... from quote_pricing_rules where isActive = ?`
- **Initial Hypothesis**: The `quote_pricing_rules` table was missing from the database
- **Investigation**: Checked Drizzle schema - table is defined with 13 columns
- **Attempted Solutions**:
  - Ran `pnpm db:push` - returned "No schema changes"
  - Ran `pnpm drizzle-kit generate` - returned "No schema changes"
  - Checked migrations directory - empty (no migrations applied)

### Step 3: Root Cause Identified ✅
**Actual Issue**: **Database is NOT reachable from the sandbox**

```
Error: getaddrinfo ENOTFOUND gateway04.us-east-1.prod.aws.tidbcloud.com:4000
```

- **Type**: Network connectivity issue
- **Root Cause**: TiDB Cloud database server is unreachable from the sandbox environment
- **Possible Reasons**:
  1. Sandbox IP is not whitelisted in TiDB Cloud IP whitelist
  2. Network firewall blocking outbound connections to TiDB Cloud
  3. Database credentials are incorrect
  4. TiDB Cloud service is down (unlikely)

## Technical Details

### Database Connection Flow
1. Frontend form submission → `/api/trpc/clientPortal.submitQuoteRequest`
2. Router calls `calculateQuoteAmount(input)` in `quoteGeneratorService.ts`
3. Service tries to query `quote_pricing_rules` table
4. Database connection fails with `ENOTFOUND` error
5. Error is caught and returned as 500 Internal Server Error

### Code Changes Made (Not the Root Cause)
1. **Fixed validation error** in `server/routers/clientPortal.ts`:
   - Changed `z.number()` to `z.coerce.number()` for numeric fields
   - This fixed the 400 error but revealed the underlying 500 error

2. **Improved error logging** in `server/services/quoteGeneratorService.ts`:
   - Added explicit field mapping for all columns
   - Added comprehensive error logging

## Solution Steps

### STEP 1: Fix Database Connectivity (REQUIRED)
**Action**: Whitelist sandbox IP in TiDB Cloud

1. Log into [TiDB Cloud Console](https://tidbcloud.com)
2. Navigate to your project
3. Go to **Project Settings** → **Network Access**
4. Check current IP whitelist
5. Add sandbox IP or use `0.0.0.0/0` for testing
6. Save changes and wait for propagation (usually 1-2 minutes)

**Alternative**: Test with direct MySQL connection
```bash
mysql -h gateway04.us-east-1.prod.aws.tidbcloud.com \
      -u <username> \
      -p <password> \
      -D <database_name>
```

### STEP 2: Verify Database Schema (After connectivity is restored)
**Action**: Ensure all tables exist and have correct structure

```bash
# Generate migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Or use the combined script
pnpm db:push
```

### STEP 3: Insert Default Pricing Rules (If needed)
**Action**: Add default pricing rules to `quote_pricing_rules` table

```sql
INSERT INTO quote_pricing_rules (
  ruleName, description, basePrice, pricePerSqft,
  simpleMultiplier, moderateMultiplier, complexMultiplier,
  standardTimelineMultiplier, fastTrackMultiplier, isActive
) VALUES (
  'Default BIM Pricing',
  'Default pricing rule for BIM and MEP services',
  50000,
  5.00,
  1.00,
  1.20,
  1.50,
  1.00,
  1.30,
  true
);
```

### STEP 4: Test Quote Submission
1. Navigate to `https://<your-domain>/quote`
2. Fill in the form with test data
3. Click "Get Quote & Proposal"
4. Expected result: Success page with quote code

## Files Modified
- `server/routers/clientPortal.ts` - Added `z.coerce.number()` for numeric validation
- `server/services/quoteGeneratorService.ts` - Improved error logging
- `check-db.mjs` - Created database connectivity test script

## Prevention for Future
1. **Add database health check endpoint** - Monitor connectivity
2. **Implement retry logic** - Handle transient connection failures
3. **Add better error messages** - Distinguish between network and query errors
4. **Document connection requirements** - IP whitelist, credentials, etc.

## Status
- ✅ Validation error fixed (400 → numeric coercion)
- ✅ Root cause identified (network connectivity)
- ⏳ Awaiting user action to whitelist sandbox IP in TiDB Cloud
- ⏳ Schema sync after connectivity is restored
- ⏳ Quote submission testing after all fixes
