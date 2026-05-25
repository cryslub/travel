'use client'

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onLocationPick }: { onLocationPick: (lat: number, lon: number) => void }) {
  useMapEvents({ click(e) { onLocationPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

function InvalidateSize({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

export function MapPreview({ lat, lon, markerLat, markerLon, onLocationPick }: { lat: number; lon: number; markerLat?: number | null; markerLon?: number | null; onLocationPick?: (lat: number, lon: number) => void }) {
  const hasMarker = markerLat != null && markerLon != null;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  return (
    <div
      className="relative"
      style={isFullscreen ? { position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' } : { height: '200px' }}
    >
      <MapContainer
        center={[lat, lon]}
        zoom={10}
        style={{ height: '100%', cursor: onLocationPick ? 'crosshair' : undefined }}
        className={isFullscreen ? '' : 'rounded-lg border border-zinc-200 dark:border-zinc-700'}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {hasMarker && <Marker position={[markerLat, markerLon]} />}
        <FlyTo lat={lat} lon={lon} />
        {onLocationPick && <MapClickHandler onLocationPick={onLocationPick} />}
        <InvalidateSize trigger={isFullscreen} />
      </MapContainer>
      <button
        type="button"
        onClick={() => setIsFullscreen(v => !v)}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        className="absolute top-2 right-2 z-[1000] rounded bg-white p-1 shadow hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
