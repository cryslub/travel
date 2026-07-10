'use client';

import { useState } from 'react';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { updateDestinationsView, updateCalendarSubView } from './actions';

type View = 'summary' | 'cards' | 'calendar' | 'map';
type CalendarSubView = 'month' | 'week' | 'day' | 'list';

const CALENDAR_VIEWS: { key: CalendarSubView; Icon: React.ElementType; label: string }[] = [
  { key: 'month', Icon: CalendarMonthOutlinedIcon, label: 'Month' },
  { key: 'week',  Icon: ViewWeekOutlinedIcon,      label: 'Week' },
  { key: 'day',   Icon: ViewDayOutlinedIcon,        label: 'Day' },
  { key: 'list',  Icon: ViewListOutlinedIcon,       label: 'List' },
];

function normaliseView(v: string): View {
  const lower = v.toLowerCase();
  if (lower === 'cards') return 'cards';
  if (lower === 'map') return 'map';
  if (lower === 'calendar') return 'calendar';
  return 'summary';
}

function normaliseSubView(v: string | null): CalendarSubView {
  if (v === 'week') return 'week';
  if (v === 'day') return 'day';
  if (v === 'list') return 'list';
  return 'month';
}

export function PreferenceViewToggle({ currentView, currentCalendarSubView }: { currentView: string; currentCalendarSubView: string | null }) {
  const [view, setView] = useState<View>(normaliseView(currentView));
  const [subView, setSubView] = useState<CalendarSubView>(normaliseSubView(currentCalendarSubView));

  async function handleViewSelect(v: View) {
    setView(v);
    await updateDestinationsView(v);
  }

  async function handleSubViewSelect(s: CalendarSubView) {
    setSubView(s);
    await updateCalendarSubView(s);
  }

  const active = 'bg-black text-white dark:bg-white dark:text-black';
  const inactive = 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';
  const border = 'border-l border-zinc-200 dark:border-zinc-700';

  return (
    <div>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Destinations page view</p>
      <div className="flex flex-col gap-3 items-start">
        <div className="inline-flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
          <button type="button" title="Summary view" onClick={() => handleViewSelect('summary')} className={`px-3 py-2 transition-colors ${view === 'summary' ? active : inactive}`}>
            <TableRowsOutlinedIcon fontSize="small" />
          </button>
          <button type="button" title="Cards view" onClick={() => handleViewSelect('cards')} className={`${border} px-3 py-2 transition-colors ${view === 'cards' ? active : inactive}`}>
            <GridViewOutlinedIcon fontSize="small" />
          </button>
          <button type="button" title="Calendar view" onClick={() => handleViewSelect('calendar')} className={`${border} px-3 py-2 transition-colors ${view === 'calendar' ? active : inactive}`}>
            <CalendarMonthOutlinedIcon fontSize="small" />
          </button>
          <button type="button" title="Map view" onClick={() => handleViewSelect('map')} className={`${border} px-3 py-2 transition-colors ${view === 'map' ? active : inactive}`}>
            <MapOutlinedIcon fontSize="small" />
          </button>
        </div>
        {view === 'calendar' && (
          <div className="inline-flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
            {CALENDAR_VIEWS.map(({ key, Icon, label }, i) => (
              <button
                key={key}
                type="button"
                title={label}
                onClick={() => handleSubViewSelect(key)}
                className={`${i > 0 ? border : ''} px-3 py-2 transition-colors ${subView === key ? active : inactive}`}
              >
                <Icon fontSize="small" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
