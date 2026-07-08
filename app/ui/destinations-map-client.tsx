'use client'

import dynamic from 'next/dynamic';
import type { MapDest } from './destinations-map';

const DestinationsMap = dynamic(() => import('./destinations-map').then((m) => m.DestinationsMap), { ssr: false });

export type { MapDest };

export function DestinationsMapClient({ destinations, className, preferredCurrency }: { destinations: MapDest[]; className?: string; preferredCurrency?: string }) {
  return <DestinationsMap destinations={destinations} className={className} preferredCurrency={preferredCurrency} />;
}
