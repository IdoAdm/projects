# Test Landing Page Publishing - Complete Flow

## Prerequisites
Ensure all services are built and environment variables are configured.

## Step 1: Start all services in separate terminals

### Terminal 1: Application Page Dev Server
```powershell
cd application-page
npm run dev
# Should start on http://localhost:5175 (or 5173/5174/5176)
```

### Terminal 2: Scheduler Dev Server
```powershell
cd scheduler  
npm run dev
# Should start on http://localhost:3001
```

### Terminal 3: Proxy Server (Production-like mode)
```powershell
cd proxy-server
node server.js
# Should start on http://localhost:3000
```

## Step 2: Test the Publishing Flow

1. **Open browser** to http://localhost:3000/dashboard
2. **Log in** with your Supabase credentials
3. **Navigate to landing page builder** (should be automatic or via a button)
4. **Edit your profile:**
   - Name: Your Business Name
   - Title: Your Title/Role
   - Bio: Write a short bio
   - Add services
5. **Click "Save"** button (wait for "Saved!" confirmation)
6. **Click "Publish"** button
7. **Note the URL** shown (e.g., "Live at /your-business-name")

## Step 3: View Your Published Landing Page

1. **Open new browser tab/incognito window**
2. **Visit:** http://localhost:3000/your-slug
   - Replace `your-slug` with the actual slug from Step 2
3. **Verify** your landing page loads with all your content
4. **Check browser console** (F12) for any errors

## Step 4: Verify in Database

1. **Go to Supabase Dashboard**
2. **Table Editor** → `registrations` table
3. **Find your user row** (by email)
4. **Expand `profile_config`** column
5. **Verify `landingPage` section:**
   ```json
   {
     "slug": "your-business-name",
     "published": true,
     "publishedAt": "2025-01-24T...",
     "lastUpdatedAt": "2025-01-24T..."
   }
   ```

## Expected Results

✅ Landing page loads at http://localhost:3000/your-slug
✅ All content is displayed correctly
✅ No errors in browser console
✅ Database has correct published status

## Common Issues

### Issue: "We could not find that page"
**Cause:** Slug not in database or not published
**Fix:** 
- Check Supabase database query above
- Re-publish from dashboard

### Issue: Dashboard won't load
**Cause:** Application-page dev server not running
**Fix:**
- Ensure Terminal 1 shows Vite dev server running
- Visit the actual port shown (might be 5175, 5176, etc.)

### Issue: Publish button says "Failed to publish"
**Cause:** Not logged in or database error
**Fix:**
- Clear browser storage and log in again
- Check browser console for error details

### Issue: Proxy server shows errors
**Cause:** Missing environment variables
**Fix:**
- Verify proxy-server/.env file exists
- Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set

## Testing with Custom Slugs

You can also test accessing pages by slug directly:

```
http://localhost:3000/vena → Looks for slug "vena"
http://localhost:3000/test-page → Looks for slug "test-page"
http://localhost:3000/johns-coffee → Looks for slug "johns-coffee"
```

## Next: Deploy to Production

Once everything works locally:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add landing page publishing with proxy server"
   git push origin main
   ```

2. **Configure Render environment variables:**
   - Go to vena-application service
   - Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

3. **Trigger redeploy** in Render Dashboard

4. **Test in production** at https://app.vena.software/your-slug
