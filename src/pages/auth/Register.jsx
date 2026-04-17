import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Pets } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({
    name:                  '',
    email:                 '',
    phone:                 '',
    password:              '', 
    password_confirmation: '',
    region_id:             '',
  });
  const [otp, setOtp]                     = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [errors, setErrors]               = useState({});

  const [countries, setCountries]         = useState([]);
  const [governorates, setGovernorates]   = useState([]);
  const [cities, setCities]               = useState([]);
  const [regions, setRegions]             = useState([]);

  const [selectedCountry, setSelectedCountry]         = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity]               = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get('/locations/countries');
        setCountries(res.data.data ?? res.data);
      } catch {
        setCountries([{ id: 1, name: 'Egypt' }]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const fetchGovernorates = async () => {
      try {
        const res = await api.get(`/locations/countries/${selectedCountry}/governorates`);
        setGovernorates(res.data.data ?? res.data);
        setCities([]);
        setRegions([]);
        setSelectedGovernorate('');
        setSelectedCity('');
        setForm(f => ({ ...f, region_id: '' }));
      } catch {
        /* ignore */
      }
    };
    fetchGovernorates();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedGovernorate) return;
    const fetchCities = async () => {
      try {
        const res = await api.get(`/locations/governorates/${selectedGovernorate}/cities`);
        setCities(res.data.data ?? res.data);
        setRegions([]);
        setSelectedCity('');
        setForm(f => ({ ...f, region_id: '' }));
      } catch {
        /* ignore */
      }
    };
    fetchCities();
  }, [selectedGovernorate]);

  useEffect(() => {
    if (!selectedCity) return;
    const fetchRegions = async () => {
      try {
        const res = await api.get(`/locations/cities/${selectedCity}/regions`);
        setRegions(res.data.data ?? res.data);
        setForm(f => ({ ...f, region_id: '' }));
      } catch {
        /* ignore */
      }
    };
    fetchRegions();
  }, [selectedCity]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = t('auth.validation.nameRequired');
    if (!form.email) newErrors.email = t('auth.validation.emailRequired');
    if (!form.phone) newErrors.phone = t('auth.validation.phoneRequired');
    if (!form.password) newErrors.password = t('auth.validation.passwordRequired');
    else if (form.password.length < 8) newErrors.password = t('auth.validation.passwordMin');
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = t('auth.validation.passwordsMismatch');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name:                  form.name,
        email:                 form.email,
        phone:                 form.phone,
        password:              form.password,
        password_confirmation: form.password_confirmation,
        region_id:             form.region_id || null,
      });
      toast.success(t('toasts.registeredVerify'));
      setStep(2);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
      else toast.error(err.response?.data?.message || t('toasts.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error(t('toasts.enterOtp'));
      return;
    }
    setLoading(true);
    try {

      // await api.post('/auth/verify-otp', { phone: form.phone, otp });
      toast.success(t('toasts.emailVerified'));
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || t('toasts.invalidOtp'));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      // await api.post('/auth/send-otp', { phone: form.phone });
      toast.success(t('toasts.otpResent'));
    } catch {
      toast.error(t('toasts.otpResendFailed'));
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
        background: (t) =>
          `radial-gradient(1000px 500px at 80% 10%, ${t.palette.primary.light} 0%, transparent 50%), ${t.palette.background.default}`,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, boxShadow: '0 16px 48px rgba(30, 45, 36, 0.1)' }}>
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
              {t('auth.registerSubtitle')}
            </Typography>
          </Box>

          {step === 1 && (
            <>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                {t('auth.createAccountTitle')}
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>

                <TextField
                  fullWidth label={t('auth.fullName')} name="name"
                  value={form.name} onChange={handleChange}
                  error={!!errors.name} helperText={errors.name}
                  margin="normal"
                />

                <TextField
                  fullWidth label={t('auth.email')} name="email" type="email"
                  value={form.email} onChange={handleChange}
                  error={!!errors.email} helperText={errors.email}
                  margin="normal"
                />

                <TextField
                  fullWidth label={t('auth.phone')} name="phone"
                  value={form.phone} onChange={handleChange}
                  error={!!errors.phone} helperText={errors.phone}
                  margin="normal"
                  placeholder="+201000000000"
                />

                {/* Country */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('auth.country')}</InputLabel>
                  <Select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    label={t('auth.country')}
                  >
                    {countries.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Governorate */}
                {governorates.length > 0 && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('auth.governorate')}</InputLabel>
                    <Select
                      value={selectedGovernorate}
                      onChange={(e) => setSelectedGovernorate(e.target.value)}
                      label={t('auth.governorate')}
                    >
                      {governorates.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* City */}
                {cities.length > 0 && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('auth.city')}</InputLabel>
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      label={t('auth.city')}
                    >
                      {cities.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Region */}
                {regions.length > 0 && (
                  <FormControl fullWidth margin="normal" error={!!errors.region_id}>
                    <InputLabel>{t('auth.region')}</InputLabel>
                    <Select
                      name="region_id"
                      value={form.region_id}
                      onChange={handleChange}
                      label={t('auth.region')}
                    >
                      {regions.map(r => (
                        <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.region_id && (
                      <FormHelperText>{errors.region_id}</FormHelperText>
                    )}
                  </FormControl>
                )}

                <TextField
                  fullWidth label={t('auth.password')} name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  error={!!errors.password} helperText={errors.password}
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

                <TextField
                  fullWidth label={t('auth.confirmPassword')} name="password_confirmation"
                  type="password"
                  value={form.password_confirmation} onChange={handleChange}
                  error={!!errors.password_confirmation}
                  helperText={errors.password_confirmation}
                  margin="normal"
                />

                <Button
                  fullWidth type="submit" variant="contained"
                  size="large" disabled={loading}
                  sx={{ mt: 2, borderRadius: 2, py: 1.3 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.registerButton')}
                </Button>

              </Box>

              <Typography variant="body2" textAlign="center" mt={2}>
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {t('auth.loginLink')}
                </Link>
              </Typography>
            </>
          )}

          {step === 2 && (
            <>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                {t('auth.verifyEmailTitle')}
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                {t('auth.verifyEmailAlert', { email: form.email })}
              </Alert>

              <Box component="form" onSubmit={handleVerifyOtp}>
                <TextField
                  fullWidth
                  label={t('auth.otpCode')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  margin="normal"
                  inputProps={{ maxLength: 6 }}
                  placeholder="000000"
                />

                <Button
                  fullWidth type="submit" variant="contained"
                  size="large" disabled={loading}
                  sx={{ mt: 2, borderRadius: 2, py: 1.3 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.verifyEmail')}
                </Button>

                <Button
                  fullWidth variant="text"
                  onClick={handleResendOtp}
                  sx={{ mt: 1 }}
                >
                  {t('auth.resendOtp')}
                </Button>

                <Button
                  fullWidth variant="text"
                  onClick={() => setStep(1)}
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  {t('auth.backToRegister')}
                </Button>

              </Box>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}