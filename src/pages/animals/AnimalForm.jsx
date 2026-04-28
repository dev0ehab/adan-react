import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, MenuItem, Avatar, Divider
} from '@mui/material';
import {
  ArrowBack, Save, Pets, CalendarToday,
  Notes, Category
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function AnimalForm() {
  const navigate  = useNavigate();

  const [loading, setLoading]       = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState({
    animal_id:         '',
    nickname:          '',
    birth_date:        '',
    last_vaccine_date: '',
    notes:             '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res  = await api.get('/animals/categories');
        const data = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.animal_id)  err.animal_id  = 'Animal type is required';
    if (!form.nickname)   err.nickname   = 'Nickname is required';
    if (!form.birth_date) err.birth_date = 'Birth date is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setLoading(true);
    try {
      await api.post('/my-animals', {
        animal_id:         Number(form.animal_id),
        nickname:          form.nickname,
        birth_date:        form.birth_date,
        last_vaccine_date: form.last_vaccine_date || null,
        notes:             form.notes             || null,
      });
      toast.success('Animal added successfully!');
      navigate('/app/animals');
    } catch (e) {
      const serverErrors = e.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
      else toast.error(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 0 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, maxWidth: 600, mx: 'auto' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/app/animals')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Add New Animal
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: 3, maxWidth: 600, mx: 'auto' }}>

        {/* Card Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          p: 3, borderRadius: '16px 16px 0 0',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <Pets sx={{ color: 'white', fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="white">
              New Animal
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Register a new animal to your profile
            </Typography>
          </Box>
        </Box> 

        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Animal Type - Nickname */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Category sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  ANIMAL INFO
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth select label="Animal Type" name="animal_id"
                  value={form.animal_id} onChange={handleChange}
                  error={!!errors.animal_id} helperText={errors.animal_id}
                >
                  {categories.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth label="Nickname" name="nickname"
                  value={form.nickname} onChange={handleChange}
                  error={!!errors.nickname} helperText={errors.nickname}
                  placeholder="e.g. Bella"
                />
              </Box>
            </Box>

            <Divider />

            {/* Dates */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  DATES
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth label="Birth Date" name="birth_date"
                  type="date" value={form.birth_date} onChange={handleChange}
                  error={!!errors.birth_date} helperText={errors.birth_date}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth label="Last Vaccine Date" name="last_vaccine_date"
                  type="date" value={form.last_vaccine_date} onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Notes */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Notes sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  NOTES
                </Typography>
              </Box>
              <TextField
                fullWidth label="Additional Notes" name="notes"
                value={form.notes} onChange={handleChange}
                multiline rows={3}
                placeholder="Any additional information about this animal..."
              />
            </Box>

            {/* Submit */}
            <Button
              fullWidth type="submit" variant="contained"
              size="large" disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
              sx={{
                borderRadius: 3, py: 1.5,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                fontSize: 16, fontWeight: 'bold',
              }}
            >
              {loading ? 'Saving...' : 'Add Animal'}
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}