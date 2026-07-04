import { fetchJourneys } from '@/app/lib/data';
import { JourneyButtons, CreateJourneyButton } from './journey-buttons';

export default async function JourneysPage() {
  const journeys = await fetchJourneys();

  return (
    <main className="w-full px-4 py-12 min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Journeys</h1>
          <CreateJourneyButton />
        </div>
        <ul className="flex flex-col gap-4">
          {journeys.map((journey) => (
            <li key={journey.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center gap-4">
                {journey.image_url && (
                  <a href={`/journeys/${journey.id}/destinations`}>
                    <img src={journey.image_url} alt="" className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                  </a>
                )}
                <div className="flex flex-col">
                  {journey.start_date && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(journey.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                      {journey.end_date && <> ~ {new Date(journey.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</>}
                    </span>
                  )}
                  <a href={`/journeys/${journey.id}/destinations`} className="text-lg font-medium hover:underline">{journey.name}</a>
                </div>
              </div>
              <JourneyButtons id={journey.id} />
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
