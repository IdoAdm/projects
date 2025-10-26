import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const landingRewrite = (): Plugin => {
  const shouldServeLanding = (pathname: string) => {
    if (!pathname || pathname === '/' || pathname === '/index.html') {
      return false;
    }
    if (pathname.includes('.') || pathname.startsWith('/@')) {
      return false;
    }
    if (pathname.startsWith('/api') || pathname.startsWith('/uploads') || pathname.startsWith('/assets') || pathname.startsWith('/scheduler')) {
      return false;
    }
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length !== 1) {
      return false;
    }
    const reserved = new Set(['signin', 'login', 'register', 'landing', 'index', 'scheduler', 'tasks']);
    return !reserved.has(segments[0].toLowerCase());
  };

  const rewrite = (req: { url?: string }) => {
    const pathOnly = (req.url ?? '').split('?')[0];
    
    // Explicitly handle /dashboard route
    if (pathOnly === '/dashboard') {
      req.url = '/dashboard.html';
      return;
    }
    
    if (shouldServeLanding(pathOnly)) {
      req.url = '/landing.html';
    }
  };

  return {
    name: 'landing-rewrite',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), landingRewrite()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './dashboard.html',
        landing: './landing.html',
      },
    },
  },
});
