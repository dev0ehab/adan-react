import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Skeleton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AddRounded, SearchRounded, PetsRounded, DeleteOutlineRounded, VaccinesRounded, RefreshRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';

const categoryColor = (cat) => {
  const map = {
    Cow: '#4a7c59',
    Dog: '#8d6e63',
    Sheep: '#c9a227',
    Chicken: '#c45c52',
    Horse: '#5c4d7d',
  };
  return map[cat] || '#4a7c59';
};

function healthSummary(animal, t) {
  if (animal.health_status) return { label: animal.health_status, tone: 'default' };
  if (animal.notes?.toLowerCase?.().includes('sick')) return { label: t('animals.needsCare'), tone: 'warning' };
  return { label: t('animals.looksStable'), tone: 'success' };
}

function vaccineSummary(animal, t) {
  if (!animal.last_vaccine_date) return { label: t('animals.noShot'), tone: 'warning' };
  return { label: t('animals.lastShot', { date: animal.last_vaccine_date }), tone: 'success' };
}

export default function AnimalsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-animals');
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : [];
      setAnimals(list);
      setFiltered(list);
      console.log('RAW animals from server:', list);
    } catch {
      toast.error(t('toasts.animalsLoadFailed'));
    } finally {
      setLoading(false);
    }
    
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    const result = animals.filter(
      (a) =>
        a.nickname?.toLowerCase().includes(search.toLowerCase()) ||
        a.animal?.name?.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(result);
  }, [search, animals]);

  const handleDelete = async () => {
    try {
      await api.delete(`/my-animals/${deleteId}`);
      const updated = animals.filter((a) => a.id !== deleteId);
      setAnimals(updated);
      setFiltered(updated);
      toast.success(t('toasts.animalRemoved'));
    } catch {
      toast.error(t('toasts.animalRemoveFailed'));
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={52} />
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('animals.title')}
        subtitle={t('animals.subtitle')}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={fetchAnimals}
              disabled={loading}
              sx={{ fontWeight: 700, borderRadius: 999, px: 2.5 }}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => navigate('/app/animals/create')}
              sx={{ fontWeight: 800, borderRadius: 999, px: 2.5 }}
            >
              {t('animals.addAnimal')}
            </Button>
          </>
        }
      />

      <TextField
        placeholder={t('animals.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Stack spacing={1.5}>
        {filtered.map((animal) => {
          const categoryName = animal.animal?.name ?? animal.category ?? '';
          const color = categoryColor(categoryName);
          const health = healthSummary(animal, t);
          const vac = vaccineSummary(animal, t);
          return (
            <Card key={animal.id}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: `${color}22`, color, width: 52, height: 52 }}>
                    <PetsRounded />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                        {animal.nickname}
                      </Typography>
                      <Stack direction="row">
                        <Tooltip title={t('animals.removeTooltip')}>
                          <IconButton size="small" color="error" onClick={() => setDeleteId(animal.id)}>
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    <Chip
                      label={categoryName || t('animals.fallbackCategory')}
                      size="small"
                      sx={{ mt: 1, fontWeight: 800, bgcolor: `${color}18`, color }}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                      <Chip
                        label={t('animals.healthChip', { label: health.label })}
                        variant="outlined"
                        color={health.tone === 'warning' ? 'warning' : health.tone === 'success' ? 'success' : 'default'}
                        sx={{ fontWeight: 700, justifyContent: 'flex-start' }}
                      />
                      <Chip
                        label={vac.label}
                        variant="outlined"
                        color={vac.tone === 'warning' ? 'warning' : 'success'}
                        sx={{ fontWeight: 700, justifyContent: 'flex-start' }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                      {animal.birth_date ? t('animals.born', { date: animal.birth_date }) : t('animals.bornUnknown')}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VaccinesRounded />}
                      sx={{ mt: 2, fontWeight: 700, borderRadius: 999 }}
                      onClick={() => navigate(`/app/vaccines?animal/${animal.id}`)}
                    >
                      {t('animals.vaccinationPlan')}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <PetsRounded sx={{ fontSize: 52, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('animals.emptySearch')}
              </Typography>
              <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate('/app/animals/create')}>
                {t('animals.addAnimal')}
              </Button>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('animals.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('animals.dialogBody')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button fullWidth variant="contained" color="error" onClick={handleDelete} sx={{ fontWeight: 800 }}>
            {t('animals.removeTooltip')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
