import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Container,
  Stack,
} from '@mui/material';
import { PetsRounded, ReportRounded, LocationOnRounded, ArrowForwardRounded, ChevronRightRounded } from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import BannerStrip from '../../components/home/BannerStrip';
import MapPreview from '../../components/home/MapPreview';
import { STEP_IDS, FEATURE_METAS } from '../../content/landingMarketing';
import { reportStatusColor as statusColor } from '../../utils/leafletIcons';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/approved');
        const data = res.data?.data ?? res.data ?? [];
        setReports(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 5 },
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.light',
              color: 'primary.dark',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <PetsRounded />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.04em">
            {t('brand.name')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="text" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
            {t('common.login')}
          </Button>
          <Button variant="contained" onClick={() => navigate('/register')}>
            {t('auth.startNow')}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ pt: { xs: 10, md: 11 } }}>
        <BannerStrip />
      </Box>

      <Box
        sx={{
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 12 },
          px: { xs: 2, md: 6 },
          background: (th) =>
            `linear-gradient(165deg, ${th.palette.primary.light} 0%, ${th.palette.background.default} 45%, #f0ebe3 100%)`,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip label={t('landing.chip')} sx={{ mb: 2, fontWeight: 700, bgcolor: 'background.paper' }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.04em',
              fontSize: { xs: '2.1rem', md: '3rem' },
              lineHeight: 1.15,
              color: 'primary.dark',
            }}
          >
            {t('landing.heroTitle')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              color: 'text.secondary',
              fontWeight: 500,
              maxWidth: 560,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.15rem' },
            }}
          >
            {t('landing.heroSubtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate('/register')}
              sx={{ px: 4, py: 1.4, fontSize: '1rem' }}
            >
              {t('landing.startFree')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ px: 3, py: 1.4, fontSize: '1rem', bgcolor: 'background.paper' }}
            >
              {t('landing.howItWorks')}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container id="how-it-works" maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
          {t('landing.threeBeatsTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 5, maxWidth: 520, mx: 'auto' }}>
          {t('landing.threeBeatsSubtitle')}
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {STEP_IDS.map((id, i) => (
            <Card key={id} sx={{ flex: 1, position: 'relative', overflow: 'visible' }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </Avatar>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  {t(`landing.steps.${id}.title`)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(`landing.steps.${id}.text`)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
          {t('landing.everythingTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 5 }}>
          {t('landing.everythingSubtitle')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'center' }}>
          {FEATURE_METAS.map((f) => (
            <Box key={f.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 14px)' } }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ bgcolor: f.bg, width: 52, height: 52, mb: 2 }}>
                    <Box sx={{ color: f.color, display: 'flex' }}>{f.icon}</Box>
                  </Avatar>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                    {t(`landing.features.${f.id}.title`)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(`landing.features.${f.id}.desc`)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
            {t('landing.snapshotsTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            {t('landing.snapshotsSubtitle')}
          </Typography>
          {loading ? (
            <Typography align="center" color="text.secondary">
              {t('common.loading')}
            </Typography>
          ) : reports.length === 0 ? (
            <Typography align="center" color="text.secondary">
              {t('landing.snapshotsEmpty')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {reports.slice(0, 6).map((report) => (
                <Box key={report.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' } }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'rgba(196, 92, 82, 0.12)', width: 40, height: 40 }}>
                          <ReportRounded sx={{ color: 'error.main', fontSize: 20 }} />
                        </Avatar>
                        <Chip
                          label={report.status}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            bgcolor: `${statusColor(report.status)}22`,
                            color: statusColor(report.status),
                          }}
                        />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={800} noWrap>
                        {report.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {report.description}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {report.region?.name ?? report.region}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                          {report.created_at?.slice(0, 10)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
          {t('landing.mapPeekTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          {t('landing.mapPeekSubtitle')}
        </Typography>
        <MapPreview reports={reports} />
      </Container>

      <Box
        sx={{
          py: { xs: 7, md: 10 },
          px: 2,
          textAlign: 'center',
          background: (th) => `linear-gradient(135deg, ${th.palette.primary.main} 0%, ${th.palette.primary.dark} 100%)`,
          color: 'common.white',
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
          {t('landing.ctaTitle')}
        </Typography>
        <Typography sx={{ opacity: 0.95, maxWidth: 480, mx: 'auto', mb: 3 }}>
          {t('landing.ctaSubtitle')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          endIcon={<ChevronRightRounded />}
          onClick={() => navigate('/register')}
          sx={{ px: 4, py: 1.3, fontWeight: 800, color: 'primary.dark' }}
        >
          {t('landing.ctaButton')}
        </Button>
      </Box>

      <Box sx={{ py: 4, textAlign: 'center', bgcolor: '#1e2d24', color: 'rgba(255,255,255,0.85)' }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <PetsRounded sx={{ color: 'primary.light' }} />
          <Typography variant="h6" fontWeight={800}>
            {t('brand.name')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {t('landing.footerLine')}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 1 }}>
          © {new Date().getFullYear()} {t('brand.name')}
        </Typography>
      </Box>
    </Box>
  );
}
