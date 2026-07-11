'use client'

import { useState, useRef, useEffect, ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import MovingIcon from '@mui/icons-material/Moving';

type EventType = {
  value: string;
  label: string;
  color: string | null;
  Icon: ElementType<SvgIconProps> | null;
};

const EVENT_TYPES: EventType[] = [
  { value: 'Site',     label: 'Site',        color: '#3b82f6', Icon: LocationOnOutlinedIcon },
  { value: 'Meal',     label: 'Meal',        color: '#f59e0b', Icon: RestaurantOutlinedIcon },
  { value: 'Tour',     label: 'Tour',        color: '#10b981', Icon: TourOutlinedIcon },
  { value: 'Activity', label: 'Activity',    color: '#8b5cf6', Icon: StarBorderOutlinedIcon },
  { value: 'Transfer', label: 'Transfer',    color: '#64748b', Icon: MovingIcon },
];

export function EventTypeSelect({ defaultValue = 'Site' }: { defaultValue?: string }) {
  const [selected, setSelected] = useState(defaultValue || 'Site');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const current = EVENT_TYPES.find((t) => t.value === selected) ?? EVENT_TYPES[0];

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name="type" value={selected} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
      >
        <span className="flex items-center gap-2">
          {current.Icon
            ? <span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: current.color ?? undefined }}><current.Icon style={{ fontSize: 16 }} className="text-white" /></span>
            : <span className="w-6 h-6 flex-shrink-0" />
          }
          <span className={current.color ? '' : 'text-zinc-400 dark:text-zinc-500'}>{current.label}</span>
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg overflow-hidden dark:border-zinc-700 dark:bg-zinc-900">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setSelected(t.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${selected === t.value ? 'bg-zinc-50 dark:bg-zinc-800' : ''}`}
            >
              {t.Icon
                ? <span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: t.color ?? undefined }}><t.Icon style={{ fontSize: 16 }} className="text-white" /></span>
                : <span className="w-6 h-6 flex-shrink-0" />
              }
              <span className={t.color ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
