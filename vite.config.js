import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function buildFirebaseMessagingSwScript(env) {
  const cfg = {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  };
  if (env.VITE_FIREBASE_MEASUREMENT_ID) {
    cfg.measurementId = env.VITE_FIREBASE_MEASUREMENT_ID;
  }
  if (!cfg.apiKey || !cfg.projectId) {
    return null;
  }
  const base = env.BASE_URL || '/';
  const iconPath = `${base}${base.endsWith('/') ? '' : '/'}icon-192.svg`.replace(/\/{2,}/g, '/');
  const ver = '12.12.0';
  return `/* Generated at build — set VITE_FIREBASE_* in .env.production */
importScripts('https://www.gstatic.com/firebasejs/${ver}/firebase-app-compat.js','https://www.gstatic.com/firebasejs/${ver}/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(cfg)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(async function(payload) {
  const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'Notification';
  const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || (payload.data && payload.data.message) || '';
  const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  windowClients.forEach(function(client) {
    client.postMessage({ type: 'adan:fcm-message', payload: payload });
  });
  const hasVisibleClient = windowClients.some(function(client) {
    return client.visibilityState === 'visible';
  });
  if (hasVisibleClient) {
    return;
  }
  return self.registration.showNotification(title, {
    body: body,
    icon: '${iconPath}',
    badge: '${iconPath}',
    data: payload.data || {},
  });
});`;
}

function firebaseMessagingSwPlugin(mode, base) {
  const env = { ...loadEnv(mode, process.cwd(), ''), BASE_URL: base };
  return {
    name: 'firebase-messaging-sw',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/firebase-messaging-sw.js') {
          return next();
        }
        const body = buildFirebaseMessagingSwScript(env);
        if (!body) {
          return next();
        }
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(body);
      });
    },
    closeBundle() {
      const body = buildFirebaseMessagingSwScript(env);
      if (!body) {
        if (mode === 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            '[FCM] Skipped firebase-messaging-sw.js — set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env.production',
          );
        }
        return;
      }
      const outDir = path.resolve(__dirname, 'dist');
      const out = path.join(outDir, 'firebase-messaging-sw.js');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(out, body, 'utf8');
    },
  };
}

export default defineConfig(({ mode }) => {
  const base = '/';
  return {
    base,
    plugins: [firebaseMessagingSwPlugin(mode, base), react()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor';
              }
              if (id.includes('@mui')) {
                return 'mui';
              }
              if (id.includes('recharts')) {
                return 'charts';
              }
              if (id.includes('leaflet')) {
                return 'map';
              }
              if (id.includes('firebase')) {
                return 'firebase';
              }
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
