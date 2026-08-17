'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const locationIcon = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 0 2px rgba(59,130,246,0.5);"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function CurrentLocationMarker() {
  const map = useMap();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    if (!isMobile || !navigator.geolocation) return;

    let marker: L.Marker | null = null;
    let cancelled = false;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        if (marker) {
          marker.setLatLng([latitude, longitude]);
        } else {
          marker = L.marker([latitude, longitude], { icon: locationIcon, zIndexOffset: 1000 }).addTo(map);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
    };
  }, [isMobile, map]);

  return null;
}
