import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { ensureLeafletDefaultIcons, mapPinIcon, reportStatusColor, mapPreviewHeight } from '../../utils/leafletIcons';

export default function MapPreview({ reports = [] }) {
  useEffect(() => {
    ensureLeafletDefaultIcons();
  }, []);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
        <MapContainer
          center={[26.8206, 30.8025]}
          zoom={6}
          style={{ height: mapPreviewHeight(), width: '100%', borderRadius: 12 }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          {reports.map((report) => (
            <React.Fragment key={report.id}>
              {report.latitude && report.longitude && (
                <>
                  <Circle
                    center={[report.latitude, report.longitude]}
                    radius={12000}
                    pathOptions={{
                      color: reportStatusColor(report.status),
                      fillColor: reportStatusColor(report.status),
                      fillOpacity: 0.12,
                    }}
                  />
                  <Marker
                    position={[report.latitude, report.longitude]}
                    icon={mapPinIcon(reportStatusColor(report.status))}
                  >
                    <Popup>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {report.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.region?.name ?? report.region}
                      </Typography>
                    </Popup>
                  </Marker>
                </>
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
