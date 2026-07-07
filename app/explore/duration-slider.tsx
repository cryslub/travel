'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { DURATION_STEPS, STEP_COUNT } from './duration-config';

const MIN = 1;
const MAX = STEP_COUNT;

const thumbCls = [
  'pointer-events-auto appearance-none',
  'w-4 h-4 rounded-full bg-white border-2 border-zinc-800 shadow',
  'dark:border-zinc-200',
].join(' ');

const inputCls = [
  'absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none',
  `[&::-webkit-slider-thumb]:${thumbCls}`,
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none',
  '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-800',
].join(' ');

export function DurationSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const lo = Number(searchParams.get('durMin') ?? MIN);
  const hi = Number(searchParams.get('durMax') ?? MAX);

  const loLabel = DURATION_STEPS[lo - 1]?.label ?? '';
  const hiLabel = DURATION_STEPS[hi - 1]?.label ?? '';
  const label = lo === hi ? loLabel : `${loLabel} – ${hiLabel}`;

  const leftPct = ((lo - MIN) / (MAX - MIN)) * 100;
  const rightPct = ((hi - MIN) / (MAX - MIN)) * 100;

  function update(newLo: number, newHi: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newLo === MIN) params.delete('durMin'); else params.set('durMin', String(newLo));
    if (newHi === MAX) params.delete('durMax'); else params.set('durMax', String(newHi));
    startTransition(() => router.replace(`/explore?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-1 min-w-[180px]">
      <span className="text-xs text-zinc-500 dark:text-zinc-400 text-center truncate">{label}</span>
      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-zinc-200 dark:bg-zinc-600" />
        {/* Active track between thumbs */}
        <div
          className="absolute h-1 rounded-full bg-zinc-800 dark:bg-zinc-200"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        {/* Low handle */}
        <input
          type="range"
          min={MIN} max={MAX} step={1} value={lo}
          onChange={(e) => update(Math.min(Number(e.target.value), hi), hi)}
          className={inputCls}
        />
        {/* High handle */}
        <input
          type="range"
          min={MIN} max={MAX} step={1} value={hi}
          onChange={(e) => update(lo, Math.max(Number(e.target.value), lo))}
          className={inputCls}
        />
      </div>
    </div>
  );
}
