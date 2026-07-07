import { fetchExploreJourneys, fetchUserPreferences } from '@/app/lib/data';
import { getExchangeRates } from '@/app/lib/prices';
import { CountryBadge } from '@/app/ui/country-badge';
import { SearchBar } from './search-bar';
import { getDurationFilter } from './duration-config';
import { journeyMatchesContinent } from './continent-config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; durMin?: string; durMax?: string; continent?: string; country?: string; owner?: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) redirect('/');
  const signInType = session.user.sign_in_type ?? 'Google';
  const { q, durMin, durMax, continent, country, owner } = await searchParams;

  const [allJourneys, prefs, rates] = await Promise.all([
    fetchExploreJourneys(session.user.email, signInType),
    fetchUserPreferences(session.user.email, signInType),
    getExchangeRates(),
  ]);
  const viewerCurrency = prefs.currency ?? 'USD';
  const { minDays, maxDays, isDefault } = getDurationFilter(durMin, durMax);

  const journeys = allJourneys.filter((j) => {
    if (owner && j.user_name !== owner) return false;
    if (q) {
      const lq = q.toLowerCase();
      const matchesName = j.name.toLowerCase().includes(lq);
      const matchesOwner = j.user_name?.toLowerCase().includes(lq) ?? false;
      if (!matchesName && !matchesOwner) return false;
    }
    if (country) {
      if (!j.countries.some((c) => c.toUpperCase() === country.toUpperCase())) return false;
    } else if (continent && !journeyMatchesContinent(j.countries, continent)) return false;
    if (!j.start_date || !j.end_date) {
      if (!isDefault) return false;
    } else {
      const days = (new Date(j.end_date).getTime() - new Date(j.start_date).getTime()) / 86400000;
      if (days < minDays) return false;
      if (maxDays !== null && days > maxDays) return false;
    }
    return true;
  });

  return (
    <main className="w-full px-4 py-12 min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
        <ul className="flex flex-col gap-4">
          {journeys.map((journey) => (
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
                      {journey.end_date && <>
                        {' ~ '}{new Date(journey.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                        {' · '}{Math.round((new Date(journey.end_date).getTime() - new Date(journey.start_date).getTime()) / 86400000)}d
                      </>}
                    </span>
                  )}
                  <a href={`/explore/${journey.id}/destinations`} className="text-lg font-medium hover:underline">{journey.name}</a>
                  {journey.user_name && (
                    <a
                      href={`/explore?owner=${encodeURIComponent(journey.user_name)}`}
                      className="text-xs text-zinc-400 hover:underline dark:text-zinc-500 w-fit"
                    >
                      {journey.user_name}
                    </a>
                  )}
                  {journey.total_price != null && (() => {
                    const fromCurrency = journey.currency ?? 'USD';
                    const converted = (journey.total_price / (rates[fromCurrency] ?? 1)) * (rates[viewerCurrency] ?? 1);
                    return (
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('en', { style: 'currency', currency: viewerCurrency }).format(converted)}
                      </span>
                    );
                  })()}
                  {journey.countries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {journey.countries.map((code) => (
                        <CountryBadge key={code} code={code} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
          {journeys.length === 0 && (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">
              No journeys found.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
