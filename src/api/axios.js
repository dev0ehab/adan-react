import axios from 'axios';
import i18n from '../i18n/config';

/** Prefer VITE_API_URL in .env; dev server defaults to local Laravel (Valet). */
function resolveApiBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://adan.test/api';
  return 'https://lightgray-marten-830794.hostingersite.com/api';
}
 
const api = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 10000,
});

function resolveRequestLocale() {
  const raw = (i18n.language || localStorage.getItem('adan_language') || 'en').toString();
  const base = raw.split('-')[0].toLowerCase();
  return base === 'ar' ? 'ar' : 'en';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const locale = resolveRequestLocale();
  config.headers['X-Locale'] = locale;
  config.headers['Accept-Language'] = locale;
  return config;
});

i18n.on('languageChanged', (lng) => {
  const base = (lng || 'en').toString().split('-')[0].toLowerCase();
  api.defaults.headers.common['X-Locale'] = base === 'ar' ? 'ar' : 'en';
  api.defaults.headers.common['Accept-Language'] = api.defaults.headers.common['X-Locale'];
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;