import L from 'leaflet'; 

export function ensureLeafletDefaultIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export function reportStatusColor(status) {
  if (status === 'confirmed') return '#b85c54';
  if (status === 'pending') return '#c9a227';
  if (status === 'resolved') return '#3d8b63';
  return '#8a9b91';
}

export function mapPinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
    width: 14px; height: 14px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function mapPreviewHeight() {
  if (typeof window === 'undefined') return 320;
  return window.innerWidth < 600 ? 280 : 400;
}
