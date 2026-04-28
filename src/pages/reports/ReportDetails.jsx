import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Chip, Avatar, Divider, CircularProgress
} from '@mui/material';
import {
  ArrowBack, Report, LocationOn,
  CalendarToday, Person
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusColor = (status) => {
  if (status === 'confirmed') return 'success';
  if (status === 'pending')   return 'warning';
  if (status === 'resolved')  return 'info';
  return 'default';
};

export default function ReportDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        const data = res.data?.data ?? res.data;
        setReport(data);
      } catch {
        toast.error(t('reports.detailsLoadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
        <Typography>{t('reports.notFound')}</Typography>
        <Button onClick={() => navigate('/app/reports')} sx={{ mt: 2 }}>
          {t('reports.detailsBack')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/app/reports')}>
          {t('reports.backShort')}
        </Button>
        <Typography variant="h5" fontWeight="bold">
          {t('reports.detailsTitle')}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2, maxWidth: 750 }}>
        <CardContent sx={{ p: 4 }}>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#ffebee', width: 48, height: 48 }}>
                <Report sx={{ color: '#d32f2f' }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {report.title}
              </Typography>
            </Box>
            <Chip
              label={report.status}
              color={statusColor(report.status)}
              sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">{t('reports.region')}</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {report.region?.name ?? report.region ?? t('profile.na')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">{t('reports.date')}</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {report.created_at?.slice(0, 10) ?? report.date ?? t('profile.na')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">{t('reports.reportedBy')}</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {report.user?.name ?? t('profile.na')}
                </Typography>
              </Box>
            </Box>

            {report.severity && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Report sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('reports.severity')}</Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                    {report.severity}
                  </Typography>
                </Box>
              </Box>
            )}

            {report.latitude && report.longitude && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('reports.coordinates')}</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {report.latitude}, {report.longitude}
                  </Typography>
                </Box>
              </Box>
            )}

          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            {t('reports.description')}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {report.description}
          </Typography>

          {(report.category || report.animal) && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {t('createReport.animalCategory')}
              </Typography>
              <Typography variant="body1">
                {report.category?.name ?? report.animal?.name ?? report.animal?.nickname ?? t('profile.na')}
              </Typography>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}
