import { useState, useEffect } from 'react';

import {
  Box, Card, CardContent, Typography, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, IconButton,
  Tooltip, CircularProgress, Button, Dialog,
  DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid
} from '@mui/material';
import {
  Check, Close, Visibility, People,
  Report, Pets, AdminPanelSettings
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../api/axios';


const statusColor = (status) => {
  if (status === 'confirmed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'resolved') return 'info';
  return 'default';
};

// Tab Panel
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function AdminPanel() {
  const [tab, setTab] = useState(0);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [reportsRes, usersRes, statsRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/users'),
          api.get('/admin/stats'),
        ]);
        setReports(reportsRes.data);
        setUsers(usersRes.data);
        setStats(statsRes.data);
      } catch {
        toast.error('Failed to load admin data');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/admin/reports/${selectedReport.id}/status`, { status: newStatus });
    } catch {
      <>
      </>
    }
    setReports(reports.map(r =>
      r.id === selectedReport.id ? { ...r, status: newStatus } : r
    ));
    toast.success(`Report marked as ${newStatus}`);
    setStatusDialog(false);
    setSelectedReport(null);
  };

  const handleQuickStatus = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status });
    } catch {
      <>
      </>
    }
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Report marked as ${status}`);
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
        Header 
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AdminPanelSettings sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight="bold">Admin Panel</Typography>
      </Box>

       Stats 
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Users', value: stats?.total_users, color: '#1976d2', bg: '#e3f2fd', icon: <People /> },
          { label: 'Total Reports', value: stats?.total_reports, color: '#d32f2f', bg: '#ffebee', icon: <Report /> },
          { label: 'Pending Review', value: stats?.pending_reports, color: '#ed6c02', bg: '#fff8e1', icon: <Report /> },
          { label: 'Total Animals', value: stats?.total_animals, color: '#2e7d32', bg: '#e8f5e9', icon: <Pets /> },
        ].map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: s.bg }}>
                  <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color={s.color}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      Tabs
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{ px: 2, borderBottom: '1px solid #f0f0f0' }}
        >
          <Tab label={`Reports (${reports.length})`} />
          <Tab label={`Users (${users.length})`} />
        </Tabs>

        <CardContent>

         Reports Tab 

          <TabPanel value={tab} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><b>#</b></TableCell>
                    <TableCell><b>Title</b></TableCell>
                    <TableCell><b>Submitted By</b></TableCell>
                    <TableCell><b>Region</b></TableCell>
                    <TableCell><b>Date</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report, index) => (
                    <TableRow key={report.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {report.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#e3f2fd', color: '#1976d2' }}>
                            {report.user?.charAt(0)}
                          </Avatar>
                          {report.user}
                        </Box>
                      </TableCell>
                      <TableCell>{report.region}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={statusColor(report.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {report.status === 'pending' && (
                            <>
                              <Tooltip title="Confirm">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleQuickStatus(report.id, 'confirmed')}
                                >
                                  <Check fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleQuickStatus(report.id, 'resolved')}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Change Status">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedReport(report);
                                setNewStatus(report.status);
                                setStatusDialog(true);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          Users Tab 
          <TabPanel value={tab} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><b>#</b></TableCell>
                    <TableCell><b>Name</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Role</b></TableCell>
                    <TableCell><b>Region</b></TableCell>
                    <TableCell><b>Animals</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'doctor' ? 'Veterinarian' : 'Breeder'}
                          size="small"
                          color={user.role === 'doctor' ? 'success' : 'primary'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{user.region}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Pets sx={{ fontSize: 16, color: 'text.secondary' }} />
                          {user.animals}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

        </CardContent>
      </Card>

       Change Status Dialog 
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {selectedReport?.title}
          </Typography>
          <TextField
            select fullWidth label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

    </Box>
  )}