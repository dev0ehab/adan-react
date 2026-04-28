import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import i18n from '../i18n/config';

/**
 * @param {{ fetchOnMount?: boolean; onMutated?: () => void }} [options]
 */
export default function useNotifications(options = {}) {
  const { fetchOnMount = true, onMutated } = options;
  const onMutatedRef = useRef(onMutated);
  onMutatedRef.current = onMutated;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(!!fetchOnMount);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      setNotifications(list);
      onMutatedRef.current?.();
    } catch {
      toast.error(i18n.t('toasts.notificationsLoad'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchOnMount) {
      fetchNotifications();
    }
  }, [fetchOnMount, fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      onMutatedRef.current?.();
    } catch {
      toast.error(i18n.t('toasts.removeNoteFailed'));
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
