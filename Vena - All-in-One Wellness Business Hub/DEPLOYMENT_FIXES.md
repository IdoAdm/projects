# Deployment Fixes - Comprehensive Guide

## Issues Fixed

After analyzing your deployment logs and codebase, I identified and fixed **5 critical issues**:

### 1. Missing CSS File (404 Error)
**Problem:** Both `index.html` and `landing.html` referenced `/index.css` which didn't exist.
**Fix:** Created `application-page/index.css` with base styles.
**Impact:** Eliminates the 404 error you were seeing in the browser console.

### 2. Environment Variable Mismatch
**Problem:** The scheduler service needed `SUPABASE_URL` and `SUPABASE_ANON_KEY`, but `render.yaml` only provided `NEXT_PUBLIC_*` variants.
**Fix:** Added both variants to `render.yaml`:
- `SUPABASE_URL` (for server-side)
- `SUPABASE_ANON_KEY` (for server-side)
- `NEXT_PUBLIC_SUPABASE_URL` (for client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for client-side)

**Impact:** Scheduler service can now properly authenticate with Supabase.

### 3. Application Page Environment Variables
**Problem:** Application page needed `VITE_*` prefixed variables for client-side access.
**Fix:** Added to render.yaml:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Impact:** Frontend can now connect to Supabase properly.

### 4. Proxy Cookie and Header Handling
**Problem:** Authentication cookies and headers weren't properly forwarded between services.
**Fix:** Enhanced proxy-server/server.js with:
- Proper cookie domain rewriting (removes Domain restrictions)
- Forward all Supabase-related headers (`x-supabase-*`, `apikey`)
- Proper Host header setting
- 30-second timeout configuration
- Better error handling with user-friendly messages

**Impact:** Auth state now persists correctly across service boundaries.

### 5. Supabase Client Configuration
**Problem:** Client wasn't logging enough information for debugging.
**Fix:** Enhanced `application-page/lib/supabaseClient.ts` with:
- Better error logging when env vars are missing
- Debug mode in development
- Client identification header
- Startup logging

**Impact:** Easier debugging and troubleshooting.

---

## Required Environment Variables in Render

You **MUST** configure these environment variables in your Render dashboard:

### For `vena-scheduler` service:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For `vena-application` service:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SCHEDULER_SERVICE_URL=https://vena-scheduler.onrender.com
PORT=10000
```

---

## Deployment Steps

1. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Fix deployment issues: missing CSS, env vars, proxy config"
   git push origin main
   ```

2. **Configure Environment Variables in Render Dashboard:**
   - Go to Render Dashboard → Settings → Environment for each service
   - For `vena-scheduler`, add all scheduler environment variables listed above
   - For `vena-application`, add all application environment variables listed above
   - **IMPORTANT:** Get your Supabase credentials from Supabase Dashboard → Project Settings → API

3. **Trigger Redeploy:**
   - In Render Dashboard, go to each service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Monitor the logs for successful deployment

4. **Verify Deployment:**
   - Check that both services start without errors
   - Visit `https://app.vena.software` and check browser console for errors
   - Test `/scheduler` endpoints to ensure proxy is working
   - Verify authentication flow works correctly

---

## Edge Cases & Troubleshooting

### Issue: Scheduler Service Returns 404
**Cause:** Scheduler service hasn't fully started yet
**Solution:** Render services can take 1-2 minutes to fully start. Wait and refresh.

### Issue: "Failed to load resource: 406" or Authentication Errors
**Cause:** Missing or incorrect environment variables
**Solution:** 
1. Verify all environment variables are set in Render Dashboard
2. Ensure SUPABASE_URL ends with `.supabase.co` (no trailing slash)
3. Check that you're using the correct keys (anon key vs service role key)

### Issue: Cookies Not Persisting Across Domains
**Cause:** Browser cookie restrictions or domain mismatch
**Solution:** 
- The fix in proxy-server.js removes Domain restrictions from cookies
- Ensure you're accessing via the primary domain (https://app.vena.software)
- Clear browser cookies and try again

### Issue: Static Files Not Loading (404 on assets)
**Cause:** Build process failed or dist directory not created
**Solution:**
1. Check Render build logs for errors during `yarn build`
2. Ensure `dist` directory is created in build step
3. Verify staticPath in server.js points to correct location

### Issue: CORS Errors
**Cause:** Missing CORS headers or domain configuration
**Solution:** The proxy server now adds CORS headers automatically. If issues persist:
- Check that SCHEDULER_SERVICE_URL is set correctly
- Verify Next.js CORS configuration in scheduler service

---

## What Changed - File Summary

### Modified Files:
1. **render.yaml** - Added missing environment variable keys
2. **proxy-server/server.js** - Enhanced cookie handling, timeout, error handling
3. **application-page/lib/supabaseClient.ts** - Better logging and error handling

### New Files:
1. **application-page/index.css** - Base CSS file to fix 404 errors

---

## Testing Checklist

After deployment, verify these work:

- [ ] Main site loads at https://app.vena.software
- [ ] No 404 errors in browser console
- [ ] Dashboard page loads at https://app.vena.software/dashboard
- [ ] Landing pages load at https://app.vena.software/landing
- [ ] Scheduler proxy works at https://app.vena.software/scheduler/*
- [ ] User registration works
- [ ] User login/authentication works
- [ ] Session persists across page refreshes
- [ ] Custom landing page slugs work (e.g., https://app.vena.software/yourslug)

---

## Important Notes

1. **Scheduler Service Must Start First:** The vena-application service depends on vena-scheduler. If scheduler is down, you'll see 502 errors.

2. **Environment Variables Are Critical:** Missing any required environment variable will cause failures. Double-check all are set.

3. **Cookie-Based Auth:** The system uses localStorage for session storage but cookies for cross-domain auth. The proxy handles this automatically now.

4. **Service Startup Time:** Render free tier services may take 1-2 minutes to wake up after inactivity.

5. **Build Caching:** If you don't see changes, clear Render's build cache: Settings → Build & Deploy → "Clear build cache & deploy"

---

## Quick Fix Commands

If you need to debug locally before deploying:

```bash
# Install dependencies
cd application-page && yarn install && cd ..
cd proxy-server && npm install && cd ..
cd scheduler && npm install && cd ..

# Build application-page
cd application-page && yarn build && cd ..

# Start proxy server locally (from root)
cd application-page && yarn start

# Start scheduler locally (separate terminal)
cd scheduler && npm run dev
```

---

## Contact & Support

If issues persist after applying these fixes:
1. Check Render service logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure Supabase project is active and accessible
4. Check that both services are running in Render Dashboard

Common log locations:
- Build logs: Render Dashboard → Service → Logs (Build)
- Runtime logs: Render Dashboard → Service → Logs (Runtime)
- Browser console: F12 in Chrome/Firefox → Console tab
