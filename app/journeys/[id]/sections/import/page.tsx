import { fetchJourneys, fetchSectionsByJourneyId, fetchUnsectionedDestinationCount, fetchJourneyById } from '@/app/lib/data';
import { importSections } from '../actions';
import { notFound, redirect } from 'next/navigation';
import { ImportSectionsForm } from './import-sections-form';
import { getServerSession } from 'next-auth';

export default async function ImportSectionsPage(props: PageProps<'/journeys/[id]/sections/import'>) {
  const { id: journeyId } = await props.params;
  const session = await getServerSession();
  if (!session?.user?.email) redirect('/');

  const journey = await fetchJourneyById(journeyId);
  if (!journey) notFound();

  const signInType = session.user.sign_in_type ?? 'Google';
  const allJourneys = await fetchJourneys(session.user.email, signInType);
  const otherJourneys = allJourneys.filter((j) => j.id !== journeyId);

  const journeysWithSections = await Promise.all(
    otherJourneys.map(async (j) => {
      const [sections, noneCount] = await Promise.all([
        fetchSectionsByJourneyId(j.id),
        fetchUnsectionedDestinationCount(j.id),
      ]);
      return { id: j.id, name: j.name, sections, noneCount };
    })
  );

  const action = importSections.bind(null, journeyId);

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
          <h1 className="text-3xl font-semibold">Import Sections</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">This will also import the destinations of the section to the journey.</p>
        </div>
        <ImportSectionsForm
          journeys={journeysWithSections}
          action={action}
          cancelHref={`/journeys/${journeyId}/sections`}
        />
      </div>
    </main>
  );
}
