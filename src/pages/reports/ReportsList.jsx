import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip,
  TextField, InputAdornment, Avatar
} from '@mui/material';
import {
  Add, Search, Visibility, Report
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusColor = (status) => {
  if (status === 'confirmed') return 'success';
  if (status === 'pending')   return 'warning';
  if (status === 'resolved')  return 'info';
  return 'default';
};

export default function ReportsList() {
  const navigate = useNavigate();
  const [reports, setReports]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [, setLoading]   = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res  = await api.get('/reports');
        const data = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setReports(list);
        setFiltered(list);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const result = reports.filter(r =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.region?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.region?.toLowerCase()?.includes(search.toLowerCase())
    );
    setFiltered(result);
    setPage(0);
  }, [search, reports]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Disease Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/app/reports/create")}
          sx={{ borderRadius: 2 }}
        >
          New Report
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>

          {/* Search */}
          <TextField
            placeholder="Search by title or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2, maxWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Table */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><b>id</b></TableCell>
                  <TableCell><b>Title</b></TableCell>
                  <TableCell><b>Region</b></TableCell>
                  <TableCell sx={{ display: {md: 'table-cell' } }}>
                    <b>Description</b>
                  </TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell sx={{ display: {sm: 'table-cell' } }}>
                    <b>Date</b>
                  </TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report, index) => (
                    <TableRow key={report.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#ffebee', width: 28, height: 28, flexShrink: 0 }}>
                            <Report sx={{ color: '#d32f2f', fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{
                            maxWidth: { xs: 100, sm: 200 },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {report.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {report.region?.name ?? report.region}
                      </TableCell>
                      <TableCell sx={{ display: {md: 'table-cell' }, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.description}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={statusColor(report.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { sm: 'table-cell' } }}>
                        {report.created_at?.slice(0, 10)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/app/reports/${report.id}`)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No reports found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />

        </CardContent>
      </Card>
    </Box>
  );
}