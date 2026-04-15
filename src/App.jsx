import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
          <Route path="animals/edit/:id"    element={<AnimalForm />} />
          <Route path="vaccines"            element={<VaccineSchedule />} />
          <Route path="map"                 element={<DiseaseMap />} />
          <Route path="notifications"       element={<Notifications />} />
          <Route path="profile"             element={<Profile />} />
          {/* <Route path="admin"               element={<AdminPanel />} /> */}
        </Route>
        
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}