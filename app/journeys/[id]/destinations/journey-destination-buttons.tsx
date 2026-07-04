'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';

export function BackToJourneysButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Back to journeys"
      onClick={() => router.push('/journeys')}
      className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <ChevronLeftIcon fontSize="small" />
    </button>
  );
}

export function CreateDestinationForJourneyButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Add destination"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/create`)}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function ViewToggle({ journeyId, currentView, currentSection }: {
  journeyId: string;
  currentView: 'summary' | 'cards' | 'map' | 'calendar';
  currentSection?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('view')) {
      const saved = localStorage.getItem('destinations-view');
      if (saved === 'cards' || saved === 'map' || saved === 'calendar') {
        const params = new URLSearchParams();
        if (currentSection) params.set('section', currentSection);
        params.set('view', saved);
        router.replace(`/journeys/${journeyId}/destinations?${params.toString()}`);
      }
    }
  }, [journeyId, currentSection, router]);

  function navigate(view: 'summary' | 'cards' | 'map' | 'calendar') {
    localStorage.setItem('destinations-view', view);
    const params = new URLSearchParams();
    if (currentSection) params.set('section', currentSection);
    if (view !== 'summary') params.set('view', view);
    const qs = params.toString();
    router.push(`/journeys/${journeyId}/destinations${qs ? `?${qs}` : ''}`);
  }

  const active = 'bg-black text-white dark:bg-white dark:text-black';
  const inactive = 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';
  const border = 'border-l border-zinc-200 dark:border-zinc-700';

  return (
    <div className="flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
      <button
        type="button"
        title="Summary view"
        onClick={() => navigate('summary')}
        className={`px-3 py-2 transition-colors ${currentView === 'summary' ? active : inactive}`}
      >
        <TableRowsOutlinedIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Cards view"
        onClick={() => navigate('cards')}
        className={`${border} px-3 py-2 transition-colors ${currentView === 'cards' ? active : inactive}`}
      >
        <GridViewOutlinedIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Calendar view"
        onClick={() => navigate('calendar')}
        className={`${border} px-3 py-2 transition-colors ${currentView === 'calendar' ? active : inactive}`}
      >
        <CalendarMonthOutlinedIcon fontSize="small" />
      </button>
      <button
        type="button"
        title="Map view"
        onClick={() => navigate('map')}
        className={`${border} px-3 py-2 transition-colors ${currentView === 'map' ? active : inactive}`}
      >
        <MapOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}
