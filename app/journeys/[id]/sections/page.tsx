import { fetchSectionsByJourneyId, fetchJourneyById } from '@/app/lib/data';
import { deleteSection } from './actions';
import { notFound } from 'next/navigation';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AddIcon from '@mui/icons-material/Add';

export default async function SectionsPage(props: PageProps<'/journeys/[id]/sections'>) {
  const { id: journeyId } = await props.params;
  const [journey, sections] = await Promise.all([
    fetchJourneyById(journeyId),
    fetchSectionsByJourneyId(journeyId),
  ]);

  if (!journey) notFound();

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-900 px-4 py-12 min-w-[350px]">
      <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
          <h1 className="text-3xl font-semibold">Sections</h1>
        </div>
        <div className="flex gap-2">
          <a
            href={`/journeys/${journeyId}/destinations`}
            className="rounded-full border border-zinc-200 px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronLeftIcon fontSize="small" />
          </a>
          <a
            href={`/journeys/${journeyId}/sections/create`}
            className="rounded-full bg-black px-4 py-1.5 text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <AddIcon fontSize="small" />
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
                className="rounded-full border border-zinc-200 px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
              >
                <EditOutlinedIcon fontSize="small" />
              </a>
              <form action={deleteSection.bind(null, section.id, journeyId)}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-200 px-4 py-1.5 text-red-500 transition-colors hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </button>
              </form>
            </div>
          </li>
        ))}
        {sections.length === 0 && (
          <li className="text-sm text-zinc-500 dark:text-zinc-400">No sections yet.</li>
        )}
      </ul>
      </div>
    </main>
  );
}
