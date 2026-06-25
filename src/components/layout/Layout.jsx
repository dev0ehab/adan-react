import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1, 
          width: '100%',
          maxWidth: '100%',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
          pb: { xs: 3, sm: 3 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
