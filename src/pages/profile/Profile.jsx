import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, Typography, Avatar,
  Button, TextField, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip
} from '@mui/material';
import {
  Edit, Save, Delete, Person,
  Email, Phone, LocationOn, Badge
} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';

export default function Profile() {
  const { t } = useTranslation();
  // const { logout }          = useAuth();
  // const navigate                  = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editMode, setEditMode]   = useState(false);
  // const [deleteDialog, setDeleteDialog] = useState(false);
  const [profileData, setProfileData]   = useState(null);
  const [form, setForm]           = useState({
    name:  '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await api.get('/auth/me');
        const data = res.data?.data ?? res.data;
        setProfileData(data);
        setForm({
          name:  data.name  ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
        });
      } catch {
        toast.error(t('toasts.profileLoadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // await api.put('/auth/profile', form);
      setProfileData({ ...profileData, ...form });
      setEditMode(false);
      toast.success(t('toasts.profileUpdated'));
    } catch {
      toast.error(t('toasts.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };




{/* const handleDelete = async () => {
   try {
     // await api.delete('/auth/account');
     logout();
     toast.success('Account deleted');
     navigate('/');
   } catch {
     toast.error('Failed to delete account');
   }
}; */}

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t('profile.title')}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>

        {/* Left - Avatar - Info */}
        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>

              {/* Avatar */}
            <Avatar
                sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 40, mx: 'auto', mb: 2 }}
                src={profileData?.avatar ?? profileData?.profile_photo_url ?? ''}
                >
                {profileData?.name?.charAt(0).toUpperCase()}
            </Avatar>

              <Typography variant="h6" fontWeight="bold">
                {profileData?.name}
              </Typography>

              <Chip
                label={profileData?.role === 'doctor' ? t('profile.vet') : t('profile.breeder')}
                color={profileData?.role === 'doctor' ? 'success' : 'primary'}
                size="small"
                sx={{ mt: 1, mb: 2 }}
              />

              <Divider sx={{ mb: 2 }} />

              {/* Info */}
              <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {profileData?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData?.phone ?? t('profile.na')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData?.region?.name ?? t('profile.na')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Member since {profileData?.created_at?.slice(0, 10) ?? 'N/A'}
                  </Typography>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Box>

        {/* Right - Edit Form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  {t('profile.personalInfo')}
                </Typography>
                {!editMode ? (
                  <Button
                    startIcon={<Edit />}
                    variant="outlined"
                    onClick={() => setEditMode(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('profile.edit')}
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('common.save')}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth label={t('profile.fullName')} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!editMode}
                  InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                <TextField
                  fullWidth label={t('auth.email')} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!editMode}
                  InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                <TextField
                  fullWidth label={t('profile.phone')} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={!editMode}
                  InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {/* <Card sx={{ borderRadius: 3, boxShadow: 2, border: '1px solid #ffebee' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="error" mb={1}>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Once you delete your account, all your data will be permanently removed.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card> */}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      {/* <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete your account? This action <b>cannot be undone</b>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog> */}

    </Box>
  );
}