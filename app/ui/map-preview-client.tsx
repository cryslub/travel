'use client'

import dynamic from 'next/dynamic';

const Preview = dynamic(() => import('./map-preview').then((m) => m.MapPreview), { ssr: false });

export function MapPreviewClient({ lat, lon }: { lat: number; lon: number }) {
  return <Preview lat={lat} lon={lon} />;
}
