import {
  ReportRounded,
  MapRounded,
  VaccinesRounded,
  NotificationsRounded,
  ShieldRounded,
  GroupsRounded,
} from '@mui/icons-material';

/** Step ids — copy lives in `landing.steps.{id}` */
export const STEP_IDS = ['tell', 'listen', 'informed'];

/** Feature ids — copy in `landing.features.{id}` */
export const FEATURE_METAS = [
  { id: 'report', icon: <ReportRounded />, color: '#c45c52', bg: 'rgba(196, 92, 82, 0.1)' },
  { id: 'map', icon: <MapRounded />, color: '#4a90a4', bg: 'rgba(74, 144, 164, 0.1)' },
  { id: 'vaccines', icon: <VaccinesRounded />, color: '#4a7c59', bg: 'rgba(74, 124, 89, 0.12)' },
  { id: 'notifications', icon: <NotificationsRounded />, color: '#c4a77d', bg: 'rgba(196, 167, 125, 0.15)' },
  { id: 'shield', icon: <ShieldRounded />, color: '#5c6b62', bg: 'rgba(92, 107, 98, 0.08)' },
  { id: 'community', icon: <GroupsRounded />, color: '#4a7c59', bg: 'rgba(74, 124, 89, 0.08)' },
];

/** Banner ids — copy in `landing.banners.{id}` */
export const LANDING_BANNER_METAS = [
  {
    id: 'report',
    path: '/app/reports/create',
    requireAuth: true,
    fallbackPath: '/register', 
    image:
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&h=500&q=80',
  },
  {
    id: 'vaccines',
    path: '/app/vaccines',
    requireAuth: true,
    fallbackPath: '/register',
    image:
      'https://media.egyin.com/2025/6/large/17531635564634202506280458195819.jpg',
  },
  {
    id: 'map',
    path: '/app/map',
    requireAuth: true,
    fallbackPath: '/register',
    image:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&h=500&q=80',
  },
];
