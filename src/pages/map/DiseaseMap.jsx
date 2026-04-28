import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  Stack,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { ReportRounded, LocationOnRounded, RefreshRounded } from '@mui/icons-material';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import PageHeader from '../../components/shared/PageHeader';
import { ensureLeafletDefaultIcons, reportStatusColor as statusColor } from '../../utils/leafletIcons';

const customIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
    width: 16px; height: 16px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const STATUS_FILTERS = ['all', 'confirmed', 'pending', 'resolved'];

function statusFilterKey(id) {
  if (id === 'all') return 'map.filterAll';
  return `map.filter${id.charAt(0).toUpperCase()}${id.slice(1)}`;
}

export default function DiseaseMap() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    ensureLeafletDefaultIcons();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/approved');
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setReports(list);
      setFiltered(list);
    } catch {
      setReports([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let list = reports;
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (regionFilter !== 'all') {
      list = list.filter((r) => {
        const name = (r.region?.name ?? r.region ?? '').toString();
        return name === regionFilter;
      });
    }
    setFiltered(list);
  }, [statusFilter, regionFilter, reports]);

  const regions = Array.from(
    new Set(reports.map((r) => (r.region?.name ?? r.region ?? '').toString()).filter(Boolean)),
  ).slice(0, 12);

  const confirmed = reports.filter((r) => r.status === 'confirmed').length;
  const pending = reports.filter((r) => r.status === 'pending').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;

  if (loading) {
    return (
      <Box>
        <PageHeader
          title={t('map.title')}
          subtitle={t('map.subtitleLoading')}
          actions={
            <Button variant="outlined" startIcon={<RefreshRounded />} disabled sx={{ borderRadius: 999, px: 2.5 }}>
              {t('common.refresh')}
            </Button>
          }
        />
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={48} />
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={300} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('map.title')}
        subtitle={t('map.subtitle')}
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={fetchReports}
            disabled={loading}
            sx={{ fontWeight: 700, borderRadius: 999, px: 2.5 }}
          >
            {t('common.refresh')}
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        {[
          { labelKey: 'map.statsConfirmed', value: confirmed, c: '#b85c54', b: 'rgba(184, 92, 84, 0.12)' },
          { labelKey: 'map.statsPending', value: pending, c: '#c9a227', b: 'rgba(201, 162, 39, 0.15)' },
          { labelKey: 'map.statsResolved', value: resolved, c: '#3d8b63', b: 'rgba(61, 139, 99, 0.12)' },
        ].map((s) => (
          <Card key={s.labelKey} sx={{ flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <Avatar sx={{ bgcolor: s.b, color: s.c, width: 44, height: 44 }}>
                <ReportRounded />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'primary.dark' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t(s.labelKey)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('map.filterStatus')}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {STATUS_FILTERS.map((id) => (
              <Chip
                key={id}
                label={t(statusFilterKey(id))}
                onClick={() => setStatusFilter(id)}
                color={statusFilter === id ? 'primary' : 'default'}
                variant={statusFilter === id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700, borderRadius: 999 }}
              />
            ))}
          </Stack>
          {regions.length > 0 && (
            <>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
                {t('map.area')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip
                  label={t('map.everywhere')}
                  onClick={() => setRegionFilter('all')}
                  color={regionFilter === 'all' ? 'primary' : 'default'}
                  variant={regionFilter === 'all' ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, borderRadius: 999 }}
                />
                {regions.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    onClick={() => setRegionFilter(name)}
                    color={regionFilter === name ? 'primary' : 'default'}
                    variant={regionFilter === name ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600, borderRadius: 999 }}
                  />
                ))}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ width: { xs: '100%', md: '72%' } }}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
              <MapContainer center={[26.8206, 30.8025]} zoom={6} style={{ height: 420, width: '100%', borderRadius: 12 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {filtered.map((report) => (
                  <React.Fragment key={report.id}>
                    {report.latitude && report.longitude && (
                      <>
                        <Circle
                          center={[report.latitude, report.longitude]}
                          radius={14000}
                          pathOptions={{
                            color: statusColor(report.status),
                            fillColor: statusColor(report.status),
                            fillOpacity: 0.12,
                          }}
                        />
                        <Marker position={[report.latitude, report.longitude]} icon={customIcon(statusColor(report.status))}>
                          <Popup>
                            <Box sx={{ minWidth: 160 }}>
                              <Typography variant="subtitle2" fontWeight={800}>
                                {report.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {report.region?.name ?? report.region}
                              </Typography>
                              <Chip
                                label={report.status}
                                size="small"
                                sx={{
                                  mt: 1,
                                  fontWeight: 800,
                                  textTransform: 'capitalize',
                                  bgcolor: `${statusColor(report.status)}22`,
                                  color: statusColor(report.status),
                                }}
                              />
                            </Box>
                          </Popup>
                        </Marker>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '28%' } }}>
          <Card sx={{ height: { md: 468 }, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                {t('map.nearbyReports')}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">{t('map.noMatches')}</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowY: 'auto', pr: 0.5 }}>
                  {filtered.map((report, index) => (
                    <Box key={report.id}>
                      <Box sx={{ py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: statusColor(report.status),
                            mt: 0.8,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {report.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                            <LocationOnRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {report.region?.name ?? report.region}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={report.status}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: 10,
                            textTransform: 'capitalize',
                            bgcolor: `${statusColor(report.status)}22`,
                            color: statusColor(report.status),
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                      {index < filtered.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
