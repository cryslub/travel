'use client'

import { useRouter } from 'next/navigation';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import { deleteJourney } from './actions';

export function JourneyButtons({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this journey?')) return;
    await deleteJourney(id);
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => router.push(`/journeys/${id}/destinations`)}
        className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <EventNoteOutlinedIcon fontSize="small" />
      </button>
      <button
        type="button"
        onClick={() => router.push(`/journeys/${id}/edit`)}
        className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <EditOutlinedIcon fontSize="small" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <DeleteOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}

export function CreateJourneyButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/journeys/create')}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}
