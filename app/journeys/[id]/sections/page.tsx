import { fetchSectionsByJourneyId, fetchJourneyById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { BackToDestinationsButton, CreateSectionButton, ImportSectionButton, OverviewButton, EditSectionButton, DeleteSectionButton } from './sections-buttons';

export async function generateMetadata(props: PageProps<'/journeys/[id]/sections'>) {
  const { id } = await props.params;
  const journey = await fetchJourneyById(id);
  return { title: journey ? `Sections · ${journey.name}` : 'Sections' };
}

export default async function SectionsPage(props: PageProps<'/journeys/[id]/sections'>) {
  const { id: journeyId } = await props.params;
  const [journey, sections] = await Promise.all([
    fetchJourneyById(journeyId),
    fetchSectionsByJourneyId(journeyId),
  ]);

  if (!journey) notFound();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-zinc-100 dark:bg-zinc-900 px-4 py-12 min-w-[350px]">
      <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <BackToDestinationsButton journeyId={journeyId} />
          <div className="flex gap-2">
            <OverviewButton journeyId={journeyId} />
            <ImportSectionButton journeyId={journeyId} />
            <CreateSectionButton journeyId={journeyId} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
          <h1 className="text-3xl font-semibold">Sections</h1>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {sections.map((section) => (
          <li key={section.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-sm font-medium">{section.name}</span>
            <div className="flex gap-2">
              <EditSectionButton journeyId={journeyId} sectionId={section.id} />
              <DeleteSectionButton journeyId={journeyId} sectionId={section.id} />
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
