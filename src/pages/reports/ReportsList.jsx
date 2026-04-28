import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Skeleton,
  IconButton,
} from '@mui/material';
import { AddRounded, SearchRounded, ReportRounded, ChevronRightRounded, RefreshRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';

const statusStyle = (status) => {
  if (status === 'confirmed') return { bg: 'rgba(184, 92, 84, 0.12)', fg: '#a34740' };
  if (status === 'pending') return { bg: 'rgba(201, 162, 39, 0.15)', fg: '#8a6d12' };
  if (status === 'resolved') return { bg: 'rgba(61, 139, 99, 0.12)', fg: '#2d6a4f' };
  return { bg: 'action.hover', fg: 'text.secondary' };
};

const PAGE = 8;

export default function ReportsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setReports(list);
      setFiltered(list);
    } catch {
      toast.error(t('reports.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const result = reports.filter(
      (r) =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.region?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(r.region ?? '')
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    setFiltered(result);
    setVisible(PAGE);
  }, [search, reports]);

  const slice = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  if (loading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={100} />
        <Skeleton variant="rounded" height={100} />
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('reports.listTitle')}
        subtitle={t('reports.listSubtitle')}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={fetchReports}
              disabled={loading}
              sx={{ fontWeight: 700, borderRadius: 999, px: 2.5 }}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => navigate('/app/reports/create')}
              sx={{ fontWeight: 800, borderRadius: 999, px: 2.5 }}
            >
              {t('reports.newReport')}
            </Button>
          </>
        }
      />

      <TextField
        placeholder={t('reports.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Stack spacing={1.5}>
        {slice.map((report) => {
          const st = statusStyle(report.status);
          return (
            <Card
              key={report.id}
              onClick={() => navigate(`/app/reports/${report.id}`)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'rgba(196, 92, 82, 0.1)',
                    color: 'error.main',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ReportRounded />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ pr: 1 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.45 }} noWrap>
                    {report.description}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }} alignItems="center">
                    <Chip
                      label={report.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        bgcolor: st.bg,
                        color: st.fg,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {report.region?.name ?? report.region ?? t('reports.areaFallback')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ ml: { sm: 'auto' } }}>
                      {report.created_at?.slice(0, 10)}
                    </Typography>
                  </Stack>
                </Box>
                <IconButton size="small" sx={{ color: 'text.disabled', mt: 0.5 }}>
                  <ChevronRightRounded />
                </IconButton>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('reports.noSearchMatch')}
              </Typography>
              <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate('/app/reports/create')}>
                {t('reports.reportCase')}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasMore && (
          <Button variant="outlined" fullWidth onClick={() => setVisible((v) => v + PAGE)} sx={{ py: 1.5, fontWeight: 700 }}>
            {t('reports.loadMore')}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
