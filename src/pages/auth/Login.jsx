import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Pets } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import { getWebFcmToken } from '../../firebase/fcmToken';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = t('auth.validation.emailRequired');
    if (!form.password) newErrors.password = t('auth.validation.passwordRequired');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const fcmToken = await getWebFcmToken().catch(() => null);
      const res = await api.post('/auth/login', {
        ...form,
        fcm_token: fcmToken ?? '',
      });
      login(res.data.token, res.data.user);
      toast.success(t('toasts.welcomeBack'));
      navigate('/app/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || t('toasts.loginFailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: (th) =>
          `radial-gradient(1200px 600px at 20% 0%, ${th.palette.primary.light} 0%, transparent 55%), ${th.palette.background.default}`,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: '0 16px 48px rgba(30, 45, 36, 0.1)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: 'primary.light',
                color: 'primary.dark',
                display: 'inline-grid',
                placeItems: 'center',
                mb: 1.5,
              }}
            >
              <Pets sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
              {t('brand.name')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('auth.loginSubtitle')}
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={800} mb={2}>
            {t('auth.signIn')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, py: 1.4, fontWeight: 800 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('common.continue')}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2}>
            {t('auth.noAccount')}{' '}
            <Link component={RouterLink} to="/register" underline="hover" fontWeight={700}>
              {t('auth.createAccountLink')}
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
}
