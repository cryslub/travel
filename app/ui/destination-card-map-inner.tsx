'use client'

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

delete (L.Icon.Default.prototype as any)._getIconUrl;

type MarkerCategory = 'event' | 'accommodation' | 'transport';
type MarkerDef = { lat: number; lon: number; label: string | null; category: MarkerCategory; eventType?: string | null; transportType?: string | null };

const categoryColors: Record<MarkerCategory, string> = {
  event: '#3b82f6',
  accommodation: '#22c55e',
  transport: '#f97316',
};

const svgPaths: Record<string, string> = {
  Site: 'M12 6.5c1.38 0 2.5 1.12 2.5 2.5 0 1.38-1.12 2.5-2.5 2.5S9.5 10.38 9.5 9c0-1.38 1.12-2.5 2.5-2.5M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 15c-1.87-2.34-5-6.51-5-8 0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.49-3.13 5.66-5 8z',
  Meal: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
  Tour: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
  Activity: 'm22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28z',
  Transfer: 'M19.71 9.71 22 12V6h-6l2.29 2.29-4.17 4.17c-.39.39-1.02.39-1.41 0l-1.17-1.17c-1.17-1.17-3.07-1.17-4.24 0L2 16.59 3.41 18l5.29-5.29c.39-.39 1.02-.39 1.41 0l1.17 1.17c1.17 1.17 3.07 1.17 4.24 0z',
  accommodation: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z',
  transport: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
  Flight: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
  Train: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zm0 2c3.51 0 5.4.49 5.93 1H6.07C6.6 4.49 8.49 4 12 4zM6 7h5v3H6V7zm12 8.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V12h12v3.5zm0-5.5h-5V7h5v3z',
  Bus: 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z',
  Car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  Ferry: 'M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z',
  Combined: 'M19.71 9.71 22 12V6h-6l2.29 2.29-4.17 4.17c-.39.39-1.02.39-1.41 0l-1.17-1.17c-1.17-1.17-3.07-1.17-4.24 0L2 16.59 3.41 18l5.29-5.29c.39-.39 1.02-.39 1.41 0l1.17 1.17c1.17 1.17 3.07 1.17 4.24 0z',
};

function createIcon(category: MarkerCategory, eventType?: string | null, transportType?: string | null) {
  const color = categoryColors[category];
  let pathKey: string;
  if (category === 'event' && eventType) pathKey = eventType;
  else if (category === 'transport' && transportType) pathKey = transportType;
  else pathKey = category;
  const path = svgPaths[pathKey] ?? svgPaths[category];
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="${path}"/></svg></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function ClusteredMarkers({ markers }: { markers: MarkerDef[] }) {
  const map = useMap();
  useEffect(() => {
    const cluster = (L as any).markerClusterGroup({ maxClusterRadius: 20 });
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lon], { icon: createIcon(m.category, m.eventType, m.transportType) });
      if (m.label) marker.bindPopup(m.label);
      marker.addTo(cluster);
    });
    map.addLayer(cluster);
    return () => { map.removeLayer(cluster); };
  }, [map, markers]);
  return null;
}

function FitBounds({ points, fallback }: { points: [number, number][]; fallback: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(fallback, 10);
    } else if (points.length === 1) {
      map.setView(points[0], 10);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
    }
  }, [map, points, fallback]);
  return null;
}

function SyncMapHeight({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.height = isFullscreen ? '100vh' : '200px';
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [isFullscreen, map]);
  return null;
}

export function DestinationCardMapInner({
  lat,
  lon,
  eventMarkers = [],
  accommodationMarker,
  transportEndMarker,
  transportStartMarker,
}: {
  lat: number;
  lon: number;
  eventMarkers?: { lat: number; lon: number; name: string | null; type: string | null }[];
  accommodationMarker?: { lat: number; lon: number; name: string | null } | null;
  transportEndMarker?: { lat: number; lon: number; name: string | null; type?: string | null } | null;
  transportStartMarker?: { lat: number; lon: number; name: string | null; type?: string | null } | null;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  const markers = useMemo<MarkerDef[]>(() => [
    ...eventMarkers.map((m) => ({ lat: m.lat, lon: m.lon, label: m.name, category: 'event' as MarkerCategory, eventType: m.type })),
    ...(accommodationMarker ? [{ lat: accommodationMarker.lat, lon: accommodationMarker.lon, label: accommodationMarker.name, category: 'accommodation' as MarkerCategory }] : []),
    ...(transportEndMarker ? [{ lat: transportEndMarker.lat, lon: transportEndMarker.lon, label: transportEndMarker.name, category: 'transport' as MarkerCategory, transportType: transportEndMarker.type }] : []),
    ...(transportStartMarker ? [{ lat: transportStartMarker.lat, lon: transportStartMarker.lon, label: transportStartMarker.name, category: 'transport' as MarkerCategory, transportType: transportStartMarker.type }] : []),
  ], [eventMarkers, accommodationMarker, transportEndMarker, transportStartMarker]);

  const allPoints = useMemo<[number, number][]>(
    () => markers.map((m) => [m.lat, m.lon]),
    [markers],
  );

  const fallback = useMemo<[number, number]>(() => [lat, lon], [lat, lon]);

  return (
    <div
      className="relative"
      style={isFullscreen ? { position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' } : undefined}
    >
      <MapContainer
        center={[lat, lon]}
        zoom={10}
        style={{ height: isFullscreen ? '100vh' : '200px' }}
        className={isFullscreen ? '' : 'rounded-lg border border-zinc-200 dark:border-zinc-700'}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClusteredMarkers markers={markers} />
        <FitBounds points={allPoints} fallback={fallback} />
        <SyncMapHeight isFullscreen={isFullscreen} />
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
