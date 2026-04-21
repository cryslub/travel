'use client'

import { useRouter } from 'next/navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export function BackToDestinationsButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/journeys/${journeyId}/destinations`)}
      className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <ChevronLeftIcon fontSize="small" />
    </button>
  );
}

export function CreateSectionButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/journeys/${journeyId}/sections/create`)}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function EditSectionButton({ journeyId, sectionId }: { journeyId: string; sectionId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/journeys/${journeyId}/sections/${sectionId}/edit`)}
      className="rounded-full border border-zinc-200 px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
    >
      <EditOutlinedIcon fontSize="small" />
    </button>
  );
}
