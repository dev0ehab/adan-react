import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({
    name:                  '',
    email:                 '',
    phone:                 '',
    password:              '', 
    password_confirmation: '',
    region_id:             '',
    role:                  '',
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
        <>
        </>
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
        <>
        </>
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
        <>
        </>
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
    if (!form.name)    newErrors.name    = 'Name is required';
    if (!form.email)   newErrors.email   = 'Email is required';
    if (!form.phone)   newErrors.phone   = 'Phone is required';
    if (!form.role)    newErrors.role    = 'Role is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Min 8 characters';
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match';
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
      toast.success('Registered! Please verify your email.');
      setStep(2);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
      else toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { toast.error('Please enter the OTP'); return; }
    setLoading(true);
    try {

      // await api.post('/auth/verify-otp', { phone: form.phone, otp });
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      // await api.post('/auth/send-otp', { phone: form.phone });
      toast.success('OTP resent!');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f0f4f8',
      py: 4,
    }}>
      <Card sx={{ width: 480, borderRadius: 3, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>

          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Pets sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold" mt={1}>ADAN</Typography>
            <Typography variant="body2" color="text.secondary">
              Animal Disease Alert Network
            </Typography>
          </Box>

          {step === 1 && (
            <>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Create Account
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>

                <TextField
                  fullWidth label="Full Name" name="name"
                  value={form.name} onChange={handleChange}
                  error={!!errors.name} helperText={errors.name}
                  margin="normal"
                />

                <TextField
                  fullWidth label="Email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  error={!!errors.email} helperText={errors.email}
                  margin="normal"
                />

                <TextField
                  fullWidth label="Phone" name="phone"
                  value={form.phone} onChange={handleChange}
                  error={!!errors.phone} helperText={errors.phone}
                  margin="normal"
                  placeholder="+201000000000"
                />

                {/* Role */}
                <FormControl fullWidth margin="normal" error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    label="Role"
                  >
                    <MenuItem value="customer">🌾 Breeder / Farm Owner</MenuItem>
                    <MenuItem value="doctor">🩺 Veterinarian</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>

                {/* Country */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    label="Country"
                  >
                    {countries.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Governorate */}
                {governorates.length > 0 && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Governorate</InputLabel>
                    <Select
                      value={selectedGovernorate}
                      onChange={(e) => setSelectedGovernorate(e.target.value)}
                      label="Governorate"
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
                    <InputLabel>City</InputLabel>
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      label="City"
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
                    <InputLabel>Region</InputLabel>
                    <Select
                      name="region_id"
                      value={form.region_id}
                      onChange={handleChange}
                      label="Region"
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
                  fullWidth label="Password" name="password"
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
                  fullWidth label="Confirm Password" name="password_confirmation"
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                </Button>

              </Box>

              <Typography variant="body2" textAlign="center" mt={2}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                  Login
                </Link>
              </Typography>
            </>
          )}

          {step === 2 && (
            <>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Verify Your Email
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                We sent a verification code to <b>{form.email}</b>. Please check your inbox.
              </Alert>

              <Box component="form" onSubmit={handleVerifyOtp}>
                <TextField
                  fullWidth
                  label="Enter OTP Code"
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
                </Button>

                <Button
                  fullWidth variant="text"
                  onClick={handleResendOtp}
                  sx={{ mt: 1 }}
                >
                  Resend OTP
                </Button>

                <Button
                  fullWidth variant="text"
                  onClick={() => setStep(1)}
                  sx={{ mt: 0.5, color: 'text.secondary' }}
                >
                  ← Back to Register
                </Button>

              </Box>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}