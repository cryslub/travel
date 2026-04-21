import { fetchSectionsByJourneyId, fetchJourneyById } from '@/app/lib/data';
import { deleteSection } from './actions';
import { notFound } from 'next/navigation';

export default async function SectionsPage(props: PageProps<'/journeys/[id]/sections'>) {
  const { id: journeyId } = await props.params;
  const [journey, sections] = await Promise.all([
    fetchJourneyById(journeyId),
    fetchSectionsByJourneyId(journeyId),
  ]);

  if (!journey) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 min-w-[350px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
          <h1 className="text-3xl font-semibold">Sections</h1>
        </div>
        <div className="flex gap-2">
          <a
            href={`/journeys/${journeyId}/destinations`}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Back
          </a>
          <a
            href={`/journeys/${journeyId}/sections/create`}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Add
          </a>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {sections.map((section) => (
          <li key={section.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-sm font-medium">{section.name}</span>
            <div className="flex gap-2">
              <a
                href={`/journeys/${journeyId}/sections/${section.id}/edit`}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
              >
                Edit
              </a>
              <form action={deleteSection.bind(null, section.id, journeyId)}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {sections.length === 0 && (
          <li className="text-sm text-zinc-500 dark:text-zinc-400">No sections yet.</li>
        )}
      </ul>
    </main>
  );
}
