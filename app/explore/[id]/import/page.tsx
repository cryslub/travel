import postgres from 'postgres';
import { fetchJourneyById, fetchSectionsByJourneyId } from '@/app/lib/data';
import { CountryBadge } from '@/app/ui/country-badge';
import { ImportConfirm } from './import-confirm';
import { notFound } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export const NONE_SECTION_ID = '__none__';

export default async function ImportJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [journey, sections, [{ count: noneCount }]] = await Promise.all([
    fetchJourneyById(id),
    fetchSectionsByJourneyId(id),
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM destinations
      WHERE journey_id = ${id} AND section_id IS NULL
    `,
  ]);

  const allSections = [
    ...sections.map((s) => ({ ...s, destination_count: s.destination_count ?? 0 })),
    ...(noneCount > 0 ? [{ id: NONE_SECTION_ID, name: 'None', destination_count: noneCount }] : []),
  ];

  if (!journey) notFound();

  return (
    <main className="h-[calc(100vh_-_57px)] bg-zinc-100 dark:bg-zinc-900 flex items-start justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-[350px] rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">

        {/* Journey header */}
        {journey.image_url && (
          <img src={journey.image_url} alt="" className="w-full h-40 object-cover" />
        )}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-700">
          <h1 className="text-xl font-semibold">{journey.name}</h1>
          {journey.start_date && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {new Date(journey.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
              {journey.end_date && (
                <> ~ {new Date(journey.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</>
              )}
            </p>
          )}
          {journey.countries && journey.countries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {journey.countries.map((code) => (
                <CountryBadge key={code} code={code} />
              ))}
            </div>
          )}
        </div>

        {/* Section selection + actions */}
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 text-center">
            Select sections to import into your account.
          </p>
          <ImportConfirm journeyId={id} sections={allSections} />
        </div>
      </div>
    </main>
  );
}
