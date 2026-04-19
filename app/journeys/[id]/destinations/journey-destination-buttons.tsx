'use client'

import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

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
