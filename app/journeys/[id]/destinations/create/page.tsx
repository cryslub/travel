import { createDestination } from '@/app/journeys/[id]/destinations/actions';
import { fetchJourneyById, fetchLatestDestinationStartDateByJourneyId, fetchSectionsByJourneyId } from '@/app/lib/data';

export default async function CreateDestinationPage(props: PageProps<'/journeys/[id]/destinations/create'>) {
  const { id } = await props.params;
  const [latestDate, journey, sections] = await Promise.all([
    fetchLatestDestinationStartDateByJourneyId(id),
    fetchJourneyById(id),
    fetchSectionsByJourneyId(id),
  ]);
  const raw = latestDate ?? journey?.start_date ?? null;
  const defaultStartDate = raw ? new Date(raw).toLocaleDateString('en-CA') : '';

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Create Destination</h1>
      <form action={createDestination} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={id} />
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="start_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start Date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={defaultStartDate}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="section_id" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Section</label>
          <select
            id="section_id"
            name="section_id"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          >
            <option value="">None</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Create
          </button>
          <a
            href={`/journeys/${id}/destinations`}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
