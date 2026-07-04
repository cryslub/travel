import { notFound } from 'next/navigation';
import { fetchJourneys } from '@/app/lib/data';
import { updateJourney, getJourneyCountryCodes } from '../../actions';
import { ImageUpload } from '@/app/ui/image-upload';
import { CountrySelector } from '@/app/ui/country-selector';

export default async function EditJourneyPage(props: PageProps<'/journeys/[id]/edit'>) {
  const { id } = await props.params;
  const journeys = await fetchJourneys();
  const journey = journeys.find((j) => j.id === id);

  if (!journey) notFound();

  const action = updateJourney.bind(null, id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Journey</h1>
      <form action={action} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={journey.name}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <ImageUpload currentImageUrl={journey.image_url} />
        <input type="hidden" name="previous_start_date" value={journey.start_date ? new Date(journey.start_date).toLocaleDateString('en-CA') : ''} />
        <div className="flex flex-col gap-2">
          <label htmlFor="start_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Date</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={journey.start_date ? new Date(journey.start_date).toLocaleDateString('en-CA') : ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            <input type="checkbox" name="shift_destinations" value="1" className="rounded" />
            Also shift the dates of destinations.
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="end_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End Date</label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={journey.end_date ? new Date(journey.end_date).toLocaleDateString('en-CA') : ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <CountrySelector name="countries" defaultValue={journey.countries} onAutoGenerate={getJourneyCountryCodes.bind(null, id)} />
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Save
          </button>
          <a
            href="/journeys"
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
