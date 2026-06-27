import { useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import {
  getWebFcmToken,
  parseFcmPayload,
  playNotificationSound,
  subscribeForegroundMessages,
} from '../../firebase/fcmToken';

export const FCM_MESSAGE_EVENT = 'adan:fcm-message';
export const FCM_SW_MESSAGE_TYPE = 'adan:fcm-message';

function showNotificationToast(payload) {
  const { title, body } = parseFcmPayload(payload);
  const toastId =
    payload?.messageId ||
    payload?.data?.id ||
    payload?.data?.notification_id ||
    `${title}:${body}`;

  toast.info(
    <div>
      <strong>{title}</strong>
      {body ? (
        <div style={{ marginTop: 4, fontSize: 13, opacity: 0.92 }}>{body}</div>
      ) : null}
    </div>,
    { toastId, autoClose: 6000, icon: false, closeOnClick: true },
  );
}

export default function FcmListener() {
  const { user } = useContext(AuthContext);

  const handleFcmPayload = useCallback((payload) => {
    showNotificationToast(payload);
    playNotificationSound();
    window.dispatchEvent(new CustomEvent(FCM_MESSAGE_EVENT, { detail: payload }));
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    let unsubscribe = () => {};

    (async () => {
      unsubscribe = await subscribeForegroundMessages((payload) => {
        if (!active) return;
        handleFcmPayload(payload);
      });
      if (active) {
        void getWebFcmToken().catch(() => null);
      }
    })();

    const onSwMessage = (event) => {
      if (!active || event.data?.type !== FCM_SW_MESSAGE_TYPE) return;
      if (document.visibilityState !== 'visible') return;
      handleFcmPayload(event.data.payload);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }

    return () => {
      active = false;
      unsubscribe();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
    };
  }, [user, handleFcmPayload]);

  return null;
}
