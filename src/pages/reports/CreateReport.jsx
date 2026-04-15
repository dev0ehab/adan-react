import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, MenuItem
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [animals, setAnimals]   = useState([]);
  const [regions, setRegions]   = useState([]);
  const [countries, setCountries]       = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities]             = useState([]);

  const [selectedCountry, setSelectedCountry]         = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity]               = useState('');

  const [form, setForm] = useState({
    animal_id:   '',
    region_id:   '',
    title:       '',
    description: '',
    severity:    'moderate',
    latitude:    '',
    longitude:   '',
  });
  const [errors, setErrors] = useState({});

  // fetch Animals
 useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res  = await api.get('/my-animals');
        const data = res.data?.data ?? res.data ?? [];
        setAnimals(Array.isArray(data) ? data : []);
      } catch {
        setAnimals([]);
      }
    };
    fetchAnimals();
  }, []);

  // fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res  = await api.get('/locations/countries');
        const data = res.data?.data ?? res.data ?? [];
        setCountries(Array.isArray(data) ? data : []);
      } catch {
        setCountries([{ id: 1, name: 'Egypt' }]);
      }
    };
    fetchCountries();
  }, []);

  //get Governorates
  useEffect(() => {
    if (!selectedCountry) return;
    const fetch = async () => {
      try {
        const res  = await api.get(`/locations/countries/${selectedCountry}/governorates`);
        const data = res.data?.data ?? res.data ?? [];
        setGovernorates(Array.isArray(data) ? data : []);
        setCities([]);
        setRegions([]);
        setSelectedGovernorate('');
        setSelectedCity('');
        setForm(f => ({ ...f, region_id: '' }));
      } catch { setGovernorates([]); }
    };
    fetch();
  }, [selectedCountry]);

  // get Cities
  useEffect(() => {
    if (!selectedGovernorate) return;
    const fetch = async () => {
      try {
        const res  = await api.get(`/locations/governorates/${selectedGovernorate}/cities`);
        const data = res.data?.data ?? res.data ?? [];
        setCities(Array.isArray(data) ? data : []);
        setRegions([]);
        setSelectedCity('');
        setForm(f => ({ ...f, region_id: '' }));
      } catch { setCities([]); }
    };
    fetch();
  }, [selectedGovernorate]);

  // get Regions
  useEffect(() => {
    if (!selectedCity) return;
    const fetch = async () => {
      try {
        const res  = await api.get(`/locations/cities/${selectedCity}/regions`);
        const data = res.data?.data ?? res.data ?? [];
        setRegions(Array.isArray(data) ? data : []);
        setForm(f => ({ ...f, region_id: '' }));
      } catch { setRegions([]); }
    };
    fetch();
  }, [selectedCity]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.title)                    err.title       = 'Title is required';
    if (!form.description)              err.description = 'Description is required';
    if (form.description?.length < 20)  err.description = 'Min 20 characters required';
    if (!form.region_id)                err.region_id   = 'Region is required';
    if (!form.animal_id)                err.animal_id   = 'Animal is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setLoading(true);
    try {
      await api.post('/reports', {
        animal_id:   Number(form.animal_id),
        region_id:   Number(form.region_id),
        title:       form.title,
        description: form.description,
        severity:    form.severity,
        latitude:    form.latitude  ? Number(form.latitude)  : null,
        longitude:   form.longitude ? Number(form.longitude) : null,
      });
      toast.success('Report submitted successfully!');
      navigate('/app/reports');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to submit report';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/app/reports')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight="bold">
          New Disease Report
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2, maxWidth: 700 }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Title */}
            <TextField
              fullWidth label="Report Title" name="title"
              value={form.title} onChange={handleChange}
              error={!!errors.title} helperText={errors.title}
            />

            {/* Description */}
            <TextField
              fullWidth label="Description" name="description"
              value={form.description} onChange={handleChange}
              error={!!errors.description} helperText={errors.description}
              multiline rows={4}
            />

            {/* Animal */}
            <TextField
              fullWidth select label="Animal" name="animal_id"
              value={form.animal_id} onChange={handleChange}
              error={!!errors.animal_id} helperText={errors.animal_id}
            >
              {animals.length === 0 && (
                <MenuItem disabled>No animals found — add one first</MenuItem>
              )}
              {animals.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nickname} ({a.animal?.name ?? ''})
                </MenuItem>
              ))}
            </TextField>

            {/* Severity */}
            <TextField
              fullWidth select label="Severity" name="severity"
              value={form.severity} onChange={handleChange}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>

            {/* Country */}
            <TextField
              fullWidth select label="Country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {countries.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>

            {/* Governorate */}
            {governorates.length > 0 && (
              <TextField
                fullWidth select label="Governorate"
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
              >
                {governorates.map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </TextField>
            )}

            {/* City */}
            {cities.length > 0 && (
              <TextField
                fullWidth select label="City"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            )}

            {/* Region */}
            {regions.length > 0 && (
              <TextField
                fullWidth select label="Region" name="region_id"
                value={form.region_id} onChange={handleChange}
                error={!!errors.region_id} helperText={errors.region_id}
              >
                {regions.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            )}

            {/* Coordinates */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth label="Latitude" name="latitude"
                value={form.latitude} onChange={handleChange}
                placeholder="e.g. 30.0444"
              />
              <TextField
                fullWidth label="Longitude" name="longitude"
                value={form.longitude} onChange={handleChange}
                placeholder="e.g. 31.2357"
              />
            </Box>

            <Button
              fullWidth type="submit" variant="contained"
              size="large" disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
              sx={{ borderRadius: 2, py: 1.3 }}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}