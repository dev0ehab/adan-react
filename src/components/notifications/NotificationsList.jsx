import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  NotificationsRounded,
  ReportRounded,
  VaccinesRounded,
  PetsRounded,
  DoneAllRounded,
  DeleteOutlineRounded,
  FiberManualRecordRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function typeIcon(type) {
  if (type === 'report') return <ReportRounded />;
  if (type === 'vaccine') return <VaccinesRounded />;
  if (type === 'animal') return <PetsRounded />;
  return <NotificationsRounded />;
}

function typeColor(type) {
  if (type === 'report') return '#c45c52';
  if (type === 'vaccine') return '#4a90a4';
  if (type === 'animal') return '#4a7c59';
  return '#8a7ca8';
}

function typeBg(type) {
  if (type === 'report') return 'rgba(196, 92, 82, 0.1)';
  if (type === 'vaccine') return 'rgba(74, 144, 164, 0.12)';
  if (type === 'animal') return 'rgba(74, 124, 89, 0.12)';
  return 'rgba(138, 124, 168, 0.12)';
}

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(iso);
  }
}

/**
 * @param {{
 *   items: Array<Record<string, unknown>>;
 *   onMarkRead: (id: string | number) => void;
 *   onDelete: (id: string | number) => void;
 *   emptyPaddingY?: number;
 * }} props
 */
export default function NotificationsList({ items, onMarkRead, onDelete, emptyPaddingY = 4 }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: emptyPaddingY, color: 'text.secondary', px: 2 }}>
        <NotificationsRounded sx={{ fontSize: 44, opacity: 0.25, mb: 1 }} />
        <Typography variant="body2" fontWeight={600}>
          {t('notifications.emptyTitle')}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          {t('notifications.emptySubtitle')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {items.map((n, index) => (
        <Box key={n.id}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              px: 2,
              py: 1.5,
              bgcolor: !n.read_at ? 'rgba(74, 124, 89, 0.04)' : 'transparent',
              transition: 'background-color 0.2s ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Avatar sx={{ bgcolor: typeBg(n.type), width: 40, height: 40, flexShrink: 0 }}>
              <Box sx={{ color: typeColor(n.type), display: 'flex' }}>{typeIcon(n.type)}</Box>
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography variant="subtitle2" fontWeight={!n.read_at ? 800 : 600} sx={{ fontSize: '0.875rem' }}>
                  {n.title}
                </Typography>
                {!n.read_at && <FiberManualRecordRounded sx={{ fontSize: 8, color: 'primary.main' }} />}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.4, fontSize: '0.8rem' }}>
                {n.body}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: 'block' }}>
                {formatWhen(n.created_at)}
              </Typography>
            </Box>
            <Stack spacing={0.25} flexShrink={0}>
              {!n.read_at && (
                <Tooltip title={t('notifications.markRead')}>
                  <IconButton size="small" onClick={() => onMarkRead(n.id)} sx={{ color: 'primary.main' }}>
                    <DoneAllRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('notifications.dismiss')}>
                <IconButton size="small" onClick={() => onDelete(n.id)} sx={{ color: 'text.secondary' }}>
                  <DeleteOutlineRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          {index < items.length - 1 && <Divider />}
        </Box>
      ))}
    </>
  );
}
