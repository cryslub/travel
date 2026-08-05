'use client';

import { useRouter } from 'next/navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export function BackButton() {
  const router = useRouter();

  function handleClick() {
    let referrerPath: string | null = null;
    try {
      if (document.referrer) referrerPath = new URL(document.referrer).pathname;
    } catch {}

    if (referrerPath === '/journeys') {
      router.push('/journeys');
      return;
    }

    sessionStorage.setItem('explore-returning', '1');
    router.push('/explore');
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium leading-6 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <ChevronLeftIcon fontSize="small" />
    </button>
  );
}
