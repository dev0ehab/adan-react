import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  VaccinesRounded,
  AddRounded,
  CloseRounded,
  PetsRounded,
  MedicationRounded,
  CheckCircleRounded,
  HourglassEmptyRounded,
  DeleteOutlineRounded,
  RefreshRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';

const statusStyles = (status, t) => {
  if (status === 'done') return { label: t('vaccines.done'), bg: 'rgba(61, 139, 99, 0.12)', fg: '#2d6a4f' };
  if (status === 'pending') return { label: t('vaccines.upcomingLabel'), bg: 'rgba(212, 160, 23, 0.15)', fg: '#8a6d12' };
  if (status === 'overdue') return { label: t('vaccines.needsAction'), bg: 'rgba(196, 92, 82, 0.12)', fg: '#a34740' };
  return { label: status ?? t('vaccines.scheduled'), bg: 'action.hover', fg: 'text.secondary' };
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return dateStr;
  }
};

const animalColor = (animalName) => {
  const name = (animalName ?? '').toLowerCase();
  if (name.includes('dog')) return '#8d6e63';
  if (name.includes('cat')) return '#d97b5c';
  if (name.includes('bird')) return '#4a90a4';
  if (name.includes('horse')) return '#7d6b5c';
  if (name.includes('cow')) return '#4a7c59';
  if (name.includes('sheep')) return '#7a8f7e';
  return '#4a7c59';
};

function ScheduleCard({ row, onDone, onDelete }) {
  const { t } = useTranslation();
  const animalNickname = row.user_animal?.nickname ?? '—';
  const animalType = row.user_animal?.animal?.name ?? '';
  const vaccineName = row.vaccine?.name ?? t('vaccines.fallbackVaccine');
  const st = statusStyles(row.status, t);
  const lineColor = animalColor(animalType);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 4,
              alignSelf: 'stretch',
              borderRadius: 4,
              bgcolor: lineColor,
              flexShrink: 0,
            }}
          />
          <Avatar sx={{ bgcolor: `${lineColor}22`, color: lineColor, width: 48, height: 48 }}>
            <PetsRounded />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
              {animalType || t('vaccines.fallbackAnimal')}
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem' }}>
              {animalNickname}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <MedicationRounded sx={{ fontSize: 18, color: 'secondary.dark' }} />
              <Typography variant="body2" fontWeight={600}>
                {vaccineName}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                label={t('vaccines.planned', { date: formatDate(row.scheduled_date) })}
                sx={{ fontWeight: 700, bgcolor: 'background.default' }}
              />
              {row.status === 'done' && (
                <Chip
                  size="small"
                  label={t('vaccines.given', { date: formatDate(row.taken_at) })}
                  sx={{ fontWeight: 700, bgcolor: 'rgba(61, 139, 99, 0.1)' }}
                />
              )}
              <Chip
                size="small"
                label={st.label}
                sx={{ fontWeight: 800, bgcolor: st.bg, color: st.fg, border: 'none' }}
              />
            </Stack>
          </Box>
          <Stack spacing={0.5}>
            {row.status !== 'done' ? (
              <Tooltip title={t('vaccines.markDone')}>
                <IconButton
                  onClick={() => onDone(row.id)}
                  sx={{ bgcolor: 'rgba(212, 160, 23, 0.12)', color: 'warning.dark' }}
                >
                  <HourglassEmptyRounded />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton disabled sx={{ bgcolor: 'rgba(61, 139, 99, 0.12)', color: 'success.main' }}>
                <CheckCircleRounded />
              </IconButton>
            )}
            <Tooltip title={t('vaccines.remove')}>
              <IconButton onClick={() => onDelete(row.id)} sx={{ bgcolor: 'rgba(196, 92, 82, 0.08)', color: 'error.main' }}>
                <DeleteOutlineRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function VaccineSchedule() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [myAnimals, setMyAnimals] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    user_animal_id: '',
    vaccine_id: '',
    scheduled_date: '',
  });
  const [errors, setErrors] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schedulesRes, animalsRes] = await Promise.all([api.get('/vaccine-schedules'), api.get('/my-animals')]);
      const raw = schedulesRes.data?.data ?? [];
      const unique = Array.from(new Map(raw.map((item) => [item.id, item])).values());
      setSchedules(unique);
      const animals = animalsRes.data?.data ?? animalsRes.data ?? [];
      setMyAnimals(Array.isArray(animals) ? animals : []);
    } catch {
      toast.error(t('vaccines.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!form.user_animal_id) {
      setVaccines([]);
      return;
    }
    const fetchVaccines = async () => {
      setVaccinesLoading(true);
      try {
        const res = await api.get(`/my-animals/${form.user_animal_id}`);
        const animal = res.data?.data ?? res.data;
        const vacList = animal?.vaccines ?? animal?.animal?.vaccines ?? animal?.available_vaccines ?? [];
        if (vacList.length > 0) {
          setVaccines(vacList);
        } else {
          const animalTypeId = animal?.animal_id ?? animal?.animal?.id;
          if (animalTypeId) {
            const vacRes = await api.get(`/vaccines`, { params: { animal_id: animalTypeId } });
            const vList = vacRes.data?.data ?? vacRes.data ?? [];
            setVaccines(Array.isArray(vList) ? vList : []);
          } else {
            setVaccines([]);
          }
        }
      } catch {
        setVaccines([]);
      } finally {
        setVaccinesLoading(false);
      }
    };
    fetchVaccines();
  }, [form.user_animal_id]);

  const handleMarkDone = async (id) => {
    try {
      await api.patch(`/vaccine-schedules/${id}/mark-done`);
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'done', taken_at: new Date().toISOString() } : s)),
      );
      toast.success(t('vaccines.markedDone'));
    } catch {
      toast.error(t('vaccines.updateFailed'));
    }
  };

  const handleDelete = () => {
    setSchedules((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
    toast.success(t('vaccines.removed'));
  };

  const validate = () => {
    const err = {};
    if (!form.user_animal_id) err.user_animal_id = t('vaccines.validationPickAnimal');
    if (!form.vaccine_id) err.vaccine_id = t('vaccines.validationPickVaccine');
    if (!form.scheduled_date) err.scheduled_date = t('vaccines.validationDate');
    return err;
  };

  const handleAddSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    try {
      const res = await api.post('/vaccine-schedules', form);
      const newSchedule = res.data?.data ?? res.data;
      setSchedules((prev) => {
        if (prev.find((s) => s.id === newSchedule.id)) return prev;
        return [...prev, newSchedule];
      });
      toast.success(t('vaccines.scheduledToast'));
      setOpenAdd(false);
      setForm({ user_animal_id: '', vaccine_id: '', scheduled_date: '' });
      setErrors({});
      setVaccines([]);
      fetchAll();
    } catch {
      toast.error(t('vaccines.saveFailed'));
    }
  };

  const upcoming = schedules.filter((s) => s.status !== 'done').sort((a, b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date)));
  const completed = schedules.filter((s) => s.status === 'done').sort((a, b) => String(b.taken_at || b.scheduled_date).localeCompare(String(a.taken_at || a.scheduled_date)));

  if (loading) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 560, mx: 'auto' }}>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={120} />
      </Stack>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      <PageHeader
        title={t('vaccines.title')}
        subtitle={t('vaccines.subtitle')}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={fetchAll}
              sx={{ fontWeight: 700, borderRadius: 999, px: 2.5 }}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpenAdd(true)}
              sx={{ fontWeight: 800, borderRadius: 999, px: 2.5 }}
            >
              {t('vaccines.planVaccine')}
            </Button>
          </>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
        {[
          { n: completed.length, labelKey: 'vaccines.completed', c: '#2d6a4f', b: 'rgba(61, 139, 99, 0.12)' },
          { n: upcoming.filter((s) => s.status === 'pending').length, labelKey: 'vaccines.upcoming', c: '#8a6d12', b: 'rgba(212, 160, 23, 0.15)' },
          { n: upcoming.filter((s) => s.status === 'overdue').length, labelKey: 'vaccines.needsAction', c: '#a34740', b: 'rgba(196, 92, 82, 0.12)' },
        ].map((x) => (
          <Card key={x.labelKey} sx={{ flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <Avatar sx={{ bgcolor: x.b, color: x.c, width: 44, height: 44 }}>
                <VaccinesRounded />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary.dark">
                  {x.n}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t(x.labelKey)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
        {t('vaccines.comingUp')}
      </Typography>
      {upcoming.length === 0 ? (
        <Card sx={{ mb: 4, borderStyle: 'dashed' }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <VaccinesRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t('vaccines.emptyCalendar')}
            </Typography>
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpenAdd(true)}>
              {t('vaccines.planVaccine')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {upcoming.map((s) => (
            <ScheduleCard key={s.id} row={s} onDone={handleMarkDone} onDelete={setDeleteId} />
          ))}
        </Stack>
      )}

      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
        {t('vaccines.completedSection')}
      </Typography>
      {completed.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('vaccines.finishedDoses')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {completed.map((s) => (
            <ScheduleCard key={s.id} row={s} onDone={handleMarkDone} onDelete={setDeleteId} />
          ))}
        </Stack>
      )}

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
          {t('vaccines.dialogTitle')}
          <IconButton onClick={() => setOpenAdd(false)} aria-label={t('vaccines.close')}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              select
              label={t('vaccines.animal')}
              value={form.user_animal_id}
              onChange={(e) => setForm({ ...form, user_animal_id: e.target.value, vaccine_id: '' })}
              error={!!errors.user_animal_id}
              helperText={errors.user_animal_id}
            >
              {myAnimals.length === 0 && <MenuItem disabled>{t('createReport.noAnimalsYet')}</MenuItem>}
              {myAnimals.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nickname} — {a.animal?.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t('vaccines.vaccine')}
              value={form.vaccine_id}
              onChange={(e) => setForm({ ...form, vaccine_id: e.target.value })}
              error={!!errors.vaccine_id}
              helperText={
                errors.vaccine_id ||
                (!form.user_animal_id
                  ? t('vaccines.helperChooseAnimal')
                  : vaccinesLoading
                    ? t('vaccines.helperLoadingVaccines')
                    : vaccines.length === 0
                      ? t('vaccines.helperNoVaccines')
                      : '')
              }
              disabled={!form.user_animal_id || vaccinesLoading}
            >
              {vaccinesLoading && <MenuItem disabled>{t('vaccines.helperLoadingVaccines')}</MenuItem>}
              {!vaccinesLoading && vaccines.length === 0 && <MenuItem disabled>{t('vaccines.noneAvailable')}</MenuItem>}
              {vaccines.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name ?? t('vaccines.vaccineHash', { id: v.id })}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label={t('vaccines.plannedDate')}
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              error={!!errors.scheduled_date}
              helperText={errors.scheduled_date}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setOpenAdd(false);
              setForm({ user_animal_id: '', vaccine_id: '', scheduled_date: '' });
              setErrors({});
              setVaccines([]);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button fullWidth variant="contained" onClick={handleAddSubmit} startIcon={<AddRounded />} sx={{ fontWeight: 800 }}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('vaccines.removePlanTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('vaccines.removePlanBody')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setDeleteId(null)}>
            {t('vaccines.keepIt')}
          </Button>
          <Button fullWidth variant="contained" color="error" onClick={handleDelete} sx={{ fontWeight: 800 }}>
            {t('vaccines.removeConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
