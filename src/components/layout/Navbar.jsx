import { useEffect, useState, useCallback, startTransition } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  Tooltip,
  Popover,
  Button,
  Stack,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogContentText,
  // DialogActions,
  ButtonBase,
} from "@mui/material";
import {
  NotificationsRounded,
  PetsRounded,
  LogoutRounded,
  PersonRounded,
  AssignmentRounded,
  VaccinesRounded,
  // DeleteForeverRounded,
  TranslateRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import api from "../../api/axios";
import useNotifications from "../../hooks/useNotifications";
import NotificationsList from "../notifications/NotificationsList";
import { FCM_MESSAGE_EVENT } from "../shared/FcmListener";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  // const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  // const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const loadUnread = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      const n = res.data?.count ?? res.data?.data?.count ?? 0;
      setUnread(Number(n) || 0);
    } catch {
      setUnread(0);
    }
  }, []);

  const {
    notifications,
    loading,
    fetchNotifications,
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
  } = useNotifications({ fetchOnMount: false, onMutated: loadUnread });

  useEffect(() => {
    startTransition(() => {
      void loadUnread();
    });
    const id = setInterval(() => {
      startTransition(() => {
        void loadUnread();
      });
    }, 60000);
    const onFcm = () => {
      startTransition(() => {
        void loadUnread();
        void fetchNotifications();
      });
    };
    window.addEventListener(FCM_MESSAGE_EVENT, onFcm);
    return () => {
      clearInterval(id);
      window.removeEventListener(FCM_MESSAGE_EVENT, onFcm);
    };
  }, [loadUnread, fetchNotifications]);

  const handleBellClick = (event) => {
    if (notifAnchorEl) {
      setNotifAnchorEl(null);
      return;
    }
    setProfileMenuAnchor(null);
    setNotifAnchorEl(event.currentTarget);
    void fetchNotifications();
  };

  const closeNotifications = () => {
    setNotifAnchorEl(null);
  };

  const closeProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* optional endpoint */
    }
    logout();
    toast.info(t("toasts.signedOut"));
    navigate("/login");
  };

  const navigateFromMenu = (path) => {
    closeProfileMenu();
    navigate(path);
  };

  // const handleDeleteAccount = async () => {
  //   setDeleteAccountLoading(true);
  //   try {
  //     await api.delete('/auth/account');
  //     setDeleteAccountOpen(false);
  //     try {
  //       await api.post('/auth/logout');
  //     } catch {
  //       /* ignore */
  //     }
  //     logout();
  //     toast.success(t('toasts.accountDeleted'));
  //     navigate('/login');
  //   } catch {
  //     toast.error(t('toasts.deleteAccountFailed'));
  //   } finally {
  //     setDeleteAccountLoading(false);
  //   }
  // };

  const setLanguage = (lng) => {
    void i18n.changeLanguage(lng);
    closeProfileMenu();
  };

  const unreadInList = notifications.filter((n) => !n.read_at).length;
  const notifPopoverOpen = Boolean(notifAnchorEl);
  const profileMenuOpen = Boolean(profileMenuAnchor);
  const isAr = i18n.language?.startsWith("ar");

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: "100%",
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
        <ButtonBase
          onClick={() => navigate("/app/dashboard")}
          aria-label={t("nav.goHome")}
          sx={{
            flexGrow: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 1,
            py: 0.5,
            px: 0.75,
            mr: 1,
            borderRadius: 2,
            textAlign: "left",
            color: "inherit",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "primary.light",
              color: "primary.dark",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <PetsRounded sx={{ fontSize: 22 }} />
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ letterSpacing: "-0.02em" }}
          >
            {t("brand.name")}
          </Typography>
        </ButtonBase>

        <Tooltip title={t("nav.notifications")}>
          <IconButton
            onClick={handleBellClick}
            sx={{ color: "text.secondary" }}
            aria-label={t("nav.notifications")}
            aria-expanded={notifPopoverOpen}
            aria-haspopup="dialog"
          >
            <Badge
              color="error"
              badgeContent={unread}
              invisible={unread === 0}
              max={99}
            >
              <NotificationsRounded />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title={t("nav.accountMenu")}>
          <IconButton
            onClick={(e) => {
              setNotifAnchorEl(null);
              setProfileMenuAnchor(e.currentTarget);
            }}
            sx={{
              p: 0.25,
              border: "2px solid",
              borderColor: "background.default",
              borderRadius: "50%",
            }}
            aria-label={t("nav.accountMenu")}
            aria-haspopup="true"
            aria-expanded={profileMenuOpen}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: 15,
              }}
              src={user?.avatar ?? user?.profile_photo_url ?? ""}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={profileMenuAnchor}
          open={profileMenuOpen}
          onClose={closeProfileMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: { minWidth: 240, mt: 1, borderRadius: 2 },
            },
          }}
        >
          <MenuItem onClick={() => navigateFromMenu("/app/profile")}>
            <ListItemIcon>
              <PersonRounded fontSize="small" />
            </ListItemIcon>
            {t("nav.profile")}
          </MenuItem>
          <MenuItem onClick={() => navigateFromMenu("/app/animals")}>
            <ListItemIcon>
              <PetsRounded fontSize="small" />
            </ListItemIcon>
            {t("nav.myAnimals")}
          </MenuItem>
          <MenuItem onClick={() => navigateFromMenu("/app/vaccines")}>
            <ListItemIcon>
              <VaccinesRounded fontSize="small" />
            </ListItemIcon>
            {t("nav.vaccines")}
          </MenuItem>
          <MenuItem onClick={() => navigateFromMenu("/app/reports")}>
            <ListItemIcon>
              <AssignmentRounded fontSize="small" />
            </ListItemIcon>
            {t("nav.myReports")}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <Box
            sx={{
              px: 2,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TranslateRounded sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.06 }}
            >
              {t("nav.language")}
            </Typography>
          </Box>
          <MenuItem dense onClick={() => setLanguage("en")} selected={!isAr}>
            {t("nav.english")}
          </MenuItem>
          <MenuItem dense onClick={() => setLanguage("ar")} selected={isAr}>
            {t("nav.arabic")}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              closeProfileMenu();
              void handleLogout();
            }}
          >
            <ListItemIcon>
              <LogoutRounded fontSize="small" />
            </ListItemIcon>
            {t("nav.logOut")}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          {/* <MenuItem
            onClick={() => {
              closeProfileMenu();
              setDeleteAccountOpen(true);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteForeverRounded fontSize="small" color="error" />
            </ListItemIcon>
            {t('nav.deleteAccount')}
          </MenuItem> */}
        </Menu>
      </Toolbar>

      <Popover
        open={notifPopoverOpen}
        anchorEl={notifAnchorEl}
        onClose={closeNotifications}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: "min(100vw - 24px, 400px)",
              mt: 1,
              borderRadius: 2,
              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "min(72vh, 440px)",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="subtitle1" fontWeight={800}>
              {t("nav.notifications")}
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadInList === 0}
              sx={{ fontWeight: 700, borderRadius: 999, textTransform: "none" }}
            >
              {t("nav.clearNew")}
            </Button>
          </Box>

          <Box sx={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {loading ? (
              <Stack spacing={1} sx={{ p: 2 }}>
                {[1, 2, 3].map((k) => (
                  <Skeleton key={k} variant="rounded" height={72} />
                ))}
              </Stack>
            ) : (
              <NotificationsList
                items={notifications}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                emptyPaddingY={3}
              />
            )}
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Button
              fullWidth
              size="small"
              variant="text"
              sx={{ fontWeight: 700, textTransform: "none" }}
              onClick={() => {
                closeNotifications();
                navigate("/app/notifications");
              }}
            >
              {t("nav.openFullHistory")}
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* <Dialog
        open={deleteAccountOpen}
        onClose={() => !deleteAccountLoading && setDeleteAccountOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 800 }}>{t('navDelete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('navDelete.body')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteAccountOpen(false)} disabled={deleteAccountLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteAccount()}
            disabled={deleteAccountLoading}
            sx={{ fontWeight: 800 }}
          >
            {deleteAccountLoading ? t('navDelete.deleting') : t('navDelete.confirm')}
          </Button>
        </DialogActions>
      </Dialog> */}
    </AppBar>
  );
}
