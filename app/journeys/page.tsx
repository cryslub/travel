import { fetchJourneys } from '@/app/lib/data';
import { JourneyButtons, CreateJourneyButton } from './journey-buttons';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function JourneysPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect('/');
  const signInType = session.user.sign_in_type ?? 'Google';
  const journeys = await fetchJourneys(session.user.email, signInType);

  return (
    <main className="w-full px-4 py-12 min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Journeys</h1>
          <CreateJourneyButton />
        </div>
        <ul className="flex flex-col gap-4">
          {journeys.map((journey) => (
            <li key={journey.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-stretch gap-4 flex-1">
                {journey.image_url && (
                  <a href={`/journeys/${journey.id}/destinations`} className="flex-shrink-0 rounded-l-lg overflow-hidden">
                    <img src={journey.image_url} alt="" className="w-24 h-full object-cover" />
                  </a>
                )}
                <div className={`flex flex-col justify-center py-4 ${!journey.image_url ? 'pl-6' : ''}`}>
                  {journey.start_date && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(journey.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                      {journey.end_date && <> ~ {new Date(journey.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</>}
                    </span>
                  )}
                  <a href={`/journeys/${journey.id}/destinations`} className="text-lg font-medium hover:underline">{journey.name}</a>
                  {journey.total_price != null && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('en', { style: 'currency', currency: journey.currency ?? 'USD' }).format(journey.total_price)}
                    </span>
                  )}
                  {journey.countries.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {journey.countries.map((code) => (
                        <span key={code} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-700 dark:text-zinc-300">
                          <img
                            src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
                            srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
                            width={20}
                            height={15}
                            alt={code}
                          />
                          <span className="font-mono">{code}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="pr-4 flex-shrink-0">
                <JourneyButtons id={journey.id} />
              </div>
            </li>
          ))}
          {journeys.length === 0 && (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">No journeys yet.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
