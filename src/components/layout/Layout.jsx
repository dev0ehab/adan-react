import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 240;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={() => setMobileOpen(!mobileOpen)}
      />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{
        flexGrow: 1,
        px: { xs: 1, sm: 2 },
        py: 2,
        mt: 8,
        minHeight: '100vh',
        bgcolor: '#f0f4f8',
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        overflowX: 'hidden',
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}