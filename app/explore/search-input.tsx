'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import SearchIcon from '@mui/icons-material/Search';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    startTransition(() => router.replace(`/explore?${params.toString()}`));
  }

  return (
    <div className="relative w-full max-w-md">
      <SearchIcon
        fontSize="small"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
      />
      <input
        type="text"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleChange}
        placeholder="Search journeys..."
        className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
      />
    </div>
  );
}
