import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MyLocationRounded, PlaceRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ensureLeafletDefaultIcons } from '../../utils/leafletIcons';

const DEFAULT_CENTER = [26.8206, 30.8025];
const DEFAULT_ZOOM = 6;
const PICKED_ZOOM = 12;

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function LocationMapPicker({ latitude, longitude, onChange, height = 280 }) {
  const { t } = useTranslation();
  const [focusCenter, setFocusCenter] = useState(null);

  useEffect(() => {
    ensureLeafletDefaultIcons();
  }, []);

  const hasPin = latitude !== '' && longitude !== '' && latitude != null && longitude != null;
  const lat = hasPin ? Number(latitude) : null;
  const lng = hasPin ? Number(longitude) : null;
  const pinValid = hasPin && Number.isFinite(lat) && Number.isFinite(lng);

  const markerPosition = useMemo(() => (pinValid ? [lat, lng] : null), [pinValid, lat, lng]);

  const setPin = (nextLat, nextLng, shouldFly = true) => {
    onChange({
      latitude: nextLat.toFixed(6),
      longitude: nextLng.toFixed(6),
    });
    if (shouldFly) setFocusCenter([nextLat, nextLng]);
  };

  const clearPin = () => {
    onChange({ latitude: '', longitude: '' });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPin(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {t('createReport.mapPickHint')}
      </Typography>

      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          '& .leaflet-container': { cursor: 'crosshair' },
        }}
      >
        <MapContainer
          center={markerPosition ?? DEFAULT_CENTER}
          zoom={markerPosition ? PICKED_ZOOM : DEFAULT_ZOOM}
          style={{ height, width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <MapClickHandler onPick={(pickLat, pickLng) => setPin(pickLat, pickLng, true)} />
          {focusCenter && <FlyTo center={focusCenter} zoom={PICKED_ZOOM} />}
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat: dragLat, lng: dragLng } = e.target.getLatLng();
                  setPin(dragLat, dragLng, false);
                },
              }}
            />
          )}
        </MapContainer>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<MyLocationRounded />}
          onClick={useMyLocation}
          sx={{ fontWeight: 700 }}
        >
          {t('createReport.mapUseMyLocation')}
        </Button>
        {pinValid && (
          <Button variant="text" size="small" onClick={clearPin} sx={{ fontWeight: 700 }}>
            {t('createReport.mapClearPin')}
          </Button>
        )}
      </Stack>

      {pinValid && (
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
          <PlaceRounded sx={{ fontSize: 18 }} />
          <Typography variant="caption" fontWeight={700}>
            {t('createReport.mapPickSelected', { lat: lat.toFixed(5), lng: lng.toFixed(5) })}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
