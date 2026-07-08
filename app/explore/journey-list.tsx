'use client';

import { useEffect, useRef, useState } from 'react';
import { CountryBadge } from '@/app/ui/country-badge';
import { LikeButton } from './like-button';
import { ImportButton } from './import-button';

type Journey = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  countries: string[];
  currency?: string | null;
  total_price?: number | null;
  user_name: string | null;
  like_count: number;
  viewer_liked: boolean;
};

const PAGE_SIZE = 10;

export function JourneyList({
  journeys,
  viewerCurrency,
  rates,
}: {
  journeys: Journey[];
  viewerCurrency: string;
  rates: Record<string, number>;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [journeys]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, journeys.length));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [journeys.length]);

  const shown = journeys.slice(0, visible);

  return (
    <ul className="flex flex-col gap-4">
      {shown.map((journey) => {
        const fromCurrency = journey.currency ?? 'USD';
        const converted =
          journey.total_price != null
            ? (journey.total_price / (rates[fromCurrency] ?? 1)) * (rates[viewerCurrency] ?? 1)
            : null;

        return (
          <li key={journey.id} className="flex items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-stretch gap-4 flex-1">
              {journey.image_url && (
                <a href={`/explore/${journey.id}/destinations`} className="flex-shrink-0 rounded-l-lg overflow-hidden">
                  <img src={journey.image_url} alt="" className="w-24 h-full object-cover" />
                </a>
              )}
              <div className={`flex flex-col justify-center py-4 ${!journey.image_url ? 'pl-6' : ''}`}>
                {journey.start_date && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(journey.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    {journey.end_date && (
                      <>
                        {' ~ '}{new Date(journey.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                        {' · '}{Math.round((new Date(journey.end_date).getTime() - new Date(journey.start_date).getTime()) / 86400000) + 1}d
                      </>
                    )}
                  </span>
                )}
                <a href={`/explore/${journey.id}/destinations`} className="text-lg font-medium hover:underline">{journey.name}</a>
                {journey.user_name && (
                  <a
                    href={`/explore?owner=${encodeURIComponent(journey.user_name)}`}
                    className="text-xs text-zinc-400 hover:underline dark:text-zinc-500 w-fit mb-1"
                  >
                    {journey.user_name}
                  </a>
                )}
                {converted != null && (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('en', { style: 'currency', currency: viewerCurrency }).format(converted)}
                  </span>
                )}
                {journey.countries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    {journey.countries.map((code) => (
                      <CountryBadge key={code} code={code} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 px-4 border-l border-zinc-100 dark:border-zinc-700">
              <LikeButton journeyId={journey.id} initialLiked={journey.viewer_liked} initialCount={journey.like_count} />
              <ImportButton journeyId={journey.id} />
            </div>
          </li>
        );
      })}
      {journeys.length === 0 && (
        <li className="text-sm text-zinc-500 dark:text-zinc-400">No journeys found.</li>
      )}
      {visible < journeys.length && (
        <div ref={sentinelRef} className="h-8" />
      )}
    </ul>
  );
}
