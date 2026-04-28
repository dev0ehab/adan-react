import { useState, useEffect, useMemo } from 'react';
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
import {
  ReportRounded,
  PetsRounded,
  MapRounded,
  VaccinesRounded,
  NotificationsRounded,
  ListAltRounded,
  AddRounded,
  ArrowForwardRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import BannerStrip from '../../components/home/BannerStrip';
import MapPreview from '../../components/home/MapPreview';
import { STEP_IDS, FEATURE_METAS } from '../../content/landingMarketing';
import { reportStatusColor as statusColor } from '../../utils/leafletIcons';

const WORKSPACE_KEYS = [
  {
    key: 'reports',
    listPath: '/app/reports',
    createPath: '/app/reports/create',
    createKey: 'create',
    icon: ReportRounded,
    accent: '#c45c52',
  },
  {
    key: 'animals',
    listPath: '/app/animals',
    createPath: '/app/animals/create',
    createKey: 'create',
    icon: PetsRounded,
    accent: '#4a7c59',
  },
  {
    key: 'vaccines',
    listPath: '/app/vaccines',
    createPath: '/app/vaccines',
    createKey: 'create',
    icon: VaccinesRounded,
    accent: '#4a90a4',
  },
  {
    key: 'map',
    listPath: '/app/map',
    createPath: null,
    createKey: null,
    icon: MapRounded,
    accent: '#8a6d12',
  },
  {
    key: 'notifications',
    listPath: '/app/notifications',
    createPath: null,
    createKey: null,
    icon: NotificationsRounded,
    accent: '#7b5fa6',
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const chipName = useMemo(() => {
    if (!user?.name) return t('dashboard.there');
    return user.name.split(' ')[0] || user.name;
  }, [user?.name, t]);

  const workspace = useMemo(
    () =>
      WORKSPACE_KEYS.map((w) => ({
        ...w,
        title: t(`dashboard.modules.${w.key}.title`),
        desc: t(`dashboard.modules.${w.key}.desc`),
        createLabel: w.createKey ? t(`dashboard.modules.${w.key}.${w.createKey}`) : null,
      })),
    [t],
  );

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/reports/approved');
        const data = res.data?.data ?? res.data ?? [];
        setReports(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch {
        toast.error(t('toasts.mapPreviewLoadFailed'));
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [t]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 2, mt: { xs: -0.5, sm: 0 } }}>
        <BannerStrip />
      </Box>

      <Box
        sx={{
          pt: { xs: 3, md: 4 },
          pb: { xs: 6, md: 8 },
          px: { xs: 0, md: 0 },
          borderRadius: { md: 3 },
          background: (th) =>
            `linear-gradient(165deg, ${th.palette.primary.light} 0%, ${th.palette.background.default} 50%, #f0ebe3 100%)`,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip label={t('dashboard.hello', { name: chipName })} sx={{ mb: 2, fontWeight: 700, bgcolor: 'background.paper' }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.04em',
              fontSize: { xs: '1.85rem', md: '2.65rem' },
              lineHeight: 1.15,
              color: 'primary.dark',
            }}
          >
            {t('dashboard.heroTitle')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              color: 'text.secondary',
              fontWeight: 500,
              maxWidth: 560,
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
            }}
          >
            {t('dashboard.heroSubtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate('/app/reports/create')}
              sx={{ px: 3, py: 1.25 }}
            >
              {t('dashboard.reportCase')}
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/app/animals')} sx={{ px: 3, py: 1.25, bgcolor: 'background.paper' }}>
              {t('dashboard.modules.animals.title')}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
          {t('dashboard.threeBeatsTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 520, mx: 'auto' }}>
          {t('dashboard.threeBeatsSubtitle')}
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {STEP_IDS.map((id, i) => (
            <Card key={id} sx={{ flex: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar sx={{ width: 36, height: 36, mb: 2, bgcolor: 'primary.main', fontWeight: 800 }}>{i + 1}</Avatar>
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

      <Typography variant="overline" fontWeight={800} color="text.secondary" letterSpacing={0.12} sx={{ display: 'block', mb: 1.5 }}>
        {t('dashboard.workspace')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
        {workspace.map((w) => {
          const Icon = w.icon;
          return (
            <Box key={w.key} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: `${w.accent}18`,
                        color: w.accent,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {w.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, lineHeight: 1.45 }}>
                    {w.desc}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ListAltRounded />}
                      onClick={() => navigate(w.listPath)}
                      sx={{ fontWeight: 700, py: 1.1, borderRadius: 999 }}
                    >
                      {t('common.openList')}
                    </Button>
                    {w.createPath && w.createLabel ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => navigate(w.createPath)}
                        sx={{ fontWeight: 700, py: 1.1, borderRadius: 999 }}
                      >
                        {w.createLabel}
                      </Button>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 8 } }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
          {t('dashboard.everythingTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          {t('dashboard.everythingSubtitle')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'center' }}>
          {FEATURE_METAS.map((f) => (
            <Box key={f.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 14px)' } }}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 } }}>
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

      <Box sx={{ bgcolor: 'background.paper', py: { xs: 5, md: 7 }, borderRadius: { md: 3 }, mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
            {t('dashboard.snapshotsTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            {t('dashboard.snapshotsSubtitle')}
          </Typography>
          {loading ? (
            <Typography align="center" color="text.secondary">
              {t('common.loading')}
            </Typography>
          ) : reports.length === 0 ? (
            <Typography align="center" color="text.secondary">
              {t('dashboard.snapshotsEmpty')}
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
                      <Typography variant="caption" color="text.secondary">
                        {report.region?.name ?? report.region} · {report.created_at?.slice(0, 10)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
          {t('dashboard.mapPreviewTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          {t('dashboard.mapPreviewSubtitle')}
        </Typography>
        <MapPreview reports={reports} />
      </Container>
    </Box>
  );
}
