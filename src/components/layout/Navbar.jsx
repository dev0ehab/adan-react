import {
  AppBar, Toolbar, Typography, IconButton,
  Badge, Avatar, Box, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Pets,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function Navbar({ drawerWidth, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    <>
    </>
    }
    logout();
    toast.info('Logged out');
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 0.5, display: { sm: 'none' }}}
        >
          <MenuIcon /> 
        </IconButton>
        <Pets sx={{ color: 'primary.main', mr: 1, display: { xs: 'none', sm: 'block' }}} />
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          ADAN
        </Typography> 
        
          {/* npm run dev */}

        {/* Notifications badgeContent={3} */}
        <Tooltip title="Notifications" >
          <IconButton onClick={() => navigate('/app/notifications')}
            sx={{ mr: '8px' }}  >
            <Badge color="error" >
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar */}
        <Avatar
          sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, cursor: 'pointer' }}
          src={user?.avatar ?? user?.profile_photo_url ?? ''}
          onClick={() => navigate('/app/profile')}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Logout */}
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} sx={{ ml: 1 }}>
            <Logout />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}