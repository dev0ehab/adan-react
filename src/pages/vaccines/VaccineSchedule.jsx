import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Grid,
  Avatar, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton,
  Tooltip
} from '@mui/material';
import {
  Vaccines, Add, Close, Delete,
  Pets, Medication, CheckCircle, HourglassEmpty
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusColor = (status) => {
  if (status === 'done')    return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'overdue') return 'error';
  return 'default';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const animalColor = (animalName) => {
  const name = (animalName ?? '').toLowerCase();
  if (name.includes('dog'))   return '#795548';
  if (name.includes('cat'))   return '#FF7043';
  if (name.includes('bird'))  return '#29B6F6';
  if (name.includes('horse')) return '#8D6E63';
  if (name.includes('cow'))   return '#66BB6A';
  if (name.includes('sheep')) return '#BDBDBD';
  return '#1976d2';
};

export default function VaccineSchedule() {
  const [schedules, setSchedules]             = useState([]);
  const [myAnimals, setMyAnimals]             = useState([]);
  const [vaccines, setVaccines]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [openAdd, setOpenAdd]                 = useState(false);
  const [deleteId, setDeleteId]               = useState(null);
  const [form, setForm] = useState({
    user_animal_id: '',
    vaccine_id:     '',
    scheduled_date: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [schedulesRes, animalsRes] = await Promise.all([
          api.get('/vaccine-schedules'),
          api.get('/my-animals'),
        ]);

        const raw = schedulesRes.data?.data ?? [];
        const unique = Array.from(
          new Map(raw.map(item => [item.id, item])).values()
        );
        setSchedules(unique);

        const animals = animalsRes.data?.data ?? animalsRes.data ?? [];
        setMyAnimals(Array.isArray(animals) ? animals : []);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
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
        const res    = await api.get(`/my-animals/${form.user_animal_id}`);
        const animal = res.data?.data ?? res.data;

        const vacList =
          animal?.vaccines ??
          animal?.animal?.vaccines ??
          animal?.available_vaccines ??
          [];

        if (vacList.length > 0) {
          setVaccines(vacList);
        } else {
          const animalTypeId = animal?.animal_id ?? animal?.animal?.id;
          if (animalTypeId) {
            const vacRes = await api.get(`/vaccines`, {
              params: { animal_id: animalTypeId }
            });
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
      setSchedules(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, status: 'done', taken_at: new Date().toISOString() }
            : s
        )
      );
      toast.success('Marked as done!');
    } catch {
      toast.error('Failed to mark as done');
    }
  };

  const handleDelete = () => {
    setSchedules(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
    toast.success('Schedule removed!');
  };

  const validate = () => {
    const err = {};
    if (!form.user_animal_id) err.user_animal_id = 'Required';
    if (!form.vaccine_id)     err.vaccine_id     = 'Required';
    if (!form.scheduled_date) err.scheduled_date = 'Required';
    return err;
  };

  const handleAddSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    try {
      const res         = await api.post('/vaccine-schedules', form);
      const newSchedule = res.data?.data ?? res.data;

      setSchedules(prev => {
        if (prev.find(s => s.id === newSchedule.id)) return prev;
        return [...prev, newSchedule];
      });

      toast.success('Schedule added!');
      setOpenAdd(false);
      setForm({ user_animal_id: '', vaccine_id: '', scheduled_date: '' });
      setErrors({});
      setVaccines([]);
    } catch {
      toast.error('Failed to add schedule');
    }
  };

  const done    = schedules.filter(s => s.status === 'done').length;
  const pending = schedules.filter(s => s.status === 'pending').length;
  const overdue = schedules.filter(s => s.status === 'overdue').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Vaccine Schedule</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAdd(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Schedule
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { count: done,    label: 'Done',    bg: '#e8f5e9', color: '#2e7d32' },
          { count: pending, label: 'Pending', bg: '#fff8e1', color: '#ed6c02' },
          { count: overdue, label: 'Overdue', bg: '#ffebee', color: '#d32f2f' },
        ].map(({ count, label, bg, color }) => (
          <Grid item xs={4} key={label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{
                display: 'flex', alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                p: { xs: 1, sm: 2 },
                '&:last-child': { pb: { xs: 1, sm: 2 } }
              }}>
                <Avatar sx={{ bgcolor: bg, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                  <Vaccines sx={{ color, fontSize: { xs: 16, sm: 20 } }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color={color}>{count}</Typography>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><b>id</b></TableCell>
                  <TableCell><b>Animal</b></TableCell>
                  <TableCell><b>Vaccine</b></TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><b>Scheduled Date</b></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><b>Taken At</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((s, index) => {
                 
                  const animalNickname = s.user_animal?.nickname ?? '—';
                  const animalType     = s.user_animal?.animal?.name ?? '';
                  const vaccineName    = s.vaccine?.name ?? '—';

                  return (
                    <TableRow key={s.id} hover>
                      <TableCell>{index + 1}</TableCell>

                      {/* Animal Pets icon - nickname */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{
                            width: 30, height: 30,
                            bgcolor: `${animalColor(animalType)}22`,
                          }}>
                            <Pets sx={{ fontSize: 16, color: animalColor(animalType) }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {animalNickname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {animalType}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Vaccine name */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Medication sx={{ fontSize: 16, color: '#7b1fa2' }} />
                          <Typography variant="body2">{vaccineName}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {formatDate(s.scheduled_date)}
                      </TableCell>

                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {formatDate(s.taken_at)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={s.status}
                          color={statusColor(s.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {s.status !== 'done' ? (
                            <Tooltip title="Mark as Done">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleMarkDone(s.id)}
                                sx={{ bgcolor: '#fff8e1' }}
                              >
                                <HourglassEmpty fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            
                            <Tooltip title="Done">
                              <IconButton
                                size="small"
                                disabled
                                sx={{ bgcolor: '#e8f5e9' }}
                              >
                                <CheckCircle fontSize="small" sx={{ color: '#2e7d32' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteId(s.id)}
                              sx={{ bgcolor: '#ffebee' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <Vaccines sx={{ fontSize: 48, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography>No schedules found</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setOpenAdd(true)}
                        sx={{ mt: 2, borderRadius: 2 }}
                      >
                        Add First Schedule
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ===== Add Schedule Dialog ===== */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          p: 3, display: 'flex', alignItems: 'center', gap: 2
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            <Vaccines sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="white">
              Add Vaccine Schedule
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Schedule a new vaccine for your animal
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                SELECT ANIMAL
              </Typography>
              <TextField
                select fullWidth label="Animal"
                value={form.user_animal_id}
                onChange={(e) => setForm({ ...form, user_animal_id: e.target.value, vaccine_id: '' })}
                error={!!errors.user_animal_id}
                helperText={errors.user_animal_id}
              >
                {myAnimals.length === 0 && <MenuItem disabled>No animals found</MenuItem>}
                {myAnimals.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{
                        width: 24, height: 24,
                        bgcolor: `${animalColor(a.animal?.name ?? '')}22`
                      }}>
                        <Pets sx={{ fontSize: 13, color: animalColor(a.animal?.name ?? '') }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{a.nickname}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.animal?.name}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                SELECT VACCINE
              </Typography>
              <TextField
                select fullWidth label="Vaccine"
                value={form.vaccine_id}
                onChange={(e) => setForm({ ...form, vaccine_id: e.target.value })}
                error={!!errors.vaccine_id}
                helperText={
                  errors.vaccine_id ??
                  (!form.user_animal_id ? 'Select an animal first' :
                    vaccinesLoading ? 'Loading vaccines...' :
                    vaccines.length === 0 ? 'No vaccines found for this animal' : '')
                }
                disabled={!form.user_animal_id || vaccinesLoading}
              >
                {vaccinesLoading && <MenuItem disabled>Loading...</MenuItem>}
                {!vaccinesLoading && vaccines.length === 0 && (
                  <MenuItem disabled>No vaccines available</MenuItem>
                )}
                {vaccines.map(v => (
                  <MenuItem key={v.id} value={v.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Medication sx={{ fontSize: 16, color: '#7b1fa2' }} />
                      {v.name ?? `Vaccine #${v.id}`}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                SCHEDULED DATE
              </Typography>
              <TextField
                fullWidth label="Scheduled Date" type="date"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                error={!!errors.scheduled_date}
                helperText={errors.scheduled_date}
                InputLabelProps={{ shrink: true }}
                inputProps={{ lang: 'en' }}
              />
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setOpenAdd(false);
              setForm({ user_animal_id: '', vaccine_id: '', scheduled_date: '' });
              setErrors({});
              setVaccines([]);
            }}
            startIcon={<Close />}
            variant="outlined"
            sx={{ borderRadius: 2, flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSubmit}
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: 2, flex: 1,
              background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #1565c0 0%, #0a3d8f 100%)' }
            }}
          >
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Delet Confirmation ===== */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Delete />
          Delete Schedule
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this vaccine schedule? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}