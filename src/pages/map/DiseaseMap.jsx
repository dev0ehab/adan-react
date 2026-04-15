import React from "react";
import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip,
  CircularProgress, Avatar, Divider,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Report, LocationOn } from '@mui/icons-material';
import L from 'leaflet';
import api from '../../api/axios';
import { Grid } from '@mui/material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusColor = (status) => {
  if (status === 'confirmed') return '#d32f2f';
  if (status === 'pending') return '#ed6c02';
  if (status === 'resolved') return '#2e7d32';
  return '#FF0000';
};

const customIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width: 16px; height: 16px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function DiseaseMap() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchReports = async () => {
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
    fetchReports();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFiltered(reports);
    } else {
      setFiltered(reports.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reports]);

  const confirmed = reports.filter(r => r.status === 'confirmed').length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Disease Map
      </Typography>


      <Box>
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Taken', value: confirmed, color: '#2e7d32', bg: '#e8f5e9' },
            { label: 'Pending', value: pending, color: '#ed6c02', bg: '#fff8e1' },
            { label: 'Overdue', value: resolved, color: '#d32f2f', bg: '#ffebee' },
          ].map((s) => (
            <Grid item xs={12} sm={4} key={s.label}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    p: { xs: 1, sm: 2 },
                  }}
                >

                  <Avatar sx={{ bgcolor: s.bg, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                    <Report sx={{ color: s.color, fontSize: { xs: 16, sm: 20 } }} />
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight="bold" color={s.color}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ width: { xs: '100%', md: '75%' }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 1 }}>

              {/* Filter */}
              <Box sx={{ px: 2, pt: 1, pb: 1 }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Leaflet Map */}
              <MapContainer
                center={[26.8206, 30.8025]}
                zoom={6}
                style={{ height: '500px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {filtered.map((report) => (
                  <React.Fragment key={report.id}>
                    {report.latitude && report.longitude && (
                      <>
                        <Circle
                          center={[report.latitude, report.longitude]}
                          radius={15000}
                          pathOptions={{
                            color: statusColor(report.status),
                            fillColor: statusColor(report.status),
                            fillOpacity: 0.15,
                          }}
                        />
                        <Marker
                          position={[report.latitude, report.longitude]}
                          icon={customIcon(statusColor(report.status))}
                        >
                          <Popup>
                            <Box sx={{ minWidth: 160 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {report.title}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                📍 {report.region?.name ?? report.region}
                              </Typography>
                              <Typography variant="caption" display="block" mt={0.5}>
                                {report.description}
                              </Typography>
                              <Chip
                                label={report.status}
                                size="small"
                                sx={{
                                  mt: 1,
                                  bgcolor: `${statusColor(report.status)}22`,
                                  color: statusColor(report.status),
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize'
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

        <Box sx={{ width: { xs: '100%', md: '23.5%' } }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: 2,
            height: { xs: 'auto', md: '587px' },
            overflow: 'hidden'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Active Reports
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">No reports found</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                  {filtered.map((report, index) => (
                    <Box key={report.id}>
                      <Box sx={{ py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{
                          width: 10, height: 10, borderRadius: '50%',
                          bgcolor: statusColor(report.status),
                          mt: 0.8, flexShrink: 0
                        }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="medium" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {report.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                            <LocationOn sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {report.region?.name ?? report.region}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={report.status}
                          size="small"
                          sx={{
                            bgcolor: `${statusColor(report.status)}22`,
                            color: statusColor(report.status),
                            fontWeight: 'bold',
                            fontSize: 10,
                            textTransform: 'capitalize',
                            flexShrink: 0
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