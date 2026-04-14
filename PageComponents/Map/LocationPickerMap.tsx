import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents, LayersControl, FeatureGroup, Circle } from 'react-leaflet';
import { useMantineTheme } from '@mantine/core';

export type LatLng = { lat: number; lng: number };

type LocationPickerMapProps = {
  initialCenter?: LatLng | null; // preferred center to start at
  initialZoom?: number;
  value?: LatLng | null; // currently selected value
  onChange?: (pos: LatLng | null) => void; // called when user picks a point
};

function ClickToPlaceMarker({ value, onChange }: { value: LatLng | null; onChange?: (pos: LatLng | null) => void }) {
  const [pos, setPos] = useState<LatLng | null>(value ?? null);
  useEffect(() => {
    setPos(value ?? null);
  }, [value]);

  useMapEvents({
    click(e) {
      const p = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPos(p);
      onChange?.(p);
    },
  });

  if (!pos) return null;
  return (
    <Marker
      position={pos as any}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const m = e.target;
          const { lat, lng } = m.getLatLng();
          const p = { lat, lng };
          setPos(p);
          onChange?.(p);
        },
      }}
    />
  );
}

const DefaultCenter: LatLng = { lat: -26.1469, lng: 28.036 }; // SC HQ

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ initialCenter, initialZoom = 15, value, onChange }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const center = useMemo(() => initialCenter ?? DefaultCenter, [initialCenter]);

  if (!mounted) return null;
  return (
    <MapContainer
      center={[center.lat, center.lng] as any}
      zoom={initialZoom}
      style={{ height: '70dvh', width: '100%' }}
      scrollWheelZoom
      maxZoom={18}
    >
      <LayersControl position="topright">
        {/* Main OpenStreetMap */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; ServCraft | 2025 &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        {/* Satellite View */}
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
        </LayersControl.BaseLayer>

        {/* Dark Theme */}
        <LayersControl.BaseLayer name="Dark">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        </LayersControl.BaseLayer>

        {/* Light Theme */}
        <LayersControl.BaseLayer name="Light">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        </LayersControl.BaseLayer>

        {/* Topographic */}
        <LayersControl.BaseLayer name="Topographic">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <ClickToPlaceMarker value={value ?? null} onChange={onChange} />
    </MapContainer>
  );
};

export default LocationPickerMap;
