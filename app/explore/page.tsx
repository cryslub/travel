import { fetchExploreJourneys, fetchUserPreferences } from '@/app/lib/data';
import { getExchangeRates } from '@/app/lib/prices';
import { SearchBar } from './search-bar';
import { JourneyList } from './journey-list';
import { getDurationFilter } from './duration-config';
import { journeyMatchesContinent } from './continent-config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = { title: 'Explore' };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; durMin?: string; durMax?: string; continent?: string; country?: string; owner?: string; liked?: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) redirect('/');
  const signInType = session.user.sign_in_type ?? 'Google';
  const { q, durMin, durMax, continent, country, owner, liked } = await searchParams;

  const [allJourneys, prefs, rates] = await Promise.all([
    fetchExploreJourneys(session.user.email, signInType),
    fetchUserPreferences(session.user.email, signInType),
    getExchangeRates(),
  ]);
  const viewerCurrency = prefs.currency ?? 'USD';
  const { minDays, maxDays, isDefault } = getDurationFilter(durMin, durMax);

  const journeys = allJourneys.filter((j) => {
    if (liked === '1' && !j.viewer_liked) return false;
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
    <main className="w-full pb-12 min-h-[calc(100vh-57px)] bg-zinc-100 dark:bg-zinc-900">
      <div className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900 pt-6 pb-4">
        <div className="max-w-3xl mx-auto px-4">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        <JourneyList journeys={journeys} viewerCurrency={viewerCurrency} rates={rates} />
      </div>
    </main>
  );
}
