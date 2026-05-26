import { fetchSectionsByJourneyId, fetchDestinationsByJourneyId, fetchJourneyById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { SectionsAccordion } from './sections-accordion';

export default async function SectionsOverviewPage(props: PageProps<'/journeys/[id]/sections/overview'>) {
  const { id: journeyId } = await props.params;
  const [journey, sections, destinations] = await Promise.all([
    fetchJourneyById(journeyId),
    fetchSectionsByJourneyId(journeyId),
    fetchDestinationsByJourneyId(journeyId),
  ]);

  if (!journey) notFound();

  const sectionsWithDests = sections.map((section) => ({
    id: section.id,
    name: section.name,
    destinations: destinations
      .filter((d) => d.section_id === section.id)
      .map((d) => ({ id: d.id, name: d.name, start_date: d.start_date })),
  }));

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-900 px-4 py-12 min-w-[350px]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
            <h1 className="text-3xl font-semibold">Overview</h1>
          </div>
          <a
            href={`/journeys/${journeyId}/sections`}
            title="Back to sections"
            className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </a>
        </div>
        <SectionsAccordion sectionsWithDests={sectionsWithDests} journeyId={journeyId} />
      </div>
    </main>
  );
}
