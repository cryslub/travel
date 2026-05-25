'use client'

import dynamic from 'next/dynamic';

const CardMap = dynamic(() => import('./destination-card-map-inner').then((m) => m.DestinationCardMapInner), { ssr: false });

export function DestinationCardMap({
  lat,
  lon,
  eventMarkers,
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
  return <CardMap lat={lat} lon={lon} eventMarkers={eventMarkers as { lat: number; lon: number; name: string | null; type: string | null }[]} accommodationMarker={accommodationMarker} transportEndMarker={transportEndMarker} transportStartMarker={transportStartMarker} />;
}
