'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';

export function ViewToggle({ journeyId, currentView }: {
  journeyId: string;
  currentView: 'summary' | 'cards' | 'map' | 'calendar';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(view: 'summary' | 'cards' | 'map' | 'calendar') {
    const params = new URLSearchParams();
    const section = searchParams.get('section');
    if (section) params.set('section', section);
    params.set('view', view);
    router.push(`/explore/${journeyId}/destinations?${params.toString()}`);
  }

  const active = 'bg-black text-white dark:bg-white dark:text-black';
  const inactive = 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';
  const border = 'border-l border-zinc-200 dark:border-zinc-700';

  return (
    <div className="flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
      <button type="button" title="Summary view" onClick={() => navigate('summary')} className={`px-3 py-2 transition-colors ${currentView === 'summary' ? active : inactive}`}>
        <TableRowsOutlinedIcon fontSize="small" />
      </button>
      <button type="button" title="Cards view" onClick={() => navigate('cards')} className={`${border} px-3 py-2 transition-colors ${currentView === 'cards' ? active : inactive}`}>
        <GridViewOutlinedIcon fontSize="small" />
      </button>
      <button type="button" title="Calendar view" onClick={() => navigate('calendar')} className={`${border} px-3 py-2 transition-colors ${currentView === 'calendar' ? active : inactive}`}>
        <CalendarMonthOutlinedIcon fontSize="small" />
      </button>
      <button type="button" title="Map view" onClick={() => navigate('map')} className={`${border} px-3 py-2 transition-colors ${currentView === 'map' ? active : inactive}`}>
        <MapOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}
