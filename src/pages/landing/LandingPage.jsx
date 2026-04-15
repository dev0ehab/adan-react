import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  Avatar, Chip, Divider, Container,
  Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText
} from '@mui/material';
import {
  Pets, Report, Vaccines, Map, Notifications,
  Shield, Speed, People, LocationOn, ArrowForward,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  Vaccines as VaccinesIcon,
  Map as MapIcon,
  Notifications as NotifIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { BsReverseLayoutSidebarReverse } from "react-icons/bs";


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
  return '#999';
};

const customIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width: 14px; height: 14px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const FEATURES = [
  { icon: <Report />, color: '#d32f2f', bg: '#ffebee', title: 'Disease Reporting', desc: 'Submit and track animal disease reports in real-time across Egypt.' },
  { icon: <Map />, color: '#1976d2', bg: '#e3f2fd', title: 'Interactive Map', desc: 'View disease spread on an interactive map with live updates.' },
  { icon: <Vaccines />, color: '#2e7d32', bg: '#e8f5e9', title: 'Vaccine Scheduling', desc: 'Schedule and track vaccinations for your animals with smart reminders.' },
  { icon: <Notifications />, color: '#ed6c02', bg: '#fff8e1', title: 'Real-time Alerts', desc: 'Get instant notifications about disease outbreaks near your location.' },
  { icon: <Shield />, color: '#7b1fa2', bg: '#f3e5f5', title: 'Verified Reports', desc: 'All reports are verified by certified veterinarians before publication.' },
  { icon: <People />, color: '#0288d1', bg: '#e1f5fe', title: 'Community Network', desc: 'Connect breeders and veterinarians for faster disease response.' },
];

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'My Profile', icon: <PersonIcon />, path: '/app/profile' },
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { label: 'Disease Reports', icon: <ReportIcon />, path: '/app/reports' },
  { label: 'My Animals', icon: <Pets />, path: '/app/animals' },
  { label: 'Vaccines', icon: <VaccinesIcon />, path: '/app/vaccines' },
  { label: 'Disease Map', icon: <MapIcon />, path: '/app/map' },
  { label: 'Notifications', icon: <NotifIcon />, path: '/app/notifications' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* ===== Navebar ===== */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        bgcolor: 'white', boxShadow: 1,
        display: 'flex', alignItems: 'center',
        px: { xs: 2, md: 6 }, py: 1.5,
      }}>

        {user && (
          <Button
            onClick={() => setSidebarOpen(true)}
            sx={{
              minWidth: 0,
              mr: 1,
              color: 'text.primary',
              '&:hover': { bgcolor: '#e0e8f0' }
            }}
          >
            <BsReverseLayoutSidebarReverse size={24}/>
          </Button>
        )}

         <Pets sx={{ color: 'primary.main', mr: 1, display: { xs: 'none', sm: 'block' }}} />
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          ADAN
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/app/dashboard')}
              sx={{ borderRadius: 2 }}
            >
              Dashboard
            </Button>

            <Avatar
              sx={{ width: 36, height: 36, bgcolor: 'primary.main', cursor: 'pointer' }}
              src={user?.avatar ?? user?.profile_photo_url ?? ''}
              onClick={() => navigate('/app/profile')}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}

      </Box>

      {/* ===== Sidebar Drawer ===== */}
      {user && (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <Box sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <Box sx={{
              p: 2.5, bgcolor: 'primary.main', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">ADAN</Typography>
                <Typography variant="caption">Animal Disease Alert Network</Typography>
              </Box>
              <Button onClick={() => setSidebarOpen(false)} sx={{ color: 'white', minWidth: 0, p: 0.5 }}>
                <CloseIcon />
              </Button>
            </Box>

            {/* User Info */}
            <Box
              sx={{ px: 2, py: 1.5, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => { navigate('/app/profile'); setSidebarOpen(false); }}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold" noWrap>
                  {user?.name}
                </Typography>

                {/* npm run dev */}
                
                <Chip
                  label={user?.role === 'doctor' ? 'Veterinarian' : 'Breeder'}
                  size="small"
                  color={user?.role === 'doctor' ? 'success' : 'primary'}
                  sx={{ mt: 0.5, fontSize: 11 }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Nav Items */}
            <List sx={{ flexGrow: 1, pt: 1 }}>
              {NAV_ITEMS.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Admin - Doctor*/}
            {user?.role === 'doctor' && (
              <>
                <Divider />
                <List sx={{ pb: 1 }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => { navigate('/app/admin'); setSidebarOpen(false); }}
                      sx={{ mx: 1, borderRadius: 2, mt: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                        <AdminIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Admin Panel"
                        primaryTypographyProps={{ fontSize: 14 }}
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </>
            )} 

          </Box>
        </Drawer>
      )}

      {/* ===== Hero ===== */}
      <Box sx={{
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        px: { xs: 3, md: 8 },
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <Pets sx={{ fontSize: { xs: 56, md: 72 }, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
          Animal Disease Alert Network
        </Typography>
        <Typography variant="h6" mb={4} sx={{ opacity: 0.85, maxWidth: 600, mx: 'auto', fontWeight: 'normal' }}>
          Real-time disease surveillance and early warning system for animal health in Egypt.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!user && (
            <>
              <Button
                variant="contained" size="large"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
                sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: 3, px: 4, '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined" size="large"
                onClick={() => navigate('/login')}
                sx={{ borderColor: 'white', color: 'white', borderRadius: 3, px: 4, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Login
              </Button>
            </>
          )}
          {user && (
            <Button
              variant="contained" size="large"
              onClick={() => navigate('/app/dashboard')}
              endIcon={<ArrowForward />}
              sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: 3, px: 4, '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              Go to Dashboard
            </Button>
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 }, mt: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Reports', value: reports.length },
            { label: 'Governorates', value: '27' },
            { label: 'Veterinarians', value: '500+' },
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">{s.value}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ===== Fatures ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
          Why Choose ADAN?
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={6}>
          Everything you need to monitor and respond to animal diseases
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {FEATURES.map((f) => (
            <Box key={f.title} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33% - 16px)' } }}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%', '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }, transition: '0.3s' }}>
                <CardContent sx={{ p: 3 }}>
                  <Avatar sx={{ bgcolor: f.bg, width: 52, height: 52, mb: 2 }}>
                    <Box sx={{ color: f.color, display: 'flex' }}>{f.icon}</Box>
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" mb={1}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* ===== Latest Reports ===== */}
      <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
            Latest Disease Reports
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={6}>
            Real-time approved reports across Egypt
          </Typography>
          {loading ? (
            <Typography textAlign="center" color="text.secondary">Loading reports...</Typography>
          ) : reports.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">No reports available</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {reports.slice(0, 6).map((report) => (
                <Box key={report.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33% - 11px)' } }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 1, '&:hover': { boxShadow: 3 }, transition: '0.2s' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#ffebee', width: 40, height: 40 }}>
                          <Report sx={{ color: '#d32f2f', fontSize: 18 }} />
                        </Avatar>
                        <Chip
                          label={report.status}
                          size="small"
                          sx={{ bgcolor: `${statusColor(report.status)}22`, color: statusColor(report.status), fontWeight: 'bold', textTransform: 'capitalize', fontSize: 11 }}
                        />
                      </Box>
                      <Typography variant="body1" fontWeight="bold" mb={0.5} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {report.description}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {report.region?.name ?? report.region}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" ml="auto">
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

      {/* ===== Map ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
          Disease Spread Map
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
          Live map showing approved disease reports across Egypt
        </Typography>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 1 }}>
            <MapContainer
              center={[26.8206, 30.8025]}
              zoom={6}
              style={{ height: '450px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {reports.map((report) => (
                <React.Fragment key={report.id}>
                  {report.latitude && report.longitude && (
                    <>
                      <Circle
                        center={[report.latitude, report.longitude]}
                        radius={15000}
                        pathOptions={{ color: statusColor(report.status), fillColor: statusColor(report.status), fillOpacity: 0.15 }}
                      />
                      <Marker position={[report.latitude, report.longitude]} icon={customIcon(statusColor(report.status))}>
                        <Popup>
                          <Typography variant="subtitle2" fontWeight="bold">{report.title}</Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            📍 {report.region?.name ?? report.region}
                          </Typography>
                          <Chip
                            label={report.status}
                            size="small"
                            sx={{ mt: 1, bgcolor: `${statusColor(report.status)}22`, color: statusColor(report.status), fontWeight: 'bold', textTransform: 'capitalize' }}
                          />
                        </Popup>
                      </Marker>
                    </>
                  )}
                </React.Fragment>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </Container>

      {/* ===== Cta ===== */}
      <Box sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', py: { xs: 6, md: 10 }, textAlign: 'center', color: 'white', px: 3 }}>
        <Speed sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h4" fontWeight="bold" mb={2}>Join ADAN Today</Typography>
        <Typography variant="body1" mb={4} sx={{ opacity: 0.85, maxWidth: 500, mx: 'auto' }}>
          Help protect animal health in Egypt by reporting and tracking diseases in your area.
        </Typography>
        {!user && (
          <Button
            variant="contained" size="large"
            onClick={() => navigate('/register')}
            endIcon={<ArrowForward />}
            sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: 3, px: 5, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            Create Free Account
          </Button>
        )}
      </Box>

      {/* ===== Footer ===== */}
      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', py: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <Pets sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">ADAN</Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>Animal Disease Alert Network — Egypt</Typography>
        <Typography variant="caption" sx={{ opacity: 0.4, display: 'block', mt: 1 }}>© 2026 ADAN. All rights reserved.</Typography>
      </Box>

    </Box>
  );
}