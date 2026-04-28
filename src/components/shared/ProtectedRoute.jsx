import { Navigate } from 'react-router-dom';
import { Box, Skeleton, Stack } from '@mui/material';
import useAuth from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 10, px: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto' }}>
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
        </Stack>
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
