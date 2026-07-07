'use client'

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useRef, useState, useMemo } from 'react';
import {
  calendarUpdateDestinationDate,
  calendarUpdateEventTimes,
  calendarUpdateTransportTimes,
} from '@/app/journeys/[id]/destinations/actions';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { ModalDest, DestinationModal } from './destinations-map';

export type CalendarDest = ModalDest;

const VIEWS = [
  { key: 'dayGridMonth', Icon: CalendarMonthOutlinedIcon },
  { key: 'timeGridWeek', Icon: ViewWeekOutlinedIcon },
  { key: 'timeGridDay',  Icon: ViewDayOutlinedIcon },
  { key: 'listWeek',     Icon: ViewListOutlinedIcon },
] as const;

export function DestinationsCalendar({ destinations, isReadonly }: { destinations: CalendarDest[]; isReadonly?: boolean }) {
  const calendarRef = useRef<FullCalendar>(null);
  const [activeView, setActiveView] = useState<string>('dayGridMonth');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [selectedDest, setSelectedDest] = useState<ModalDest | null>(null);

  const calendarEvents = useMemo(() => {
    const result: { id: string; title: string; start: string; end?: string; allDay?: boolean; color: string; extendedProps?: Record<string, unknown> }[] = [];
    for (const dest of destinations) {
      if (dest.start_date) {
        result.push({ id: `dest-${dest.id}`, title: dest.name, start: dest.start_date, allDay: true, color: '#6366f1', extendedProps: { transportStartTime: dest.transport?.start_time ?? '' } });
      }
      for (const ev of dest.events) {
        if (ev.start_time) {
          result.push({ id: `ev-${ev.id}`, title: ev.name ?? dest.name, start: ev.start_time, end: ev.end_time ?? undefined, color: '#3b82f6' });
        }
      }
      if (dest.transport?.start_time) {
        result.push({
          id: `tr-${dest.id}`,
          title: `${dest.transport.type ?? 'Transport'} → ${dest.name}`,
          start: dest.transport.start_time,
          end: dest.transport.end_time ?? undefined,
          color: '#f97316',
        });
      }
    }
    return result;
  }, [destinations]);

  const initialDate = useMemo(() => {
    const dates = destinations.flatMap((d) => [
      d.start_date,
      ...d.events.map((e) => e.start_time?.slice(0, 10) ?? null),
      d.transport?.start_time?.slice(0, 10) ?? null,
    ]).filter(Boolean) as string[];
    return dates.sort()[0] ?? undefined;
  }, [destinations]);

  function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function toTimeStr(d: Date) {
    return `${toDateStr(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async function handleEventChange(info: { event: { id: string; start: Date | null; end: Date | null; allDay: boolean }; revert: () => void }) {
    const { id, start, end } = info.event;
    if (!start) { info.revert(); return; }
    try {
      if (id.startsWith('dest-')) {
        await calendarUpdateDestinationDate(id.slice(5), toDateStr(start));
      } else if (id.startsWith('ev-')) {
        await calendarUpdateEventTimes(id.slice(3), toTimeStr(start), end ? toTimeStr(end) : null);
      } else if (id.startsWith('tr-')) {
        await calendarUpdateTransportTimes(id.slice(3), toTimeStr(start), end ? toTimeStr(end) : null);
      }
    } catch {
      info.revert();
    }
  }

  function handleEventClick(info: { event: { id: string } }) {
    const { id } = info.event;
    let dest: ModalDest | undefined;
    if (id.startsWith('dest-')) {
      dest = destinations.find((d) => d.id === id.slice(5));
    } else if (id.startsWith('ev-')) {
      const evId = id.slice(3);
      dest = destinations.find((d) => d.events.some((e) => e.id === evId));
    } else if (id.startsWith('tr-')) {
      dest = destinations.find((d) => d.id === id.slice(3));
    }
    if (dest) setSelectedDest(dest);
  }

  function changeView(viewKey: string) {
    calendarRef.current?.getApi().changeView(viewKey);
    setActiveView(viewKey);
  }

  const btnBase = 'px-3 py-2 transition-colors';
  const active = 'bg-black text-white dark:bg-white dark:text-black';
  const inactive = 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';
  const divider = 'border-l border-zinc-200 dark:border-zinc-700';

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        {/* Row 1: view buttons + nav buttons */}
        <div className="flex items-center justify-between">
          <div className="flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
            {VIEWS.map(({ key, Icon }, i) => (
              <button
                key={key}
                type="button"
                onClick={() => changeView(key)}
                className={`${i > 0 ? divider : ''} ${btnBase} ${activeView === key ? active : inactive}${key === 'timeGridWeek' ? ' hidden sm:block' : ''}`}
              >
                <Icon fontSize="small" />
              </button>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
            <button type="button" onClick={() => calendarRef.current?.getApi().prev()} className={`${btnBase} ${inactive}`}>
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button type="button" onClick={() => calendarRef.current?.getApi().today()} className={`${divider} ${btnBase} ${inactive}`}>
              <TodayIcon fontSize="small" />
            </button>
            <button type="button" onClick={() => calendarRef.current?.getApi().next()} className={`${divider} ${btnBase} ${inactive}`}>
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>
        </div>
        {/* Row 2: title */}
        <h2 className="mt-3 mb-4 text-center text-lg sm:text-2xl font-semibold text-zinc-800 dark:text-zinc-100">{calendarTitle}</h2>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={initialDate}
          events={calendarEvents}
          height="auto"
          locale={navigator.language}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          headerToolbar={false}
          datesSet={(arg) => setCalendarTitle(arg.view.title)}
          eventOrder={(a: unknown, b: unknown) => {
            const ea = a as { allDay: boolean; start: unknown; extendedProps: Record<string, unknown> };
            const eb = b as { allDay: boolean; start: unknown; extendedProps: Record<string, unknown> };
            if (ea.allDay && eb.allDay) {
              const aTime = (ea.extendedProps?.transportStartTime as string) ?? '';
              const bTime = (eb.extendedProps?.transportStartTime as string) ?? '';
              return aTime.localeCompare(bTime);
            }
            if (!ea.allDay && !eb.allDay) {
              const aMs = ea.start ? new Date(ea.start as never).getTime() : 0;
              const bMs = eb.start ? new Date(eb.start as never).getTime() : 0;
              return aMs - bMs;
            }
            return 0;
          }}
          editable={!isReadonly}
          eventDrop={isReadonly ? undefined : handleEventChange}
          eventResize={isReadonly ? undefined : handleEventChange}
          eventClick={handleEventClick}
        />
      </div>
      {selectedDest && (
        <DestinationModal dest={selectedDest} nextDest={null} onClose={() => setSelectedDest(null)} />
      )}
    </>
  );
}
