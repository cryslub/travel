'use client'

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { deleteJourney } from './actions';

export function JourneyButtons({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this journey?')) return;
    await deleteJourney(id);
  }

  return (
    <div className="flex gap-2">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          title="More options"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full px-2 py-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <MoreVertIcon fontSize="small" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => { setOpen(false); router.push(`/journeys/${id}/edit`); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <EditOutlinedIcon fontSize="small" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-700"
            >
              <DeleteOutlinedIcon fontSize="small" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ExploreButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      title="Explore"
      onClick={() => router.push('/explore')}
      className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
    >
      <TravelExploreIcon fontSize="small" />
    </button>
  );
}

export function CreateJourneyButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      title="Create journey"
      onClick={() => router.push('/journeys/create')}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}
