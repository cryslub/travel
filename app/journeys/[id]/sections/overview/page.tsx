import { fetchSectionsByJourneyId, fetchDestinationsByJourneyId, fetchJourneyById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { SectionsAccordion } from './sections-accordion';

export async function generateMetadata(props: PageProps<'/journeys/[id]/sections/overview'>) {
  const { id } = await props.params;
  const journey = await fetchJourneyById(id);
  return { title: journey ? `Overview · ${journey.name}` : 'Overview' };
}

export default async function SectionsOverviewPage(props: PageProps<'/journeys/[id]/sections/overview'>) {
  const { id: journeyId } = await props.params;
  const searchParams = await (props as any).searchParams as { from?: string } | undefined;
  const backHref = searchParams?.from ?? `/journeys/${journeyId}/sections`;
  const [journey, sections, destinations] = await Promise.all([
    fetchJourneyById(journeyId),
    fetchSectionsByJourneyId(journeyId),
    fetchDestinationsByJourneyId(journeyId),
  ]);

  if (!journey) notFound();

  const sectionsWithDests = [
    {
      id: '__none__',
      name: 'None',
      destinations: destinations
        .filter((d) => d.section_id === null)
        .map((d) => ({ id: d.id, name: d.name, start_date: d.start_date })),
    },
    ...sections.map((section) => ({
      id: section.id,
      name: section.name,
      destinations: destinations
        .filter((d) => d.section_id === section.id)
        .map((d) => ({ id: d.id, name: d.name, start_date: d.start_date })),
    })),
  ];

  return (
    <main className="min-h-[calc(100vh-57px)] bg-zinc-100 dark:bg-zinc-900 px-4 py-12 min-w-[350px]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <a
              href={backHref}
              title="Go back"
              className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
              </svg>
            </a>
            <a
              href={`/journeys/${journeyId}/sections/create?redirectTo=${encodeURIComponent(`/journeys/${journeyId}/sections/overview`)}`}
              title="Add section"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
              </svg>
            </a>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
            <h1 className="text-3xl font-semibold">Overview</h1>
          </div>
        </div>
        <SectionsAccordion sectionsWithDests={sectionsWithDests} journeyId={journeyId} />
      </div>
    </main>
  );
}
