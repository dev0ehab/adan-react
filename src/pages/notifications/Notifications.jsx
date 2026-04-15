import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip,
  CircularProgress, Avatar, Divider, Button,
  IconButton, Tooltip, Tabs, Tab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Report, Vaccines, Pets,
  DoneAll, Delete, Circle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const typeIcon = (type) => {
  if (type === 'report')  return <Report />;
  if (type === 'vaccine') return <Vaccines />;
  if (type === 'animal')  return <Pets />;
  return <NotificationsIcon />;
};

const typeColor = (type) => {
  if (type === 'report')  return '#d32f2f';
  if (type === 'vaccine') return '#1976d2';
  if (type === 'animal')  return '#2e7d32';
  return '#7b1fa2';
};

const typeBg = (type) => {
  if (type === 'report')  return '#ffebee';
  if (type === 'vaccine') return '#e3f2fd';
  if (type === 'animal')  return '#e8f5e9';
  return '#f3e5f5';
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState(0);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res  = await api.get('/notifications');
      const raw  = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw :
                   Array.isArray(raw?.data) ? raw.data : [];
      setNotifications(list); 
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }; 
  fetchNotifications();
}, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({
        ...n, read_at: n.read_at ?? new Date().toISOString()
      })));
      toast.success('All marked as read!');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const unread    = notifications.filter(n => !n.read_at);
  const read      = notifications.filter(n =>  n.read_at);
  const displayed = tab === 0 ? notifications : tab === 1 ? unread : read;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" fontWeight="bold">Notifications</Typography>
          {unread.length > 0 && (
            <Chip
              label={`${unread.length} unread`}
              size="small"
              color="error"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<DoneAll />}
          onClick={handleMarkAllRead}
          disabled={unread.length === 0}
          sx={{ borderRadius: 2 }}
        >
          Mark All Read
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{ px: 2, borderBottom: '1px solid #f0f0f0' }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unread.length})`} />
          <Tab label={`Read (${read.length})`} />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {displayed.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <NotificationsIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography>No notifications</Typography>
            </Box>
          ) : (
            displayed.map((n, index) => (
              <Box key={n.id}>
                <Box sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 2,
                  px: 3, py: 2,
                  bgcolor: !n.read_at ? '#fafafa' : 'white',
                  transition: '0.2s',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}>

                  {/* Icon */}
                  <Avatar sx={{ bgcolor: typeBg(n.type), width: 42, height: 42, flexShrink: 0 }}>
                    <Box sx={{ color: typeColor(n.type), display: 'flex' }}>
                      {typeIcon(n.type)}
                    </Box>
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={!n.read_at ? 'bold' : 'normal'}>
                        {n.title}
                      </Typography>
                      {!n.read_at && (
                        <Circle sx={{ fontSize: 8, color: '#1976d2' }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                      {n.body}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                      🕐 {n.created_at}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    {!n.read_at && (
                      <Tooltip title="Mark as Read">
                        <IconButton size="small" onClick={() => handleMarkRead(n.id)}>
                          <DoneAll fontSize="small" sx={{ color: '#1976d2' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(n.id)}>
                        <Delete fontSize="small" sx={{ color: '#d32f2f' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                </Box>
                {index < displayed.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}