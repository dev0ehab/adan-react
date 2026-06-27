import { useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import {
  getWebFcmToken,
  parseFcmPayload,
  playNotificationSound,
  subscribeForegroundMessages,
} from '../../firebase/fcmToken';

export const FCM_MESSAGE_EVENT = 'adan:fcm-message';

function showNotificationToast(payload) {
  const { title, body } = parseFcmPayload(payload);
  toast.info(
    <div>
      <strong>{title}</strong>
      {body ? (
        <div style={{ marginTop: 4, fontSize: 13, opacity: 0.92 }}>{body}</div>
      ) : null}
    </div>,
    { autoClose: 6000, icon: false },
  );
}

export default function FcmListener() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return undefined;

    let unsubscribe = () => {};

    (async () => {
      await getWebFcmToken().catch(() => null);
      unsubscribe = await subscribeForegroundMessages((payload) => {
        showNotificationToast(payload);
        playNotificationSound();
        window.dispatchEvent(new CustomEvent(FCM_MESSAGE_EVENT, { detail: payload }));
      });
    })();

    return () => {
      unsubscribe();
    };
  }, [user]);

  return null;
}
