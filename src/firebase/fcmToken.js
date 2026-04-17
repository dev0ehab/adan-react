import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

function buildFirebaseConfig() {
  const entries = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
  return Object.fromEntries(
    Object.entries(entries).filter(([, v]) => v != null && String(v).trim() !== '')
  );
}

function fcmDebug(message, detail) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[FCM] ${message}`, detail ?? '');
  }
}

/**
 * Web FCM device token. Needs VITE_FIREBASE_* (full web config), VITE_FIREBASE_VAPID_KEY,
 * user granting notification permission, and a working `/firebase-messaging-sw.js` (Vite serves it in dev when env is set; production needs `npm run build` with env set).
 */
export async function getWebFcmToken() {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  const firebaseConfig = buildFirebaseConfig();
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    fcmDebug(
      'Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID — add them to .env.local and restart `npm run dev`.'
    );
    return null;
  }
  if (!vapidKey || String(vapidKey).trim() === '') {
    fcmDebug(
      'Missing VITE_FIREBASE_VAPID_KEY — Firebase Console → Project settings → Cloud Messaging → Web Push certificates → Generate key pair.'
    );
    return null;
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    fcmDebug('Service workers not available in this environment.');
    return null;
  }

  if (!(await isSupported())) {
    fcmDebug(
      'Firebase Messaging not supported (use HTTPS in production, or localhost; also check browser).'
    );
    return null;
  }

  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    console.log(app , messaging);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      fcmDebug(`Notification permission is "${permission}" — user must allow notifications for a token.`);
      return null;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    console.log(registration);

    const token = await getToken(messaging, {
      vapidKey: String(vapidKey).trim(),
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      fcmDebug('getToken() returned empty — check service worker URL and Firebase web app config.');
    }

    return token || null;
  } catch (err) {
    fcmDebug('getToken failed (often 404 on firebase-messaging-sw.js or wrong VAPID key).', err);
    return null;
  }
}
