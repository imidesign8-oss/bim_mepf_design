# How to Whitelist Sandbox IP in TiDB Cloud

## Problem
Your keyword management and quote form features are failing because the TiDB Cloud database cannot be accessed from the sandbox environment. The database connection is being blocked due to network access restrictions.

## Solution: Whitelist IP Address in TiDB Cloud

### Step-by-Step Instructions

#### Step 1: Log Into TiDB Cloud Console
1. Go to https://tidbcloud.com
2. Sign in with your email and password
3. You should see your projects dashboard

#### Step 2: Navigate to Network Access Settings
1. Click on your **Project Name** (e.g., "BIM Design Project")
2. Go to **Project Settings** (gear icon in top-right)
3. Look for **Network Access** in the left sidebar
4. Click on **Network Access**

#### Step 3: Add IP Address to Whitelist
1. Click the **+ Add IP Address** button
2. You'll see a dialog box with an input field
3. Enter: `0.0.0.0/0`
   - This allows all IP addresses (good for testing)
   - For production, you can restrict to specific IPs later
4. Click **Confirm** or **Save**

#### Step 4: Wait for Changes to Propagate
- TiDB Cloud usually takes 1-2 minutes to apply changes
- Wait at least 2 minutes before testing

#### Step 5: Test the Connection
1. Go back to your website: https://bimdesign-dqgmwfpz.manus.space
2. Log in to Admin Dashboard
3. Go to **Keyword Management**
4. Try adding a new keyword:
   - Keyword: "BIM modeling services"
   - Category: "BIM Modeling"
   - Search Volume: 1200
   - Difficulty: 45
   - Target Position: 3
5. Click **Add Keyword**
6. If successful, you'll see the keyword in the list

---

## What If It Still Doesn't Work?

### Check 1: Verify Database Connection String
1. In TiDB Cloud console, go to **Clusters**
2. Click on your cluster
3. Click **Connect** button
4. Copy the connection string
5. Verify it matches your `DATABASE_URL` environment variable

### Check 2: Verify Credentials
1. Make sure your TiDB username and password are correct
2. Check if the database name is correct (usually `bim_design` or similar)

### Check 3: Check Firewall Rules
1. Go to **Network Access** again
2. Make sure `0.0.0.0/0` is listed
3. If not, add it again

### Check 4: Restart Dev Server
1. After whitelisting, restart your Manus dev server
2. Go to the Management UI → Dashboard
3. Click the restart button

---

## After Whitelisting - What Works

Once the IP is whitelisted, these features will work:

✅ **Keyword Management**
- Add new keywords to track
- Edit existing keywords
- Delete keywords
- View keyword rankings

✅ **Quote Form Submission**
- Clients can submit quote requests
- Data is saved to database
- Admin receives notifications

✅ **All Admin Features**
- Blog management
- Project management
- Service management
- Contact management
- SEO settings

✅ **Email Notifications**
- Contact form emails
- Quote submission emails
- Admin notification emails

---

## Security Note

**For Production:**
- Don't use `0.0.0.0/0` permanently
- Instead, whitelist only your application's IP address
- Once deployed to production, update to your production server's IP

**For Development:**
- `0.0.0.0/0` is fine for testing
- You can change it later when deploying to production

---

## Still Having Issues?

If whitelisting doesn't work, here are alternative options:

### Option A: Use a Different Database
- Switch to a different database provider (Firebase, Supabase, etc.)
- Requires code changes

### Option B: Contact TiDB Cloud Support
- Go to TiDB Cloud console → Help → Support
- Describe the connection issue
- They can help troubleshoot

### Option C: Use Local Database for Testing
- Set up a local MySQL database
- Use for development and testing
- Switch back to TiDB Cloud for production

---

## Troubleshooting Checklist

- [ ] Logged into TiDB Cloud console
- [ ] Found Network Access settings
- [ ] Added `0.0.0.0/0` to whitelist
- [ ] Waited 2+ minutes for changes
- [ ] Restarted dev server
- [ ] Tried adding a keyword again
- [ ] Checked browser console for errors
- [ ] Verified database connection string

---

## Questions?

If you need help with any step, let me know and I can provide more detailed instructions or screenshots.
