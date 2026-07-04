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
                    <img src={journey.image_url} alt="" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
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
                  {journey.countries.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {journey.countries.map((code) => (
                        <span key={code} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-700 dark:text-zinc-300">
                          <img
                            src={`https://flagcdn.com/16x12/${code.toLowerCase()}.png`}
                            srcSet={`https://flagcdn.com/32x24/${code.toLowerCase()}.png 2x, https://flagcdn.com/48x36/${code.toLowerCase()}.png 3x`}
                            width={16}
                            height={12}
                            alt={code}
                          />
                          <span className="font-mono">{code}</span>
                        </span>
                      ))}
                    </div>
                  )}
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
