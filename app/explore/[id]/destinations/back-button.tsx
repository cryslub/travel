'use client';

import { useRouter } from 'next/navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/explore')}
      className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium leading-6 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <ChevronLeftIcon fontSize="small" />
    </button>
  );
}
