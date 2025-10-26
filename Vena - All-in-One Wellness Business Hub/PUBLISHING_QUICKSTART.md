# 🚀 Landing Page Publishing - Quick Start Guide

## ✅ What I Fixed

I've set up your complete landing page publishing system:

### 1. **Proxy Server Configuration**
   - Created `proxy-server/.env` with Supabase credentials
   - Added dotenv support to load environment variables
   - Proxy server now handles landing page lookups from database

### 2. **Development Environment**
   - Application-page dev server: http://localhost:5175
   - Scheduler dev server: http://localhost:3001
   - Proxy server (production-like): http://localhost:3000 ✅ **RUNNING NOW**

### 3. **Fixed Dashboard Routing**
   - Updated Vite config to serve `/dashboard` correctly
   - Fixed the "not available" error you saw earlier

---

## 📋 How It Works

```
User creates landing page → Clicks "Publish" → System generates unique URL
     ↓
  Saves to database: profile_config->landingPage->{slug, published:true}
     ↓
  Public can visit: app.vena.software/YOUR-SLUG
     ↓
  Proxy serves landing.html → Fetches data from database → Renders page
```

---

## 🧪 Test It Now (5 Minutes)

### Step 1: Open Dashboard
1. I already opened http://localhost:3000 in the Simple Browser
2. **Click the registration/login link** if you're not logged in
3. Navigate to the **dashboard** or **landing page builder**

### Step 2: Publish Your Landing Page
1. **Edit your profile:**
   - Business Name: "My Test Business"
   - Title: "Founder & CEO"
   - Bio: "We help people succeed"
   - Add a service or two
2. **Click "Save"** button (wait for "Saved!" message)
3. **Click "Publish"** button
4. **Note the URL** it shows you (e.g., "Live at /my-test-business")

### Step 3: View Your Published Page
1. **Open new tab**: http://localhost:3000/my-test-business
   (Replace with your actual slug)
2. **Verify** your landing page shows all your content
3. **Check** for any errors in browser console (F12)

### Step 4: Test Different Scenarios

**Scenario A: Visiting a non-existent slug**
- Visit: http://localhost:3000/does-not-exist
- Should show: "We could not find that page"

**Scenario B: Visiting reserved URLs**
- http://localhost:3000/dashboard → Dashboard page
- http://localhost:3000/scheduler → Scheduler service
- http://localhost:3000/ → Registration page

**Scenario C: Case insensitivity**
- Publish as "MyBusiness"
- Visit: http://localhost:3000/mybusiness (lowercase)
- Should still work!

---

## 🔧 Production Deployment

Once local testing works, deploy to production:

### 1. Update Render Environment Variables

**For vena-application service:**
```
SUPABASE_URL=https://wlsezmbnzovkttjeiizr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...lHjJT0V2rKrzQohftJ0AxXCNGWbSgkUaMUtkyYVXSPE
SCHEDULER_SERVICE_URL=https://vena-scheduler.onrender.com
PORT=10000
```

### 2. Commit and Push
```bash
git add .
git commit -m "Add landing page publishing system with proxy server"
git push origin main
```

### 3. Monitor Render Logs
- Render will auto-deploy
- Check logs for "Vena proxy server running on port 10000"
- Verify "SUPABASE_URL: [SET]" appears in logs

### 4. Test Production
1. Log into https://app.vena.software/dashboard
2. Publish your landing page
3. Visit https://app.vena.software/YOUR-SLUG
4. Share the URL with others!

---

## 🐛 Troubleshooting

### "We could not find that page"

**Check 1:** Is the page actually published?
```sql
-- Run in Supabase SQL Editor
SELECT email, profile_config->'landingPage' as landing
FROM registrations
WHERE profile_config->'landingPage'->>'published' = 'true';
```

**Check 2:** Visit http://localhost:3000/api/landing/YOUR-SLUG
- Should return JSON with profile data
- If 404: Slug doesn't exist
- If 500: Check proxy server terminal for errors

### Publish Button Shows Error

**Check 1:** Are you logged in?
- Clear browser storage
- Log in again

**Check 2:** Check browser console (F12)
- Look for "401 Unauthorized" → Not logged in
- Look for "Network Error" → Supabase connection issue

### Proxy Server Won't Start

**Check 1:** Port 3000 already in use?
```powershell
netstat -ano | findstr :3000
```

**Check 2:** Missing dotenv package?
```powershell
cd proxy-server
npm install dotenv
```

---

## 📊 Database Structure

Your landing pages are stored in the `registrations` table:

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "profile_config": {
    "name": "John Doe",
    "title": "Business Consultant",
    "bio": "Helping businesses grow...",
    "landingPage": {
      "slug": "john-doe",                    ← Public URL path
      "published": true,                      ← Is live?
      "publishedAt": "2025-01-24T10:00:00Z", ← First published
      "lastUpdatedAt": "2025-01-24T10:30:00Z" ← Last updated
    },
    "services": [...],
    "sections": [...],
    ...
  }
}
```

---

## 🌟 Features Included

✅ **Automatic slug generation** from business name, user name, or email
✅ **Uniqueness checking** - adds numbers if slug exists (e.g., vena-2, vena-3)
✅ **Case-insensitive URLs** - /vena = /Vena = /VENA
✅ **Reserved URL protection** - Can't use /dashboard, /api, etc.
✅ **Real-time publishing** - Changes go live immediately
✅ **Unpublish support** - Can hide pages by setting published=false
✅ **Edit and republish** - Update page without changing URL

---

## 📁 Key Files

**Publishing Logic:**
- `application-page/hooks/useProfileConfig.ts` - Publish function
- `application-page/components/PreviewCanvas.tsx` - Publish button UI

**Routing:**
- `proxy-server/server.js` - Landing page URL handling
- `application-page/vite.config.ts` - Dev server routing
- `application-page/landing.tsx` - Public page component

**API:**
- `proxy-server/server.js` line 257 - `/api/landing/:slug` endpoint
- Uses Supabase direct queries for published pages

---

## 🎯 Next Steps

1. **Test locally** using the steps in "Test It Now" section above
2. **Verify** the database has correct data
3. **Deploy to production** following the "Production Deployment" steps
4. **Share your page** with customers!

---

## 💡 Tips

- **Use a clear business name** for best SEO-friendly slugs
- **Update regularly** - publish button updates existing pages
- **Test incognito** - See what public visitors will see
- **Check analytics** - Track visits to your landing page
- **Mobile-friendly** - All landing pages are responsive

---

## 🆘 Need Help?

If you encounter issues:

1. **Check terminal outputs:**
   - Proxy server terminal should show "Vena proxy server running"
   - Look for error messages

2. **Check browser console:**
   - F12 → Console tab
   - Look for failed network requests

3. **Check Supabase:**
   - Go to table editor
   - Verify your user has landingPage data

4. **Share with me:**
   - Terminal error messages
   - Browser console errors
   - The URL you're trying to access
   - Screenshot of the issue

---

**Everything is set up and ready to test!** 🎉

The proxy server is running at http://localhost:3000 - go try publishing your first landing page!
