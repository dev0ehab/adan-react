import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  Stack,
  Skeleton,
} from '@mui/material';
import { DoneAllRounded, RefreshRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/shared/PageHeader';
import useNotifications from '../../hooks/useNotifications';
import NotificationsList from '../../components/notifications/NotificationsList';

export default function Notifications() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const {
    notifications,
    loading,
    fetchNotifications,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
  } = useNotifications({ fetchOnMount: true });

  const unread = notifications.filter((n) => !n.read_at);
  const read = notifications.filter((n) => n.read_at);
  const displayed = tab === 0 ? notifications : tab === 1 ? unread : read;

  if (loading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={52} />
        {[1, 2, 3, 4].map((k) => (
          <Skeleton key={k} variant="rounded" height={88} />
        ))}
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('notifications.pageTitle')}
        subtitle={t('notifications.pageSubtitle')}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={fetchNotifications}
              sx={{ fontWeight: 700, borderRadius: 999, px: 2.5 }}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<DoneAllRounded />}
              onClick={handleMarkAllRead}
              disabled={unread.length === 0}
              sx={{ fontWeight: 800, borderRadius: 999, px: 2.5 }}
            >
              {t('notifications.clearNew')}
            </Button>
          </>
        }
      />

      {unread.length > 0 && (
        <Chip
          label={t('notifications.freshCount', { count: unread.length })}
          sx={{ mb: 2, fontWeight: 800, bgcolor: 'primary.light', color: 'primary.dark' }}
        />
      )}

      <Card>
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          variant="fullWidth"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 0 }}
        >
          <Tab label={t('notifications.tabAll', { count: notifications.length })} sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label={t('notifications.tabNew', { count: unread.length })} sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label={t('notifications.tabRead', { count: read.length })} sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          <NotificationsList
            items={displayed}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
            emptyPaddingY={6}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
