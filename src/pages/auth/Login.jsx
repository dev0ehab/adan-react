import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Pets } from '@mui/icons-material';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';

export default function Login() {
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
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

/* const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  setLoading(true);

  setTimeout(() => {
    login('mock-token-123', {
      name: 'Test User',
      role: 'doctor',
      email: form.email,
    });
    toast.success('Welcome back!');
    navigate('/dashboard');
    setLoading(false);
  }, 800);
}; */

/*
email: customer@adan.com
password: password
npm run dev
*/

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  setLoading(true);
  try {
    const res = await api.post('/auth/login', form);
    login(res.data.token, res.data.user);
    toast.success('Welcome back!');
    navigate('/');
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f0f4f8',
    }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>

          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Pets sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              ADAN
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Animal Disease Alert Network
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="bold" mb={2}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
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
              label="Password"
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
              sx={{ mt: 2, borderRadius: 2, py: 1.3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', fontWeight: 'bold' }}>
              Register
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
}