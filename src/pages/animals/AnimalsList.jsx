import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Grid, Avatar, IconButton, Tooltip, TextField,
  InputAdornment, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Add, Search, Pets, Edit, Delete, Vaccines } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const categoryColor = (cat) => {
  const map = {
    Cow:     '#1976d2',
    Dog:     '#2e7d32',
    Sheep:   '#ed6c02',
    Chicken: '#d32f2f',
    Horse:   '#7b1fa2',
  };
  return map[cat] || '#555';
};

export default function AnimalsList() {
  const navigate = useNavigate();
  const [animals, setAnimals]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await api.get('/my-animals');
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : [];
        setAnimals(list);
        setFiltered(list);
      } catch {
        toast.error('Failed to load animals');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  useEffect(() => {
    const result = animals.filter(a =>
      a.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      a.animal?.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, animals]);

  const handleDelete = async () => {
    try {
      await api.delete(`/my-animals/${deleteId}`);
      const updated = animals.filter(a => a.id !== deleteId);
      setAnimals(updated);
      setFiltered(updated);
      toast.success('Animal removed successfully');
    } catch {
      toast.error('Failed to remove animal');
    } finally {
      setDeleteId(null);
    }
  };

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
        <Typography variant="h5" fontWeight="bold">My Animals</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/app/animals/create")}
          sx={{ borderRadius: 2 }}
        >
          Add Animal
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by name or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 3, width: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Animals Grid */}
      <Grid container spacing={3}>
        {filtered.map((animal) => {
          const categoryName = animal.animal?.name ?? animal.category ?? '';
          const color = categoryColor(categoryName);
          return (
            <Grid item xs={12} sm={6} md={4} key={animal.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, '&:hover': { boxShadow: 4 }, transition: '0.2s' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
                        <Pets />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {animal.nickname}
                        </Typography>
                        <Chip
                          label={categoryName}
                          size="small"
                          sx={{
                            bgcolor: `${color}22`,
                            color: color,
                            fontWeight: 'bold',
                            fontSize: 11
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/app/animals/edit/${animal.id}`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(animal.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      🎂 Birth Date: <b>{animal.birth_date ?? 'N/A'}</b>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      💉 Last Vaccine: <b>{animal.last_vaccine_date ?? 'N/A'}</b>
                    </Typography>
                  </Box>
                      {/* npm run dev */}
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<Vaccines />}
                    sx={{ mt: 2, borderRadius: 2 }}
                    onClick={() => navigate(`/app/vaccines?animal/${animal.id}`)}
                  >
                    View Vaccines
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Pets sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography>No animals found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Remove Animal</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this animal?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}