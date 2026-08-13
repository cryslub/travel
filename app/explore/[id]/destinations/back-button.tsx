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
      className="rounded-full border border-zinc-200 bg-white px-2 py-1.5 sm:px-3 sm:py-2 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <ChevronLeftIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
    </button>
  );
}
