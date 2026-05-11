import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import i18n from '../i18n/config';

const DISMISSED_STORAGE_KEY = 'adan_dismissed_notifications';

function loadDismissedIds() {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map((v) => String(v)) : []);
  } catch {
    return new Set();
  }
}

function persistDismissedIds(idsSet) {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(idsSet)));
  } catch {
    // Ignore storage quota/private mode issues.
  }
}

/**
 * @param {{ fetchOnMount?: boolean; onMutated?: () => void }} [options]
 */
export default function useNotifications(options = {}) {
  const { fetchOnMount = true, onMutated } = options;
  const onMutatedRef = useRef(onMutated);
  onMutatedRef.current = onMutated;
  const dismissedIdsRef = useRef(loadDismissedIds());

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(!!fetchOnMount);

  const resolveNotificationId = useCallback((value) => {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'number') return value;
    return value.id ?? value.notification_id ?? value._id ?? null;
  }, []);

  const sameNotificationId = useCallback(
    (left, right) => {
      const l = resolveNotificationId(left);
      const r = resolveNotificationId(right);
      if (l == null || r == null) return false;
      return String(l) === String(r);
    },
    [resolveNotificationId]
  );

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      setNotifications(
        list.filter((n) => {
          const id = resolveNotificationId(n);
          if (id == null) return true;
          return !dismissedIdsRef.current.has(String(id));
        })
      );
      onMutatedRef.current?.();
    } catch {
      toast.error(i18n.t('toasts.notificationsLoad'));
    } finally {
      setLoading(false);
    }
  }, [resolveNotificationId]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchNotifications();
    }
  }, [fetchOnMount, fetchNotifications]);

  const handleMarkRead = async (value) => {
    const id = resolveNotificationId(value);
    if (id == null) {
      toast.error(i18n.t('toasts.markReadRetry'));
      return;
    }
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (sameNotificationId(n, id) ? { ...n, read_at: new Date().toISOString() } : n))
      );
      onMutatedRef.current?.();
    } catch {
      toast.error(i18n.t('toasts.markReadRetry'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      toast.success(i18n.t('toasts.allCaughtUp'));
      onMutatedRef.current?.();
    } catch {
      toast.error(i18n.t('toasts.markAllReadFailed'));
    }
  };

  const handleDelete = async (value) => {
    const id = resolveNotificationId(value);
    if (id == null) {
      toast.error(i18n.t('toasts.removeNoteFailed'));
      return;
    }
    const normalizedId = String(id);
    dismissedIdsRef.current.add(normalizedId);
    persistDismissedIds(dismissedIdsRef.current);
    setNotifications((prev) => prev.filter((n) => !sameNotificationId(n, id)));
    onMutatedRef.current?.();
    toast.success('Notification removed.');

    try {
      const encodedId = encodeURIComponent(normalizedId);
      const deleteAttempts = [
        () => api.post(`/notifications/${encodedId}/dismiss`),
        () => api.post('/notifications/dismiss', { id }),
        () => api.delete(`/notifications/${encodedId}`),
        () => api.delete(`/notifications/${encodedId}/delete`),
        () => api.post(`/notifications/${encodedId}/delete`),
      ];

      let shouldToast = true;
      for (const attempt of deleteAttempts) {
        try {
          await attempt();
          shouldToast = false;
          break;
        } catch (error) {
          const status = error?.response?.status;
          if (status && status !== 404 && status !== 405 && status !== 501) {
            throw error;
          }
        }
      }
      if (shouldToast) return;
    } catch {
      toast.error('Could not remove notification from server.');
    }
  };

  return {
    notifications,
    loading,
    fetchNotifications,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
  };
}
