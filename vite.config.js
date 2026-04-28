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
  const ver = '12.12.0';
  return `/* Generated at build — set VITE_FIREBASE_* in .env */
importScripts('https://www.gstatic.com/firebasejs/${ver}/firebase-app-compat.js','https://www.gstatic.com/firebasejs/${ver}/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(cfg)});
firebase.messaging();`;
}

function firebaseMessagingSwPlugin(mode) {
  const env = loadEnv(mode, process.cwd(), '');
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
        res.end(body);
      });
    },
    writeBundle() {
      const body = buildFirebaseMessagingSwScript(env);
      if (!body) {
        return;
      }
      const outDir = path.resolve(__dirname, 'dist');
      const out = path.join(outDir, 'firebase-messaging-sw.js');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(out, body, 'utf8');
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [firebaseMessagingSwPlugin(mode), react()],
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
}));
