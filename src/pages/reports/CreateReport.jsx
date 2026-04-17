import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Stepper,
  Step,
  StepLabel,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import { ArrowBackRounded, ArrowForwardRounded, SendRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const SEVERITY_VALUES = ['low', 'moderate', 'high', 'critical'];

export default function CreateReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animalCategories, setAnimalCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const [form, setForm] = useState({
    category_id: '',
    region_id: '',
    title: '',
    description: '',
    severity: 'moderate',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState({});

  const stepLabels = useMemo(
    () => [
      t('createReport.stepAnimal'),
      t('createReport.stepDetails'),
      t('createReport.stepLocation'),
      t('createReport.stepSend'),
    ],
    [t],
  );

  const severityOptions = useMemo(
    () =>
      SEVERITY_VALUES.map((value) => ({
        value,
        label: t(`createReport.severity.${value}`),
        hint: t(`createReport.severity.${value}Hint`),
      })),
    [t],
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/animals/categories');
        const data = res.data?.data ?? res.data ?? [];
        setAnimalCategories(Array.isArray(data) ? data : []);
      } catch {
        setAnimalCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get('/locations/countries');
        const data = res.data?.data ?? res.data ?? [];
        setCountries(Array.isArray(data) ? data : []);
      } catch {
        setCountries([{ id: 1, name: 'Egypt' }]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/locations/countries/${selectedCountry}/governorates`);
        const data = res.data?.data ?? res.data ?? [];
        setGovernorates(Array.isArray(data) ? data : []);
        setCities([]);
        setRegions([]);
        setSelectedGovernorate('');
        setSelectedCity('');
        setForm((f) => ({ ...f, region_id: '' }));
      } catch {
        setGovernorates([]);
      }
    };
    fetch();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedGovernorate) return;
    const fetch = async () => {
      setCitiesLoading(true);
      try {
        const res = await api.get(`/locations/governorates/${selectedGovernorate}/cities`);
        const data = res.data?.data ?? res.data ?? [];
        setCities(Array.isArray(data) ? data : []);
        setRegions([]);
        setSelectedCity('');
        setForm((f) => ({ ...f, region_id: '' }));
      } catch {
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };
    fetch();
  }, [selectedGovernorate]);

  useEffect(() => {
    if (!selectedCity) return;
    const fetch = async () => {
      setRegionsLoading(true);
      try {
        const res = await api.get(`/locations/cities/${selectedCity}/regions`);
        const data = res.data?.data ?? res.data ?? [];
        setRegions(Array.isArray(data) ? data : []);
        setForm((f) => ({ ...f, region_id: '' }));
      } catch {
        setRegions([]);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetch();
  }, [selectedCity]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep = useCallback(
    (step) => {
      const err = {};
      if (step === 0) {
        if (!form.category_id) err.category_id = t('createReport.validation.pickCategory');
        if (!form.severity) err.severity = t('createReport.validation.severity');
      }
      if (step === 1) {
        if (!form.title?.trim()) err.title = t('createReport.validation.headline');
        if (!form.description?.trim()) err.description = t('createReport.validation.describe');
        if (form.description?.length < 20) err.description = t('createReport.validation.describeLength');
      }
      if (step === 2) {
        const locationLoading =
          (Boolean(selectedGovernorate) && citiesLoading) || (Boolean(selectedCity) && regionsLoading);
        if (governorates.length > 0 && !selectedGovernorate) {
          err.region_id = t('createReport.validation.pickGovernorate');
        } else if (selectedGovernorate && !citiesLoading && cities.length === 0) {
          err.region_id = t('createReport.validation.noCities');
        } else if (cities.length > 0 && !selectedCity) {
          err.region_id = t('createReport.validation.pickCity');
        } else if (selectedCity && !regionsLoading && regions.length === 0) {
          err.region_id = t('createReport.validation.noRegions');
        } else if (regions.length > 0 && !form.region_id) {
          err.region_id = t('createReport.validation.region');
        } else if (!form.region_id && !locationLoading) {
          err.region_id = t('createReport.validation.region');
        }
      }
      if (step === 3) {
        if (form.latitude?.trim()) {
          const n = Number(form.latitude);
          if (!Number.isFinite(n)) err.latitude = t('createReport.validation.latitudeInvalid');
        }
        if (form.longitude?.trim()) {
          const n = Number(form.longitude);
          if (!Number.isFinite(n)) err.longitude = t('createReport.validation.longitudeInvalid');
        }
      }
      return err;
    },
    [
      form,
      t,
      governorates.length,
      selectedGovernorate,
      selectedCity,
      citiesLoading,
      regionsLoading,
      cities.length,
      regions.length,
    ],
  );

  const locationChainLoading =
    (Boolean(selectedGovernorate) && citiesLoading) || (Boolean(selectedCity) && regionsLoading);

  const handleNext = () => {
    const err = validateStep(activeStep);
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setErrors({});
    setActiveStep((s) => Math.min(s + 1, stepLabels.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    const e0 = validateStep(0);
    const e1 = validateStep(1);
    const e2 = validateStep(2);
    const e3 = validateStep(3);
    const err = { ...e0, ...e1, ...e2, ...e3 };
    if (Object.keys(err).length) {
      setErrors(err);
      if (Object.keys(e0).length) setActiveStep(0);
      else if (Object.keys(e1).length) setActiveStep(1);
      else if (Object.keys(e2).length) setActiveStep(2);
      else setActiveStep(3);
      return;
    }
    setLoading(true);
    try {
      await api.post('/reports', {
        category_id: Number(form.category_id),
        region_id: Number(form.region_id),
        title: form.title,
        description: form.description,
        severity: form.severity,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      toast.success(t('createReport.success'));
      navigate('/app/reports');
    } catch (e) {
      const data = e.response?.data;
      let msg = typeof data?.message === 'string' ? data.message : '';
      if (!msg && data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        const raw = firstKey ? data.errors[firstKey] : null;
        const piece = Array.isArray(raw) ? raw[0] : raw;
        if (typeof piece === 'string') msg = piece;
      }
      toast.error(msg || t('createReport.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', pb: 4 }}>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate('/app/reports')}
        sx={{ mb: 2, fontWeight: 700, color: 'text.secondary' }}
      >
        {t('createReport.back')}
      </Button>

      <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', mb: 0.5 }}>
        {t('createReport.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('createReport.subtitle')}
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3, '& .MuiStepLabel-label': { fontSize: 12 } }}>
        {stepLabels.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {activeStep === 0 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle1" fontWeight={800}>
                {t('createReport.whichAnimal')}
              </Typography>
              <TextField
                select
                label={t('createReport.animalCategory')}
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                error={!!errors.category_id}
                disabled={animalCategories.length === 0}
                helperText={
                  errors.category_id ||
                  (animalCategories.length === 0 ? t('createReport.noCategoriesLoaded') : undefined)
                }
              >
                <MenuItem value="">
                  <em>{t('createReport.pickCategory')}</em>
                </MenuItem>
                {animalCategories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {t('createReport.howUrgent')}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  value={form.severity}
                  onChange={(_, v) => v && setForm({ ...form, severity: v })}
                  sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButton-root': { borderRadius: 3, py: 1.2, flex: '1 1 45%' } }}
                >
                  {severityOptions.map((o) => (
                    <ToggleButton key={o.value} value={o.value}>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" fontWeight={800}>
                          {o.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {o.hint}
                        </Typography>
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle1" fontWeight={800}>
                {t('createReport.detailsHeadline')}
              </Typography>
              <TextField
                fullWidth
                label={t('createReport.shortHeadline')}
                name="title"
                placeholder={t('createReport.headlinePlaceholder')}
                value={form.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                fullWidth
                label={t('createReport.tellMore')}
                name="description"
                value={form.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || t('createReport.describeHelper')}
                multiline
                minRows={4}
              />
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={800}>
                {t('createReport.locationTitleShort')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('createReport.locationHintShort')}
              </Typography>
              {errors.region_id && (
                <Alert severity="error" onClose={() => setErrors((e) => ({ ...e, region_id: '' }))}>
                  {errors.region_id}
                </Alert>
              )}
              {locationChainLoading && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2">{t('createReport.locationLoadingPlaces')}</Typography>
                </Stack>
              )}
              <TextField
                select
                label={t('auth.country')}
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {countries.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              {governorates.length > 0 && (
                <TextField
                  select
                  label={t('auth.governorate')}
                  value={selectedGovernorate}
                  onChange={(e) => setSelectedGovernorate(e.target.value)}
                >
                  {governorates.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {cities.length > 0 && (
                <TextField select label={t('auth.city')} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  {cities.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {regions.length > 0 && (
                <TextField
                  select
                  label={t('createReport.areaVillage')}
                  name="region_id"
                  value={form.region_id}
                  onChange={handleChange}
                  error={!!errors.region_id}
                  helperText={errors.region_id}
                >
                  {regions.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          )}

          {activeStep === 3 && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={800}>
                {t('createReport.sendAlmostDone')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('createReport.coordsHintShort')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label={t('createReport.latitude')}
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder={t('createReport.latPlaceholder')}
                  error={!!errors.latitude}
                  helperText={errors.latitude}
                />
                <TextField
                  fullWidth
                  label={t('createReport.longitude')}
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder={t('createReport.lngPlaceholder')}
                  error={!!errors.longitude}
                  helperText={errors.longitude}
                />
              </Stack>
              <Card variant="outlined" sx={{ bgcolor: 'background.default', borderStyle: 'dashed' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {t('createReport.recap')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                    {form.title || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {form.description?.slice(0, 120)}
                    {(form.description?.length ?? 0) > 120 ? '…' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          )}

          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {activeStep > 0 && (
              <Button fullWidth variant="outlined" onClick={handleBack} sx={{ py: 1.2, fontWeight: 700 }}>
                {t('createReport.backBtn')}
              </Button>
            )}
            {activeStep < stepLabels.length - 1 && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 2 && locationChainLoading}
                endIcon={<ArrowForwardRounded />}
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                {t('createReport.next')}
              </Button>
            )}
            {activeStep === stepLabels.length - 1 && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendRounded />}
                sx={{ py: 1.2, fontWeight: 800 }}
              >
                {loading ? t('createReport.sending') : t('createReport.submitAlt')}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
