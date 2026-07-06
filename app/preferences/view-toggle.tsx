'use client';

import { useState } from 'react';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { updateDestinationsView } from './actions';

type View = 'summary' | 'cards' | 'calendar' | 'map';

function normalise(v: string): View {
  const lower = v.toLowerCase();
  if (lower === 'cards') return 'cards';
  if (lower === 'map') return 'map';
  if (lower === 'calendar') return 'calendar';
  return 'summary';
}

export function PreferenceViewToggle({ currentView }: { currentView: string }) {
  const [view, setView] = useState<View>(normalise(currentView));

  async function handleSelect(v: View) {
    setView(v);
    await updateDestinationsView(v);
  }

  const active = 'bg-black text-white dark:bg-white dark:text-black';
  const inactive = 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';
  const border = 'border-l border-zinc-200 dark:border-zinc-700';

  return (
    <div>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Destinations page view</p>
      <div className="inline-flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
        <button type="button" title="Summary view" onClick={() => handleSelect('summary')} className={`px-3 py-2 transition-colors ${view === 'summary' ? active : inactive}`}>
          <TableRowsOutlinedIcon fontSize="small" />
        </button>
        <button type="button" title="Cards view" onClick={() => handleSelect('cards')} className={`${border} px-3 py-2 transition-colors ${view === 'cards' ? active : inactive}`}>
          <GridViewOutlinedIcon fontSize="small" />
        </button>
        <button type="button" title="Calendar view" onClick={() => handleSelect('calendar')} className={`${border} px-3 py-2 transition-colors ${view === 'calendar' ? active : inactive}`}>
          <CalendarMonthOutlinedIcon fontSize="small" />
        </button>
        <button type="button" title="Map view" onClick={() => handleSelect('map')} className={`${border} px-3 py-2 transition-colors ${view === 'map' ? active : inactive}`}>
          <MapOutlinedIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
