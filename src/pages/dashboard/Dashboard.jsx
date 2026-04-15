import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box, Card, CardContent, Typography,
  CircularProgress, Avatar, Divider
} from '@mui/material';
import {
  Report, Pets, Warning, Notifications
} from '@mui/icons-material';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" mt={0.5}>
              {value ?? <CircularProgress size={24} />}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [reportsChart, setReportsChart] = useState([]);
  const [diseaseTypes, setDiseaseTypes] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [reportsRes, animalsRes, notificationsRes] = await Promise.all([
          api.get('/reports'),
          api.get('/my-animals'),
          api.get('/notifications/unread-count'),
        ]);

        const reports = reportsRes.data?.data ?? reportsRes.data ?? [];
        const animals = animalsRes.data?.data ?? animalsRes.data ?? [];
        const unread = notificationsRes.data?.count ?? 0;

        setStats({
          total_reports: Array.isArray(reports) ? reports.length : 0,
          total_animals: Array.isArray(animals) ? animals.length : 0,
          pending_reports: Array.isArray(reports) ? reports.filter(r => r.status === 'pending').length : 0,
          total_notifications: unread,
        });

        setRecentReports(Array.isArray(reports) ? reports.slice(0, 4) : []);

        if (Array.isArray(reports)) {
          const monthly = {};
          reports.forEach(r => {
            const month = r.created_at?.slice(5, 7);
            if (month) monthly[month] = (monthly[month] || 0) + 1;
          });
          setReportsChart(
            Object.entries(monthly).map(([month, count]) => ({
              month, reports: count,
            }))
          );

          const typesMap = {};
          reports.forEach(r => {
            const key = r.status ?? 'other';
            typesMap[key] = (typesMap[key] || 0) + 1;
          });
          const total = reports.length || 1;
          setDiseaseTypes(
            Object.entries(typesMap).map(([name, count]) => ({
              name,
              value: Math.round((count / total) * 100),
            }))
          );
        }

      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statusColor = (status) => {
    if (status === 'confirmed') return '#2e7d32';
    if (status === 'pending') return '#ed6c02';
    if (status === 'resolved') return '#1976d2';
    return '#999';
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
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Dashboard
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {[
          { title: 'Total Reports', value: stats?.total_reports, icon: <Report />, color: '#d32f2f', subtitle: 'All disease reports' },
          { title: 'My Animals', value: stats?.total_animals, icon: <Pets />, color: '#1976d2', subtitle: 'Registered animals' },
          { title: 'Pending', value: stats?.pending_reports, icon: <Warning />, color: '#ed6c02', subtitle: 'Awaiting review' },
          { title: 'Notifications', value: stats?.total_notifications, icon: <Notifications />, color: '#7b1fa2', subtitle: 'Unread alerts' },
        ].map((card) => (
          <Box
            key={card.title}
            sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}
          >
            <StatCard {...card} />
          </Box>
        ))}
      </Box>
      {/* Charts Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>

        {/* Monthly Disease Reports */}
        <Box sx={{ width: { xs: '100%', md: '350px' }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '400px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Monthly Disease Reports
              </Typography>
              {reportsChart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <Typography variant="body2">No data available</Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportsChart}>
                      <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="reports"
                        stroke="#1976d2"
                        strokeWidth={2}
                        fill="url(#colorReports)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Disease Types */}
        <Box sx={{ display: 'flex', md: '350px', flexWrap: 'wrap', gap: 2, mb: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '400px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Disease Types
              </Typography>
              {diseaseTypes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <Typography variant="body2">No data available</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={diseaseTypes}
                          cx="50%"
                          cy="35%"
                          innerRadius={48}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {diseaseTypes.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box mt={1}>
                    {diseaseTypes.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, bgcolor: COLORS[index % COLORS.length] }} />
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" ml="auto">
                          {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>       
      </Box>

      {/* Recent Reports */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Recent Reports
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {recentReports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body2">No reports yet</Typography>
            </Box>
          ) : (
            recentReports.map((report, index) => (
              <Box key={report.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#f0f4f8', width: 36, height: 36, flexShrink: 0 }}>
                      <Report sx={{ color: '#d32f2f', fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{
                        maxWidth: { xs: 130, sm: 300 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {report.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.region?.name ?? report.region} — {report.created_at?.slice(0, 10)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    px: 1.5, py: 0.4, borderRadius: 10,
                    bgcolor: `${statusColor(report.status)}22`,
                    color: statusColor(report.status),
                    fontSize: 11, fontWeight: 'bold',
                    textTransform: 'capitalize',
                    flexShrink: 0, ml: 1
                  }}>
                    {report.status}
                  </Box>
                </Box>
                {index < recentReports.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </CardContent>
      </Card>

    </Box>
  );
}