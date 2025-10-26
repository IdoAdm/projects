# Landing Page Publishing System - Complete Guide

## How It Works

Your Vena platform has a complete landing page publishing system. Here's how it works:

### 1. **User Creates Landing Page**
- User logs into dashboard at `/dashboard`
- Clicks "Landing Page Builder" or navigates to `/landing`
- Edits their profile, services, about section, etc.
- Clicks "Save" to save their work

### 2. **User Publishes Landing Page**
- After editing, clicks the "Publish" button
- System automatically:
  - Generates a unique slug (URL) based on business name, user name, or email
  - Checks if slug is already taken
  - If taken, adds a number suffix (e.g., `vena-2`, `vena-3`)
  - Stores the slug in database with `published: true`
  - Updates `publishedAt` and `lastUpdatedAt` timestamps

### 3. **Public Can View Landing Page**
- Landing page is accessible at: `https://app.vena.software/{slug}`
- Example: `https://app.vena.software/vena`
- System serves `landing.html` for any single-segment path that's not reserved
- Frontend loads the published profile from the database

---

## Architecture Overview

```
User visits: https://app.vena.software/vena
                    ↓
        proxy-server (port 3000)
                    ↓
    Checks if "vena" is a valid slug
                    ↓
        Serves landing.html
                    ↓
    landing.tsx loads in browser
                    ↓
    Fetches profile from /api/landing/vena
                    ↓
    Queries Supabase registrations table
                    ↓
    WHERE profile_config->landingPage->slug = 'vena'
    AND profile_config->landingPage->published = true
                    ↓
    Renders PublishedLandingPage component
```

---

## Current Production Issue

Based on your screenshot showing "We could not find that page" at `app.vena.software/vena`, here are the possible causes:

### Issue 1: No User Has Published with Slug "vena"
**Check:** Query your Supabase database
```sql
SELECT id, email, profile_config->'landingPage' as landing_page
FROM registrations
WHERE profile_config->'landingPage'->>'slug' = 'vena'
AND profile_config->'landingPage'->>'published' = 'true';
```

**Solution:** If no results, the slug `vena` hasn't been published yet. You need to:
1. Log into dashboard
2. Go to landing page builder
3. Click "Publish"
4. System will generate a slug for you

### Issue 2: Production Proxy Server Not Serving Landing Pages Correctly
**Check:** Look at Render logs for `vena-application` service when you visit `/vena`

**Symptoms:**
- You see "Landing lookup failed" errors
- You see "Unable to load landing page" errors
- 404 errors from `/api/landing/vena`

**Solution:** Ensure environment variables are set in production:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Issue 3: Landing.html Not Built Correctly
**Check:** Verify build output includes `landing.html`

**Solution:** Check `render.yaml` build command:
```yaml
buildCommand: |
  cd application-page && yarn install --frozen-lockfile --prefer-offline && yarn build && cd ..
```

Verify `dist` folder contains:
- `index.html`
- `dashboard.html`
- `landing.html`
- All assets

---

## Local Testing Steps

Test the complete flow locally before deploying:

### Step 1: Start All Services

```bash
# Terminal 1: Start application-page dev server
cd application-page
npm run dev
# Should start on http://localhost:5175 (or 5173/5174)

# Terminal 2: Start scheduler dev server  
cd scheduler
npm run dev
# Should start on http://localhost:3001

# Terminal 3: Start proxy server (PRODUCTION MODE)
cd proxy-server
node server.js
# Should start on http://localhost:3000
```

### Step 2: Publish a Landing Page

1. Visit `http://localhost:3000/dashboard`
2. Click somewhere to create/edit landing page
3. Edit your profile (name, bio, services, etc.)
4. Click "Publish" button
5. Note the slug that gets generated (e.g., "john-doe")
6. You should see: "Landing page published! Live at /john-doe"

### Step 3: Test Public URL

1. Open new browser/incognito window
2. Visit `http://localhost:3000/john-doe` (use your actual slug)
3. Should see your published landing page
4. Check browser console for errors

### Step 4: Verify Database

Query Supabase to confirm data was saved:

```sql
SELECT 
  id,
  email,
  profile_config->'landingPage'->>'slug' as slug,
  profile_config->'landingPage'->>'published' as published,
  profile_config->'name' as name
FROM registrations
WHERE profile_config->'landingPage'->>'published' = 'true';
```

---

## Production Deployment Checklist

### Before Deploying

- [ ] Test publishing flow locally (all 4 steps above)
- [ ] Verify `landing.html` exists in `application-page/dist` after build
- [ ] Confirm environment variables are set in Render dashboard
- [ ] Check that `render.yaml` has correct build commands

### Deploy to Production

```bash
# 1. Commit all changes
git add .
git commit -m "Fix landing page publishing"
git push origin main

# 2. Render will auto-deploy both services
# Monitor in Render Dashboard → Services → Logs
```

### After Deployment

- [ ] Check both services are running (green status in Render)
- [ ] Visit `https://app.vena.software` - should load
- [ ] Visit `https://app.vena.software/dashboard` - should load
- [ ] Log in and publish a landing page
- [ ] Visit your slug URL (e.g., `https://app.vena.software/your-slug`)
- [ ] Check for errors in browser console (F12)

---

## Debugging Production Issues

### Check Render Logs

**For vena-application service:**
```
Render Dashboard → vena-application → Logs
```

Look for:
- "Landing lookup failed" - Supabase query error
- "Landing profile lookup unavailable" - Missing env vars
- "404" when fetching /api/landing/{slug} - Slug doesn't exist

### Check Supabase

1. Go to Supabase Dashboard → Table Editor
2. Open `registrations` table
3. Click on a user row
4. Expand `profile_config` column
5. Look for `landingPage` object:
   ```json
   {
     "slug": "john-doe",
     "published": true,
     "publishedAt": "2025-01-01T00:00:00.000Z",
     "lastUpdatedAt": "2025-01-01T00:00:00.000Z"
   }
   ```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit a landing page URL
4. Look for requests to:
   - `/api/landing/{slug}` - Should return 200 with profile data
   - If 404: Slug not found or not published
   - If 500: Server error (check Render logs)

---

## Common Issues & Solutions

### "We could not find that page"

**Cause 1:** Slug doesn't exist in database
- **Fix:** Publish a landing page first

**Cause 2:** Landing page not marked as published
- **Fix:** Re-publish from dashboard

**Cause 3:** Case sensitivity mismatch
- **Fix:** System already handles this, but ensure you're using lowercase slugs

### "Unable to load this landing page right now"

**Cause:** Supabase connection error
- **Fix:** Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Render

### Publish Button Shows "Failed to publish"

**Cause 1:** User not logged in
- **Fix:** Log in first

**Cause 2:** Slug generation failed
- **Fix:** Check console for error details

**Cause 3:** Database write failed
- **Fix:** Check Supabase RLS policies for `registrations` table

---

## Reserved URLs (Cannot Be Used as Slugs)

These paths are reserved and cannot be used as landing page slugs:
- `/dashboard`
- `/signin`
- `/login`
- `/register`
- `/landing`
- `/index`
- `/api`
- `/uploads`
- `/assets`
- `/scheduler`
- `/tasks`

If user tries to publish with a name that matches these, system will auto-append a number.

---

## How Slug Generation Works

Priority order for generating slug:

1. **Existing slug**: If user already published, keep the same slug
2. **Business name**: From profile config (slugified)
3. **User name**: From profile config (slugified)
4. **Email username**: Part before @ in email (slugified)
5. **Fallback**: `page-{userId-first-8-chars}`

Slugify rules:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep only: letters, numbers, hyphens

Example:
- "John's Coffee Shop" → "johns-coffee-shop"
- "Café Mocha!" → "cafe-mocha"

---

## Testing Production Right Now

To test if your production site can serve landing pages:

### Option 1: Create a Test Landing Page

1. Visit https://app.vena.software/dashboard
2. Log in with your account
3. Edit your landing page (add name, bio, etc.)
4. Click "Publish"
5. Note the URL that appears (e.g., "Live at /your-slug")
6. Visit https://app.vena.software/your-slug

### Option 2: Query Database Directly

Run this in Supabase SQL Editor:

```sql
-- Find all published landing pages
SELECT 
  id,
  email,
  profile_config->'landingPage'->>'slug' as slug,
  profile_config->'name' as name,
  profile_config->'landingPage'->>'publishedAt' as published_at
FROM registrations
WHERE profile_config->'landingPage'->>'published' = 'true'
ORDER BY profile_config->'landingPage'->>'publishedAt' DESC;
```

Then visit: `https://app.vena.software/{slug}` for any slug in results.

---

## Next Steps

1. **Test locally first** using the steps in "Local Testing Steps"
2. **Verify database** has the correct structure and data
3. **Check production logs** in Render for any errors
4. **Try publishing** a new landing page in production
5. **Share the slug** and I can help debug if it doesn't work

---

## Quick Fixes to Try Now

### Fix 1: Rebuild and Redeploy

Sometimes stale builds cause issues:

1. Render Dashboard → vena-application
2. Settings → Build & Deploy
3. Click "Clear build cache & deploy"
4. Wait for rebuild to complete

### Fix 2: Verify Environment Variables

1. Render Dashboard → vena-application → Environment
2. Confirm these exist:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SCHEDULER_SERVICE_URL
3. Values should match your Supabase project

### Fix 3: Check proxy-server Logs

When you visit `/vena`, check logs for:
```
LOG: Serving landing page for slug: vena
```

If you don't see this, the proxy isn't handling the route correctly.

---

## Need Help?

If the issue persists, please share:

1. **URL you're trying to visit**: e.g., `app.vena.software/vena`
2. **Render logs**: Copy from vena-application service
3. **Browser console errors**: Copy from DevTools console (F12)
4. **Database query result**: From the SQL query above

This will help me diagnose the exact issue!
