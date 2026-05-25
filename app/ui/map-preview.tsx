'use client'

import { useEffect, useRef, useState } from 'react';
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

function InvalidateOnFullscreen() {
  const map = useMap();
  useEffect(() => {
    function handle() { setTimeout(() => map.invalidateSize(), 100); }
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, [map]);
  return null;
}

export function MapPreview({ lat, lon, markerLat, markerLon, onLocationPick }: { lat: number; lon: number; markerLat?: number | null; markerLon?: number | null; onLocationPick?: (lat: number, lon: number) => void }) {
  const hasMarker = markerLat != null && markerLon != null;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handle() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <>
      <style>{`
        .mp-wrapper:-webkit-full-screen { height: 100%; }
        .mp-wrapper:fullscreen { height: 100%; }
        .mp-wrapper:-webkit-full-screen .leaflet-container { height: 100% !important; }
        .mp-wrapper:fullscreen .leaflet-container { height: 100% !important; }
      `}</style>
      <div ref={wrapperRef} className="mp-wrapper relative">
        <MapContainer
          center={[lat, lon]}
          zoom={10}
          style={{ height: '200px', cursor: onLocationPick ? 'crosshair' : undefined }}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {hasMarker && <Marker position={[markerLat, markerLon]} />}
          <FlyTo lat={lat} lon={lon} />
          {onLocationPick && <MapClickHandler onLocationPick={onLocationPick} />}
          <InvalidateOnFullscreen />
        </MapContainer>
        <button
          type="button"
          onClick={toggleFullscreen}
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
    </>
  );
}
