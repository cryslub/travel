import { fetchSectionsByJourneyId, fetchJourneyById } from '@/app/lib/data';
import { deleteSection } from './actions';
import { notFound } from 'next/navigation';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { BackToDestinationsButton, CreateSectionButton, EditSectionButton } from './sections-buttons';

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
      <div className="flex items-end justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
          <h1 className="text-3xl font-semibold">Sections</h1>
        </div>
        <div className="flex gap-2">
          <BackToDestinationsButton journeyId={journeyId} />
          <CreateSectionButton journeyId={journeyId} />
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {sections.map((section) => (
          <li key={section.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-sm font-medium">{section.name}</span>
            <div className="flex gap-2">
              <EditSectionButton journeyId={journeyId} sectionId={section.id} />
              <form action={deleteSection.bind(null, section.id, journeyId)}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-200 px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
