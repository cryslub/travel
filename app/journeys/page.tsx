import { fetchJourneys } from '@/app/lib/data';
import { JourneyButtons, CreateJourneyButton } from './journey-buttons';
import Image from 'next/image';

export default async function JourneysPage() {
  const journeys = await fetchJourneys();

  return (
    <main className="w-full px-4 py-12 min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col gap-1">
            <Image src="/logo.svg" alt="Journey" width={120} height={30} priority />
            <h1 className="text-3xl font-semibold tracking-tight">Journeys</h1>
          </div>
          <CreateJourneyButton />
        </div>
        <ul className="flex flex-col gap-4">
          {journeys.map((journey) => (
            <li key={journey.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex flex-col">
                {journey.start_date && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(journey.start_date).toLocaleDateString()}</span>
                )}
                <span className="text-lg font-medium">{journey.name}</span>
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
