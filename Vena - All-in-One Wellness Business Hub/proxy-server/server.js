const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get the scheduler service URL from environment variable
const SCHEDULER_SERVICE_URL = process.env.SCHEDULER_SERVICE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESERVED_LANDING_SEGMENTS = new Set(['dashboard', 'signin', 'login', 'register', 'landing', 'index', 'api', 'uploads', 'assets', 'scheduler', 'tasks']);

// Log configuration on startup
console.log('=== PROXY SERVER CONFIGURATION ===');
console.log('PORT:', PORT);
console.log('SCHEDULER_SERVICE_URL:', SCHEDULER_SERVICE_URL ? SCHEDULER_SERVICE_URL : '[NOT SET - serving static files]');
console.log('SUPABASE_URL:', SUPABASE_URL ? '[SET]' : '[NOT SET]');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]');
console.log('==================================');

const shouldServeLandingSlug = (slug = '') => {
  const normalized = String(slug).trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (RESERVED_LANDING_SEGMENTS.has(normalized)) {
    return false;
  }

  return !normalized.includes('.');
};

const fetchLandingProfile = async (slug) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Landing profile lookup unavailable: missing Supabase configuration.');
  }

  const rawSlug = (slug ?? '').toString().trim();
  if (!rawSlug) {
    return null;
  }

  const candidates = Array.from(new Set([rawSlug, rawSlug.toLowerCase()].filter(Boolean)));

  const runQuery = async (candidate, comparator) => {
    const params = new URLSearchParams();
    params.append('select', 'profile_config');
    params.append('profile_config->landingPage->>slug', `${comparator}.${candidate}`);
    params.append('profile_config->landingPage->>published', 'eq.true');
    params.append('limit', '1');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/registrations?${params.toString()}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation,single-object',
        Accept: 'application/vnd.pgrst.object+json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => String(response.status));
      throw new Error(`Supabase returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json().catch(() => null);
    if (!payload) {
      return null;
    }

    const record = Array.isArray(payload) ? payload[0] : payload;
    if (!record || typeof record !== 'object') {
      return null;
    }

    const profileConfig = record.profile_config;
    if (!profileConfig || typeof profileConfig !== 'object') {
      return null;
    }

    return profileConfig;
  };

  for (const candidate of candidates) {
    const profile = await runQuery(candidate, 'eq');
    if (profile) {
      return profile;
    }
  }

  for (const candidate of candidates) {
    const profile = await runQuery(candidate, 'ilike');
    if (profile) {
      return profile;
    }
  }

  return null;
};

// Redirect legacy /schedule/* to /scheduler/* (but not /scheduler itself)
app.get('/schedule', (req, res) => {
  return res.redirect(301, '/scheduler');
});

app.get('/schedule/', (req, res) => {
  return res.redirect(301, '/scheduler/');
});

app.get(/^\/schedule\/(.*)$/, (req, res) => {
  const dest = `/scheduler/${req.params[0]}`;
  return res.redirect(301, dest);
});

// Serve static files from application-page/dist
const staticPath = path.join(__dirname, '..', 'application-page', 'dist');
console.log('Serving static files from:', staticPath);

// Serve scheduler static files from new-scheduler/dist
const schedulerPath = path.join(__dirname, '..', 'new-scheduler', 'dist');
console.log('Serving scheduler files from:', schedulerPath);

// Serve scheduler files under /scheduler path
app.use('/scheduler', express.static(schedulerPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Simple health check for platform probes
app.get('/healthz', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'vena-application-proxy',
    schedulerTarget: SCHEDULER_SERVICE_URL || 'static',
    time: new Date().toISOString(),
  });
});

app.get('/api/landing/:slug', async (req, res) => {
  const rawSlug = String(req.params.slug || '').trim();

  if (!shouldServeLandingSlug(rawSlug)) {
    return res.status(400).json({ ok: false, error: 'Invalid landing page slug.' });
  }

  try {
    const profile = await fetchLandingProfile(rawSlug);

    if (!profile) {
      return res.status(404).json({ ok: false, error: 'Landing page not found.' });
    }

    return res.json({ ok: true, profile });
  } catch (err) {
    console.error('Landing lookup failed:', err);
    return res.status(500).json({ ok: false, error: 'Unable to load landing page.' });
  }
});

app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    // Set proper MIME types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Fallback to index.html for SPA routes (only for non-proxied routes)
app.get('*', (req, res, next) => {
  // /scheduler is handled by proxy middleware above, so this won't be reached
  // Let API routes 404 properly
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Serve the appropriate HTML file based on the route
  if (req.path === '/' || req.path === '/index.html') {
    return res.sendFile(path.join(staticPath, 'index.html'));
  } else if (req.path.startsWith('/dashboard')) {
    return res.sendFile(path.join(staticPath, 'dashboard.html'));
  } else if (req.path.startsWith('/scheduler')) {
    return res.sendFile(path.join(schedulerPath, 'index.html'));
  } else if (req.path.startsWith('/landing')) {
    return res.sendFile(path.join(staticPath, 'landing.html'));
  } else if (req.path === '/tasks') {
    return res.sendFile(path.join(staticPath, 'index.html'));
  }

  // For custom landing slugs (single path segment, no file extension)
  const pathSegments = req.path.split('/').filter(Boolean);
  if (pathSegments.length === 1 && !req.path.includes('.')) {
    const slug = pathSegments[0].toLowerCase();
    
    // Check if it's a typo of a reserved path - redirect to correct path
    if (slug.startsWith('scheduler') && slug !== 'scheduler') {
      return res.redirect(301, '/scheduler');
    }
    if (slug.startsWith('dashboard') && slug !== 'dashboard') {
      return res.redirect(301, '/dashboard');
    }
    
    // Only serve landing.html if it's not a reserved segment
    if (shouldServeLandingSlug(slug)) {
      return res.sendFile(path.join(staticPath, 'landing.html'));
    }
  }

  // Default fallback
  return res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Vena proxy server running on port ${PORT}`);
  console.log(`Serving scheduler files from ${schedulerPath}`);
  console.log(`Serving static files from ${staticPath}`);
});
