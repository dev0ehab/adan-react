import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Report,
  Pets,
  Vaccines,
  Map,
  Notifications,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Home as HomeIcon } from "@mui/icons-material";
import { Person } from "@mui/icons-material";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Home", icon: <HomeIcon />, path: "/" },
  { label: "My Profile", icon: <Person />, path: "/app/profile" },
  { label: "Dashboard", icon: <Dashboard />, path: "/app/dashboard" },
  { label: "Disease Reports", icon: <Report />, path: "/app/reports" },
  { label: "My Animals", icon: <Pets />, path: "/app/animals" },
  { label: "Vaccines", icon: <Vaccines />, path: "/app/vaccines" },
  { label: "Disease Map", icon: <Map />, path: "/app/map" },
  { label: "Notifications", icon: <Notifications />, path: "/app/notifications"},
];

 const adminItems = [   { label: "Admin Panel", icon: <AdminPanelSettings />, path: "/app/admin" },
 ];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const DrawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2.5, bgcolor: "primary.main", color: "white" }}>
        <Typography variant="h6" fontWeight="bold">
          ADAN
        </Typography>
        <Typography variant="caption">Animal Disease Alert Network</Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: "#f5f5f5" }}>
        <Typography variant="body2" fontWeight="bold" noWrap>
          {user?.name}
        </Typography>
        <Chip
          label={user?.role === "doctor" ? "Veterinarian" : "Breeder"}
          size="small"
          color={user?.role === "doctor" ? "success" : "primary"}
          sx={{ mt: 0.5, fontSize: 11 }}
        />
      </Box>

      <Divider />

      {/* Nav Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "text.secondary",
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>



        {user?.role === "doctor" && (
        <>
          <Divider />
          <List sx={{ pb: 1 }}>
            {adminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      mt: 0.5,
                      bgcolor: isActive ? "primary.main" : "transparent",
                      color: isActive ? "white" : "text.primary",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "white" : "text.secondary",
                        minWidth: 36,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {DrawerContent}
      </Drawer>
    </Box>
  );
}
