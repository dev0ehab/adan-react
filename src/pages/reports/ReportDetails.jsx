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
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusColor = (status) => {
  if (status === 'confirmed') return 'success';
  if (status === 'pending')   return 'warning';
  if (status === 'resolved')  return 'info';
  return 'default';
};

export default function ReportDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res  = await api.get(`/reports/${id}`);
        const data = res.data?.data ?? res.data;
        setReport(data);
      } catch {
        toast.error('Failed to load report');
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
        <Typography>Report not found</Typography>
        <Button onClick={() => navigate('/app/reports')} sx={{ mt: 2 }}>
          Back to Reports
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/app/reports')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Report Details
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2, maxWidth: 750 }}>
        <CardContent sx={{ p: 4 }}>

          {/* Title - Status */}
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

          {/* Info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Region</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {report.region?.name ?? report.region ?? 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {report.created_at?.slice(0, 10) ?? report.date ?? 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Reported By</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {report.user?.name ?? 'N/A'}
                </Typography>
              </Box>
            </Box>

            {report.severity && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Report sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Severity</Typography>
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
                  <Typography variant="caption" color="text.secondary">Coordinates</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {report.latitude}, {report.longitude}
                  </Typography>
                </Box>
              </Box>
            )}

          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Description */}
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Description
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {report.description}
          </Typography>

          {/* Animal */}
          {report.animal && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Animal
              </Typography>
              <Typography variant="body1">
                {report.animal?.nickname ?? report.animal?.name ?? 'N/A'}
              </Typography>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}