# How to Create and Set Up TiDB Cloud Account

## Step 1: Create a New TiDB Cloud Account

1. Go to https://tidbcloud.com
2. Click **"Sign Up"** button (top right)
3. You'll see the signup form with options:
   - Sign up with Email
   - Sign up with Google
   - Sign up with GitHub

### Option A: Sign Up with Email (Recommended)
1. Click **"Sign up with Email"**
2. Enter your email address (use your business email or personal email)
3. Create a strong password
4. Check the terms and conditions checkbox
5. Click **"Sign Up"**
6. Check your email for a verification link
7. Click the verification link to confirm your email
8. You'll be taken to the TiDB Cloud dashboard

### Option B: Sign Up with Google
1. Click **"Sign up with Google"**
2. Select your Google account
3. Click **"Allow"** to give TiDB Cloud permission
4. You'll be automatically logged in

### Option C: Sign Up with GitHub
1. Click **"Sign up with GitHub"**
2. Authorize the TiDB Cloud app
3. You'll be automatically logged in

---

## Step 2: Create Your First Cluster

After signing up, you'll see the TiDB Cloud dashboard. Now create a database cluster:

1. Click **"Create Cluster"** button
2. Choose your plan:
   - **Free Tier** (Recommended for testing) - $0/month
   - **Dedicated Tier** - Paid option
3. Select **Free Tier**
4. Choose your region (closest to you or your users):
   - US East (recommended for testing)
   - US West
   - Europe
   - Asia Pacific
5. Click **"Create"**
6. Wait 5-10 minutes for cluster to be created

---

## Step 3: Get Your Database Connection String

Once your cluster is created:

1. Click on your cluster name
2. Click **"Connect"** button
3. You'll see connection options:
   - **MySQL Client**
   - **Connection String**
   - **Python**
   - **Node.js**
   - etc.
4. Copy the **Connection String** (MySQL format)
5. It should look like:
   ```
   mysql://user:password@gateway.us-east-1.prod.aws.tidbcloud.com:4000/database_name
   ```

---

## Step 4: Update Your Manus Project

Now you need to update your Manus project with the TiDB Cloud connection string:

1. Go to your Manus project settings
2. Find **Environment Variables** or **Secrets**
3. Update `DATABASE_URL` with your TiDB Cloud connection string
4. Save the changes
5. Restart your dev server

---

## Step 5: Whitelist Sandbox IP

Now follow the whitelisting steps from **TIDB_WHITELIST_GUIDE.md**:

1. Go to TiDB Cloud console
2. Click your project → **Project Settings**
3. Go to **Network Access**
4. Add `0.0.0.0/0` to whitelist
5. Wait 1-2 minutes
6. Test your connection

---

## Troubleshooting

### Issue: "Connection Refused"
- Make sure you've whitelisted the IP address
- Check your connection string is correct
- Verify username and password are correct

### Issue: "Database Not Found"
- Make sure the database name in connection string matches
- Check if you created the database in TiDB Cloud

### Issue: "Cluster Still Creating"
- Wait 5-10 minutes for cluster to fully initialize
- Refresh the page to check status

---

## What You Get with Free Tier

✅ 5GB storage  
✅ Shared resources  
✅ Full MySQL compatibility  
✅ Perfect for testing and development  
✅ Can upgrade later if needed  

---

## Next Steps

1. **Create TiDB Cloud account** (5 minutes)
2. **Create free cluster** (10 minutes wait)
3. **Get connection string** (1 minute)
4. **Update Manus project** (2 minutes)
5. **Whitelist IP** (2 minutes)
6. **Test keyword management** (1 minute)

**Total time: ~20 minutes**

---

## Questions?

If you get stuck at any step, let me know and I can provide more detailed help!
