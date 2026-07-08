'use client'

import dynamic from 'next/dynamic';
import type { CalendarDest } from './destinations-calendar';

const DestinationsCalendar = dynamic(
  () => import('./destinations-calendar').then((m) => m.DestinationsCalendar),
  { ssr: false },
);

export type { CalendarDest };

export function DestinationsCalendarClient({ destinations, isReadonly, preferredCurrency }: { destinations: CalendarDest[]; isReadonly?: boolean; preferredCurrency?: string }) {
  return <DestinationsCalendar destinations={destinations} isReadonly={isReadonly} preferredCurrency={preferredCurrency} />;
}
