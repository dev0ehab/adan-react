import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

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

export async function getMessagingInstance() {
  const firebaseConfig = buildFirebaseConfig();
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }
  if (typeof window === 'undefined' || !(await isSupported())) {
    return null;
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
}

let audioUnlocked = false;

function unlockNotificationAudio() {
  if (audioUnlocked || typeof window === 'undefined') return;
  const unlock = () => {
    audioUnlocked = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close()).catch(() => {});
      }
    } catch {
      // ignore
    }
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

/** Short two-tone chime for incoming FCM messages. */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const tone = (freq, start, duration, volume = 0.12) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    };
    tone(880, 0, 0.1);
    tone(1174.66, 0.12, 0.16);
    ctx.close().catch(() => {});
  } catch {
    // Autoplay may be blocked until user interacts with the page.
  }
}

export function parseFcmPayload(payload) {
  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    'Notification';
  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    payload?.data?.message ||
    '';
  return { title, body };
}

/**
 * Listen for FCM while the app tab is open. Returns an unsubscribe function.
 */
export async function subscribeForegroundMessages(handler) {
  unlockNotificationAudio();
  const messaging = await getMessagingInstance();
  if (!messaging) {
    fcmDebug('Cannot subscribe — Firebase Messaging not initialized.');
    return () => {};
  }
  return onMessage(messaging, handler);
}

/**
 * Web FCM device token. Needs VITE_FIREBASE_* (full web config), VITE_FIREBASE_VAPID_KEY,
 * user granting notification permission, and a working `/firebase-messaging-sw.js`.
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
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      fcmDebug(`Notification permission is "${permission}" — user must allow notifications for a token.`);
      return null;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const token = await getToken(messaging, {
      vapidKey: String(vapidKey).trim(),
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      fcmDebug('getToken() returned empty — check service worker URL and Firebase web app config.');
    }

    unlockNotificationAudio();
    return token || null;
  } catch (err) {
    fcmDebug('getToken failed (often 404 on firebase-messaging-sw.js or wrong VAPID key).', err);
    return null;
  }
}
