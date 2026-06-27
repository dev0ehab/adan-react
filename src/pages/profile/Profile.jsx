import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, Typography, Avatar,
  Button, TextField, Divider, CircularProgress,
  Chip, FormControl, InputLabel, Select, MenuItem, FormHelperText,
} from '@mui/material';
import {
  Edit, Save, Person,
  Email, Phone, LocationOn, Badge
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import useLocationCascade from '../../hooks/useLocationCascade';
import api from '../../api/axios';

function formatLocationLabel(region) {
  if (!region?.name) return null;
  const parts = [region.name, region.city, region.governorate, region.country].filter(Boolean);
  return parts.join(', ');
}

export default function Profile() {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name:  '',
    email: '',
    phone: '',
  });

  const {
    countries,
    governorates,
    cities,
    regions,
    selectedCountry,
    selectedGovernorate,
    selectedCity,
    regionId,
    setSelectedCountry,
    setSelectedGovernorate,
    setSelectedCity,
    setRegionId,
    governoratesLoading,
    citiesLoading,
    regionsLoading,
    locationLoading,
    hydrateFromRegion,
  } = useLocationCascade();

  const applyProfile = async (data) => {
    setProfileData(data);
    setForm({
      name:  data?.name  ?? '',
      email: data?.email ?? '',
      phone: data?.phone ?? '',
    });
    await hydrateFromRegion(data?.region);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data?.data ?? res.data;
        await applyProfile(data);
      } catch {
        toast.error(t('toasts.profileLoadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [t]);

  const validate = () => {
    const next = {};
    if (!form.name?.trim()) next.name = t('auth.validation.nameRequired');
    if (!form.email?.trim()) next.email = t('auth.validation.emailRequired');
    if (!form.phone?.trim()) next.phone = t('auth.validation.phoneRequired');
    if (!selectedCountry) next.country = t('auth.validation.countryRequired');
    else if (!selectedGovernorate) next.governorate = t('createReport.validation.pickGovernorate');
    else if (cities.length > 0 && !selectedCity) next.city = t('createReport.validation.pickCity');
    else if (regions.length > 0 && !regionId) next.region_id = t('createReport.validation.region');
    return next;
  };

  const handleCancel = async () => {
    setForm({
      name:  profileData?.name  ?? '',
      email: profileData?.email ?? '',
      phone: profileData?.phone ?? '',
    });
    await hydrateFromRegion(profileData?.region);
    setErrors({});
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        region_id: Number(regionId),
      };
      const res = await api.put('/auth/profile', payload);
      const data = res.data?.data ?? res.data?.user ?? res.data;
      const merged = { ...profileData, ...(typeof data === 'object' && data !== null ? data : {}), ...payload };
      await applyProfile(merged);
      updateUser({
        name: merged.name,
        email: merged.email,
        phone: merged.phone,
        avatar: merged.avatar ?? merged.profile_photo_url,
        profile_photo_url: merged.profile_photo_url ?? merged.avatar,
      });
      setEditMode(false);
      toast.success(t('toasts.profileUpdated'));
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
      }
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : t('toasts.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const clearFieldError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const helper = (field) => {
    const value = errors[field];
    return Array.isArray(value) ? value[0] : value;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const locationLabel = formatLocationLabel(profileData?.region) ?? t('profile.na');

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t('profile.title')}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>

        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>

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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {locationLabel}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.memberSince', {
                      date: profileData?.created_at?.slice(0, 10) ?? t('profile.na'),
                    })}
                  </Typography>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Box>

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
                    onClick={handleEdit}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('profile.edit')}
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={saving}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving || locationLoading}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('common.save')}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label={t('profile.fullName')}
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    clearFieldError('name');
                  }}
                  disabled={!editMode}
                  error={!!errors.name}
                  helperText={helper('name')}
                  InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    clearFieldError('email');
                  }}
                  disabled={!editMode}
                  error={!!errors.email}
                  helperText={helper('email')}
                  InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                <TextField
                  fullWidth
                  label={t('profile.phone')}
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    clearFieldError('phone');
                  }}
                  disabled={!editMode}
                  error={!!errors.phone}
                  helperText={helper('phone')}
                  InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />

                <Divider sx={{ my: 0.5 }} />

                <Typography variant="subtitle2" fontWeight={700}>
                  {t('profile.location')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('createReport.locationHintShort')}
                </Typography>

                <FormControl fullWidth error={!!errors.country} disabled={!editMode}>
                  <InputLabel>{t('auth.country')}</InputLabel>
                  <Select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      clearFieldError('country');
                      clearFieldError('governorate');
                      clearFieldError('city');
                      clearFieldError('region_id');
                    }}
                    label={t('auth.country')}
                  >
                    {countries.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.country && <FormHelperText>{helper('country')}</FormHelperText>}
                </FormControl>

                {selectedCountry && (
                  <FormControl fullWidth error={!!errors.governorate} disabled={!editMode || governoratesLoading}>
                    <InputLabel>{t('auth.governorate')}</InputLabel>
                    <Select
                      value={selectedGovernorate}
                      onChange={(e) => {
                        setSelectedGovernorate(e.target.value);
                        clearFieldError('governorate');
                        clearFieldError('city');
                        clearFieldError('region_id');
                      }}
                      label={t('auth.governorate')}
                    >
                      {governorates.map((g) => (
                        <MenuItem key={g.id} value={String(g.id)}>{g.name}</MenuItem>
                      ))}
                    </Select>
                    {governoratesLoading && (
                      <FormHelperText>{t('createReport.locationLoadingPlaces')}</FormHelperText>
                    )}
                    {!governoratesLoading && governorates.length === 0 && (
                      <FormHelperText>{t('createReport.validation.noGovernorates')}</FormHelperText>
                    )}
                    {errors.governorate && <FormHelperText>{helper('governorate')}</FormHelperText>}
                  </FormControl>
                )}

                {selectedGovernorate && (
                  <FormControl fullWidth error={!!errors.city} disabled={!editMode || citiesLoading}>
                    <InputLabel>{t('auth.city')}</InputLabel>
                    <Select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        clearFieldError('city');
                        clearFieldError('region_id');
                      }}
                      label={t('auth.city')}
                    >
                      {cities.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                      ))}
                    </Select>
                    {citiesLoading && (
                      <FormHelperText>{t('createReport.locationLoadingPlaces')}</FormHelperText>
                    )}
                    {!citiesLoading && cities.length === 0 && (
                      <FormHelperText>{t('createReport.validation.noCities')}</FormHelperText>
                    )}
                    {errors.city && <FormHelperText>{helper('city')}</FormHelperText>}
                  </FormControl>
                )}

                {selectedCity && (
                  <FormControl fullWidth error={!!errors.region_id} disabled={!editMode || regionsLoading}>
                    <InputLabel>{t('auth.region')}</InputLabel>
                    <Select
                      value={regionId}
                      onChange={(e) => {
                        setRegionId(e.target.value);
                        clearFieldError('region_id');
                      }}
                      label={t('auth.region')}
                    >
                      {regions.map((r) => (
                        <MenuItem key={r.id} value={String(r.id)}>{r.name}</MenuItem>
                      ))}
                    </Select>
                    {regionsLoading && (
                      <FormHelperText>{t('createReport.locationLoadingPlaces')}</FormHelperText>
                    )}
                    {!regionsLoading && regions.length === 0 && (
                      <FormHelperText>{t('createReport.validation.noRegions')}</FormHelperText>
                    )}
                    {errors.region_id && <FormHelperText>{helper('region_id')}</FormHelperText>}
                  </FormControl>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
