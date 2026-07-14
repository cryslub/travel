'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ModalDest } from '@/app/ui/destinations-map';
import { MoreOptionsDestinationButton } from './destination-buttons';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const DestinationModal = dynamic(
  () => import('@/app/ui/destinations-map').then((m) => m.DestinationModal),
  { ssr: false },
);

export function SummaryList({ destinations, journeyId }: {
  destinations: ModalDest[];
  journeyId: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {destinations.map((d, i) => (
            <li key={d.id} className="flex items-center gap-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedIdx(i)}
                className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md transition-opacity hover:opacity-75"
              >
                {d.image_url
                  ? <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500"><LocationOnOutlinedIcon fontSize="small" /></div>
                }
              </button>
              <div className="flex-1 min-w-0">
                {d.start_date && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(d.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
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
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">{d.section_name}</span>
                  )}
                </div>
                {d.price != null && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('en', { style: 'currency', currency: d.price_currency ?? 'USD' }).format(d.price)}
                  </span>
                )}
              </div>
              <MoreOptionsDestinationButton journeyId={journeyId} id={d.id} className="px-1.5" />
            </li>
          ))}
        </ul>
      </div>
      {selectedIdx !== null && (
        <DestinationModal
          dest={destinations[selectedIdx]}
          nextDest={selectedIdx + 1 < destinations.length ? destinations[selectedIdx + 1] : null}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </>
  );
}
