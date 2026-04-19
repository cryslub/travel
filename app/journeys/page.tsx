import { fetchJourneys } from '@/app/lib/data';
import { DeleteButton } from './delete-button';
import { JourneyButtons, CreateJourneyButton } from './journey-buttons';

export default async function JourneysPage() {
  const journeys = await fetchJourneys();

  return (
    <main className="w-full px-4 py-12 min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Journeys</h1>
        <CreateJourneyButton />
      </div>
      <ul className="flex flex-col gap-4">
        {journeys.map((journey) => (
          <li key={journey.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-lg font-medium">{journey.name} </span>
            <div className="flex gap-2">
              <JourneyButtons id={journey.id} />
              <DeleteButton id={journey.id} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
