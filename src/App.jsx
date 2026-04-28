import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LandingPage from "./pages/landing/LandingPage";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ReportsList from "./pages/reports/ReportsList";
import CreateReport from "./pages/reports/CreateReport";
import ReportDetails from "./pages/reports/ReportDetails";
import AnimalsList from "./pages/animals/AnimalsList";
import AnimalForm from "./pages/animals/AnimalForm";
import VaccineSchedule from "./pages/vaccines/VaccineSchedule";
import DiseaseMap from "./pages/map/DiseaseMap";
import Notifications from "./pages/notifications/Notifications";
import Profile from './pages/profile/Profile';
// import AdminPanel from "./pages/admin/AdminPanel";

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h5" component="h1">
        {t("app.notFound")}
      </Typography>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>

          <Route index                      element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"           element={<Dashboard />} />
          <Route path="reports"             element={<ReportsList />} />
          <Route path="reports/create"      element={<CreateReport />} />
          <Route path="reports/:id"         element={<ReportDetails />} />
          <Route path="animals"             element={<AnimalsList />} />
          <Route path="animals/create"      element={<AnimalForm />} />
          <Route path="vaccines"            element={<VaccineSchedule />} />
          <Route path="map"                 element={<DiseaseMap />} />
          <Route path="notifications"       element={<Notifications />} />
          <Route path="profile"             element={<Profile />} />
          {/* <Route path="admin"               element={<AdminPanel />} /> */}
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
}