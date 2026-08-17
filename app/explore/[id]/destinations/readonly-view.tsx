'use client';

import { useState } from 'react';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { TextTooltip } from '@/app/ui/text-tooltip';
import type { DestinationWithTransport } from '@/app/lib/definitions';
import { ReadonlyDestinationModal } from './readonly-destination-modal';

export function ReadonlyDestinationsView({ destinations, preferredCurrency }: { destinations: DestinationWithTransport[]; preferredCurrency?: string }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const dest = selectedIdx !== null ? destinations[selectedIdx] : null;
  const nextDest = selectedIdx !== null ? (destinations[selectedIdx + 1] ?? null) : null;

  return (
    <>
      <ul className="max-w-2xl mx-auto">
        {destinations.map((d, i) => (
          <li key={d.id} className="flex gap-3 py-3">
            {/* Day */}
            <div className="w-16 flex-shrink-0 pt-2 text-right">
              {d.start_date && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(d.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Dot + connecting line */}
            <div className="relative flex-shrink-0 self-stretch flex justify-center w-14">
              {i < destinations.length - 1 ? (
                <div className={`absolute ${i > 0 ? '-top-3' : 'top-1'} -bottom-3 left-1/2 -translate-x-1/2 w-px bg-zinc-200 dark:bg-zinc-700`} />
              ) : i > 0 && (
                <div className="absolute -top-3 h-6 left-1/2 -translate-x-1/2 w-px bg-zinc-200 dark:bg-zinc-700" />
              )}
              <button
                type="button"
                onClick={() => setSelectedIdx(i)}
                className="relative z-10 mt-1 w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-opacity hover:opacity-75"
              >
                {d.image_url
                  ? <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                  : <ExploreOutlinedIcon className="text-zinc-400 dark:text-zinc-500" />
                }
              </button>
            </div>

            {/* Name, description, cost */}
            <div className="flex-1 min-w-0 pt-2">
              {d.section_name && (
                <span className="block text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">{d.section_name}</span>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  className="font-medium text-zinc-900 dark:text-zinc-100 truncate hover:underline text-left"
                >
                  {d.name}
                </button>
                {d.section_name && (
                  <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0 sm:inline">{d.section_name}</span>
                )}
              </div>
              {d.description && (
                <TextTooltip text={d.description} className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2" />
              )}
              {d.price != null && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('en', { style: 'currency', currency: d.price_currency ?? 'USD' }).format(d.price)}
                </span>
              )}
            </div>
          </li>
        ))}
        {destinations.length === 0 && (
          <li className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No destinations.</li>
        )}
      </ul>

      {dest && (
        <ReadonlyDestinationModal
          dest={dest}
          nextDest={nextDest}
          onClose={() => setSelectedIdx(null)}
          preferredCurrency={preferredCurrency}
        />
      )}
    </>
  );
}
