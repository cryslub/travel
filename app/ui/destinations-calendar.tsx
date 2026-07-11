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
  calendarMoveEvent,
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

type PendingCrossDestMove = {
  revert: () => void;
  evId: string;
  eventObj: CalendarDest['events'][0];
  currentDestId: string;
  currentDestName: string;
  newDestId: string;
  newDestName: string;
  newStartTime: string;
  newEndTime: string | null;
};

const VIEWS = [
  { key: 'dayGridMonth', Icon: CalendarMonthOutlinedIcon, label: 'Month' },
  { key: 'timeGridWeek', Icon: ViewWeekOutlinedIcon,      label: 'Week' },
  { key: 'timeGridDay',  Icon: ViewDayOutlinedIcon,       label: 'Day' },
  { key: 'listWeek',     Icon: ViewListOutlinedIcon,      label: 'List' },
] as const;

const PREF_TO_FC: Record<string, string> = {
  month: 'dayGridMonth',
  week: 'timeGridWeek',
  day: 'timeGridDay',
  list: 'listWeek',
};

const EVENT_TYPE_COLOR: Record<string, string> = {
  Site:     '#3b82f6',
  Meal:     '#f59e0b',
  Tour:     '#10b981',
  Activity: '#8b5cf6',
  Transfer: '#64748b',
};

export function DestinationsCalendar({ destinations, isReadonly, preferredCurrency, defaultCalendarView }: { destinations: CalendarDest[]; isReadonly?: boolean; preferredCurrency?: string; defaultCalendarView?: string }) {
  const initialFcView = (() => {
    const fc = (defaultCalendarView && PREF_TO_FC[defaultCalendarView]) ?? 'dayGridMonth';
    return fc === 'timeGridWeek' && window.innerWidth < 640 ? 'timeGridDay' : fc;
  })();
  const calendarRef = useRef<FullCalendar>(null);
  const [activeView, setActiveView] = useState<string>(initialFcView);
  const [calendarTitle, setCalendarTitle] = useState('');
  const [selectedDest, setSelectedDest] = useState<ModalDest | null>(null);
  const [localDestinations, setLocalDestinations] = useState<CalendarDest[]>(destinations);
  const [pendingCrossDestMove, setPendingCrossDestMove] = useState<PendingCrossDestMove | null>(null);

  function updateLocalDest(updater: (d: CalendarDest) => CalendarDest, destId: string) {
    setLocalDestinations((prev) => prev.map((d) => d.id === destId ? updater(d) : d));
    setSelectedDest((prev) => prev?.id === destId ? updater(prev) : prev);
  }

  const calendarEvents = useMemo(() => {
    const result: { id: string; title: string; start: string; end?: string; allDay?: boolean; color: string; extendedProps?: Record<string, unknown> }[] = [];
    for (const dest of localDestinations) {
      if (dest.start_date) {
        result.push({ id: `dest-${dest.id}`, title: dest.name, start: dest.start_date, allDay: true, color: '#6366f1', extendedProps: { transportStartTime: dest.transport?.start_time ?? '' } });
      }
      for (const ev of dest.events) {
        if (ev.start_time) {
          result.push({ id: `ev-${ev.id}`, title: ev.name ?? dest.name, start: ev.start_time, end: ev.end_time ?? undefined, color: (ev.type && EVENT_TYPE_COLOR[ev.type]) || '#3b82f6' });
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
    const dates = localDestinations.flatMap((d) => [
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

  function sortEvents(events: CalendarDest['events']): CalendarDest['events'] {
    return [...events].sort((a, b) => {
      if (!a.start_time && !b.start_time) return 0;
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time < b.start_time ? -1 : a.start_time > b.start_time ? 1 : 0;
    });
  }

  function destEffective(d: CalendarDest): string {
    const date = destDateStr(d.start_date);
    const tTime = d.transport?.start_time;
    return tTime && tTime.slice(0, 10) === date ? tTime : `${date}T00:00`;
  }

  function detectDestinationForDate(targetStr: string): string | undefined {
    const targetDate = targetStr.slice(0, 10);
    const hasTime = targetStr.length > 10;
    const sorted = [...localDestinations]
      .filter((d) => d.start_date)
      .sort((a, b) => (destEffective(a) < destEffective(b) ? -1 : 1));
    if (hasTime) {
      let found = sorted[0];
      for (const d of sorted) {
        if (destEffective(d) <= targetStr) found = d;
      }
      return found?.id;
    }
    let lastBefore: CalendarDest | undefined;
    let firstOfDay: CalendarDest | undefined;
    for (const d of sorted) {
      const date = destDateStr(d.start_date);
      if (date < targetDate) lastBefore = d;
      else if (date === targetDate && !firstOfDay) firstOfDay = d;
    }
    return (firstOfDay ?? lastBefore)?.id;
  }

  async function handleEventChange(info: { event: { id: string; start: Date | null; end: Date | null; allDay: boolean }; revert: () => void }) {
    const { id, start, end } = info.event;
    if (!start) { info.revert(); return; }
    try {
      if (id.startsWith('dest-')) {
        const destId = id.slice(5);
        await calendarUpdateDestinationDate(destId, toDateStr(start));
        updateLocalDest((d) => ({ ...d, start_date: toDateStr(start) }), destId);
      } else if (id.startsWith('ev-')) {
        const evId = id.slice(3);
        const currentDest = localDestinations.find((d) => d.events.some((e) => e.id === evId));
        if (!currentDest) { info.revert(); return; }
        const eventObj = currentDest.events.find((e) => e.id === evId)!;
        const newStartTime = toTimeStr(start);
        const newEndTime = end ? toTimeStr(end) : null;
        const newDestId = detectDestinationForDate(newStartTime);
        if (newDestId && newDestId !== currentDest.id) {
          const newDest = localDestinations.find((d) => d.id === newDestId)!;
          setPendingCrossDestMove({ revert: info.revert, evId, eventObj, currentDestId: currentDest.id, currentDestName: currentDest.name, newDestId, newDestName: newDest.name, newStartTime, newEndTime });
          return;
        }
        await calendarUpdateEventTimes(evId, newStartTime, newEndTime);
        updateLocalDest((d) => ({
          ...d,
          events: sortEvents(d.events.map((e) => e.id === evId ? { ...e, start_time: newStartTime, end_time: newEndTime ?? e.end_time } : e)),
        }), currentDest.id);
      } else if (id.startsWith('tr-')) {
        const destId = id.slice(3);
        await calendarUpdateTransportTimes(destId, toTimeStr(start), end ? toTimeStr(end) : null);
        updateLocalDest((d) => ({
          ...d,
          transport: d.transport ? { ...d.transport, start_time: toTimeStr(start), end_time: end ? toTimeStr(end) : d.transport.end_time } : d.transport,
        }), destId);
      }
    } catch {
      info.revert();
    }
  }

  async function handleConfirmCrossDestMove() {
    if (!pendingCrossDestMove) return;
    const { evId, eventObj, currentDestId, newDestId, newStartTime, newEndTime } = pendingCrossDestMove;
    setPendingCrossDestMove(null);
    try {
      await calendarMoveEvent(evId, currentDestId, newDestId, newStartTime, newEndTime);
      setLocalDestinations((prev) => prev.map((d) => {
        if (d.id === currentDestId) return { ...d, events: d.events.filter((e) => e.id !== evId) };
        if (d.id === newDestId) return { ...d, events: sortEvents([...d.events, { ...eventObj, start_time: newStartTime, end_time: newEndTime }]) };
        return d;
      }));
    } catch {
      pendingCrossDestMove.revert();
    }
  }

  async function handleKeepCurrentDest() {
    if (!pendingCrossDestMove) return;
    const { evId, currentDestId, newStartTime, newEndTime } = pendingCrossDestMove;
    setPendingCrossDestMove(null);
    try {
      await calendarUpdateEventTimes(evId, newStartTime, newEndTime);
      updateLocalDest((d) => ({
        ...d,
        events: sortEvents(d.events.map((e) => e.id === evId ? { ...e, start_time: newStartTime, end_time: newEndTime ?? e.end_time } : e)),
      }), currentDestId);
    } catch {
      pendingCrossDestMove.revert();
    }
  }

  function handleCancelCrossDestMove() {
    if (!pendingCrossDestMove) return;
    pendingCrossDestMove.revert();
    setPendingCrossDestMove(null);
  }

  function destDateStr(v: unknown) {
    return new Date(v as string).toLocaleDateString('en-CA');
  }

  function handleDateClick(info: { dateStr: string; view: { type: string } }) {
    if (info.view.type !== 'dayGridMonth') return;
    const journeyId = localDestinations[0]?.journey_id;
    if (!journeyId) return;
    const sorted = [...localDestinations]
      .filter((d) => d.start_date)
      .sort((a, b) => (destDateStr(a.start_date) < destDateStr(b.start_date) ? -1 : 1));
    let dest = sorted[0];
    for (const d of sorted) {
      if (destDateStr(d.start_date) <= info.dateStr) dest = d;
    }
    if (!dest) return;
    window.location.href = `/journeys/${journeyId}/destinations/${dest.id}/events/create?date=${info.dateStr}`;
  }

  function handleSelect(info: { start: Date; end: Date; allDay: boolean }) {
    // In month view a single click fires select with a 1-day range — skip it (dateClick handles that).
    if (info.allDay && info.end.getTime() - info.start.getTime() <= 24 * 60 * 60 * 1000) return;
    const journeyId = localDestinations[0]?.journey_id;
    if (!journeyId) return;
    const sorted = [...localDestinations]
      .filter((d) => d.start_date)
      .sort((a, b) => (destDateStr(a.start_date) < destDateStr(b.start_date) ? -1 : 1));
    const dateStr = toDateStr(info.start);
    let dest = sorted[0];
    for (const d of sorted) {
      if (destDateStr(d.start_date) <= dateStr) dest = d;
    }
    if (!dest) return;
    const startTime = toTimeStr(info.start);
    const effectiveEnd = info.allDay ? new Date(info.end.getTime() - 24 * 60 * 60 * 1000) : info.end;
    const endTime = toTimeStr(effectiveEnd);
    window.location.href = `/journeys/${journeyId}/destinations/${dest.id}/events/create?startTime=${startTime}&endTime=${endTime}`;
  }

  function handleEventClick(info: { event: { id: string } }) {
    const { id } = info.event;
    let dest: ModalDest | undefined;
    if (id.startsWith('dest-')) {
      dest = localDestinations.find((d) => d.id === id.slice(5));
    } else if (id.startsWith('ev-')) {
      const evId = id.slice(3);
      dest = localDestinations.find((d) => d.events.some((e) => e.id === evId));
    } else if (id.startsWith('tr-')) {
      dest = localDestinations.find((d) => d.id === id.slice(3));
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
            {VIEWS.map(({ key, Icon, label }, i) => (
              <button
                key={key}
                type="button"
                title={label}
                onClick={() => changeView(key)}
                className={`${i > 0 ? divider : ''} ${btnBase} ${activeView === key ? active : inactive}${key === 'timeGridWeek' ? ' hidden sm:block' : ''}`}
              >
                <Icon fontSize="small" />
              </button>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
            <button type="button" title="Previous" onClick={() => calendarRef.current?.getApi().prev()} className={`${btnBase} ${inactive}`}>
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button type="button" title="Today" onClick={() => calendarRef.current?.getApi().today()} className={`${divider} ${btnBase} ${inactive}`}>
              <TodayIcon fontSize="small" />
            </button>
            <button type="button" title="Next" onClick={() => calendarRef.current?.getApi().next()} className={`${divider} ${btnBase} ${inactive}`}>
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>
        </div>
        {/* Row 2: title */}
        <h2 className="mt-3 mb-4 text-center text-lg sm:text-2xl font-semibold text-zinc-800 dark:text-zinc-100">{calendarTitle}</h2>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={initialFcView}
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
          selectable={!isReadonly}
          eventDrop={isReadonly ? undefined : handleEventChange}
          eventResize={isReadonly ? undefined : handleEventChange}
          eventClick={handleEventClick}
          dateClick={isReadonly ? undefined : handleDateClick}
          select={isReadonly ? undefined : handleSelect}
        />
      </div>
      {selectedDest && (
        <DestinationModal dest={selectedDest} nextDest={null} onClose={() => setSelectedDest(null)} preferredCurrency={preferredCurrency} />
      )}
      {pendingCrossDestMove && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelCrossDestMove} />
          <div className="relative z-10 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-xl max-w-sm w-full mx-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-200 mb-5">
              This date belongs to <strong>{pendingCrossDestMove.newDestName}</strong>. Move the event there?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmCrossDestMove}
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Move to {pendingCrossDestMove.newDestName}
              </button>
              <button
                type="button"
                onClick={handleKeepCurrentDest}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-200"
              >
                Keep in {pendingCrossDestMove.currentDestName}
              </button>
              <button
                type="button"
                onClick={handleCancelCrossDestMove}
                className="text-sm text-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
