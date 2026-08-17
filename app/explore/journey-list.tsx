'use client';

import { useEffect, useRef, useState } from 'react';
import { CountryBadge } from '@/app/ui/country-badge';
import { LikeButton } from './like-button';
import { ImportButton } from './import-button';
import FavoriteIcon from '@mui/icons-material/Favorite';

type Journey = {
  id: string;
  name: string;
  description?: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  countries: string[];
  currency?: string | null;
  total_price?: number | null;
  user_name: string | null;
  user_image_url?: string | null;
  like_count: number;
  viewer_liked: boolean;
  allow_import?: boolean | null;
  original_id?: string | null;
  original_name?: string | null;
};

const PAGE_SIZE = 10;

export function JourneyList({
  journeys,
  viewerCurrency,
  rates,
  isLoggedIn = true,
}: {
  journeys: Journey[];
  viewerCurrency: string;
  rates: Record<string, number>;
  isLoggedIn?: boolean;
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
    <ul className="flex flex-col items-center gap-4">
      {shown.map((journey) => {
        const fromCurrency = journey.currency ?? 'USD';
        const displayPrice = journey.total_price != null
          ? isLoggedIn
            ? (journey.total_price / (rates[fromCurrency] ?? 1)) * (rates[viewerCurrency] ?? 1)
            : journey.total_price
          : null;
        const displayCurrency = isLoggedIn ? viewerCurrency : fromCurrency;

        return (
          <li key={journey.id} className="flex w-[350px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            {journey.image_url && (
              <a href={`/explore/${journey.id}/destinations`} className="block">
                <img src={journey.image_url} alt="" className="h-40 w-full object-cover" />
              </a>
            )}
            {(journey.start_date || journey.like_count > 0) && (
              <div className="flex w-full items-center gap-2 px-6 pt-4">
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
                {journey.like_count > 0 && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                    <FavoriteIcon sx={{ fontSize: 12 }} className="text-rose-400" />
                    <span>{journey.like_count}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className={`flex flex-1 min-w-0 flex-col justify-center pb-4 pl-6 ${(journey.start_date || journey.like_count > 0) ? 'pt-1' : 'pt-4'}`}>
                <div className="flex items-center gap-2">
                  {journey.user_image_url && (
                    journey.user_name ? (
                      <a href={`/explore?owner=${encodeURIComponent(journey.user_name)}`} className="flex-shrink-0">
                        <img src={journey.user_image_url} alt="" className="h-8 w-8 rounded-full object-cover hover:opacity-80" />
                      </a>
                    ) : (
                      <img src={journey.user_image_url} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
                    )
                  )}
                  <div className="flex min-w-0 flex-col">
                    <a href={`/explore/${journey.id}/destinations`} className="truncate text-lg font-medium hover:underline">{journey.name}</a>
                    {journey.user_name && (
                      <a
                        href={`/explore?owner=${encodeURIComponent(journey.user_name)}`}
                        className="block max-w-full truncate text-xs text-zinc-400 hover:underline dark:text-zinc-500"
                      >
                        {journey.user_name}
                      </a>
                    )}
                  </div>
                </div>
                {journey.description && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 shrink-0 mt-1">{journey.description}</span>
                )}
                {displayPrice != null && (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="text-xs">Budget </span>
                    {new Intl.NumberFormat('en', { style: 'currency', currency: displayCurrency }).format(displayPrice)}
                  </span>
                )}
                {journey.countries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {journey.countries.map((code) => (
                      <CountryBadge key={code} code={code} href={`/explore?country=${code}`} />
                    ))}
                  </div>
                )}
                {journey.original_id && (
                  journey.original_name ? (
                    <a
                      href={`/explore/${journey.original_id}/destinations`}
                      className="mt-1 text-xs text-zinc-400 hover:underline dark:text-zinc-500"
                    >
                      Imported from {journey.original_name}
                    </a>
                  ) : (
                    <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Imported from a deleted journey</span>
                  )
                )}
              </div>
              <div className="flex flex-col items-center justify-center gap-3 pr-4 flex-shrink-0">
                {isLoggedIn && <LikeButton journeyId={journey.id} initialLiked={journey.viewer_liked} initialCount={journey.like_count} />}
                {isLoggedIn && journey.allow_import !== false && <ImportButton journeyId={journey.id} />}
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/explore/${journey.id}/destinations`;
                    if (navigator.share) {
                      navigator.share({ url });
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  className="flex items-center justify-center rounded-full p-1.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                  title="Share"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
              </div>
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
