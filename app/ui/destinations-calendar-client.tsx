'use client'

import dynamic from 'next/dynamic';
import type { CalendarDest } from './destinations-calendar';

const DestinationsCalendar = dynamic(
  () => import('./destinations-calendar').then((m) => m.DestinationsCalendar),
  { ssr: false },
);

export type { CalendarDest };

export function DestinationsCalendarClient({ destinations, isReadonly, preferredCurrency, defaultCalendarView, journeyStartDate, journeyEndDate }: { destinations: CalendarDest[]; isReadonly?: boolean; preferredCurrency?: string; defaultCalendarView?: string; journeyStartDate?: string | null; journeyEndDate?: string | null }) {
  return <DestinationsCalendar destinations={destinations} isReadonly={isReadonly} preferredCurrency={preferredCurrency} defaultCalendarView={defaultCalendarView} journeyStartDate={journeyStartDate} journeyEndDate={journeyEndDate} />;
}
