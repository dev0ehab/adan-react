import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/config';
import App from './App';
import AuthProvider from './context/AuthProvider';
import ThemeDirectionBridge from './components/layout/ThemeDirectionBridge';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeDirectionBridge>
    <AuthProvider>
      <App />
      <ToastContainer position="top-center" autoClose={3200} hideProgressBar />
    </AuthProvider>
  </ThemeDirectionBridge>,
);