'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

export function BackToJourneysButton() {
  const router = useRouter();
  return (
    <button
      type="button"
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
      onClick={() => router.push(`/journeys/${journeyId}/destinations/create`)}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function ViewToggle({ journeyId, currentView, currentSection }: {
  journeyId: string;
  currentView: 'cards' | 'map';
  currentSection?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('view')) {
      const saved = localStorage.getItem('destinations-view');
      if (saved === 'map') {
        const params = new URLSearchParams();
        if (currentSection) params.set('section', currentSection);
        params.set('view', 'map');
        router.replace(`/journeys/${journeyId}/destinations?${params.toString()}`);
      }
    }
  }, [journeyId, currentSection, router]);

  function navigate(view: 'cards' | 'map') {
    localStorage.setItem('destinations-view', view);
    const params = new URLSearchParams();
    if (currentSection) params.set('section', currentSection);
    if (view === 'map') params.set('view', 'map');
    const qs = params.toString();
    router.push(`/journeys/${journeyId}/destinations${qs ? `?${qs}` : ''}`);
  }

  const active = 'bg-black text-white dark:bg-white dark:text-black';
  const inactive = 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';

  return (
    <div className="flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => navigate('cards')}
        className={`px-3 py-2 transition-colors ${currentView === 'cards' ? active : inactive}`}
      >
        <GridViewOutlinedIcon fontSize="small" />
      </button>
      <button
        type="button"
        onClick={() => navigate('map')}
        className={`border-l border-zinc-200 px-3 py-2 transition-colors dark:border-zinc-700 ${currentView === 'map' ? active : inactive}`}
      >
        <MapOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}
