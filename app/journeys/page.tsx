import { fetchJourneys } from '@/app/lib/data';
import { JourneyButtons, CreateJourneyButton } from './journey-buttons';
import { CountryBadge } from '@/app/ui/country-badge';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Journeys' };

export default async function JourneysPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/');
  const signInType = session.user.sign_in_type ?? 'Google';
  const journeys = await fetchJourneys(session.user.email, signInType);

  return (
    <main className="w-full px-4 py-12 min-h-[calc(100vh-57px)] bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="mx-auto flex w-[350px] items-end justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Journeys</h1>
          <div className="flex items-center gap-2">
            <CreateJourneyButton />
          </div>
        </div>
        <ul className="flex flex-col items-center gap-4">
          {journeys.map((journey) => (
            <li key={journey.id} className="flex w-[350px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              {journey.image_url && (
                <a href={`/journeys/${journey.id}/destinations`} title="Destinations" className="block">
                  <img src={journey.image_url} alt="" className="h-40 w-full object-cover" />
                </a>
              )}
              <div className="flex items-center justify-between">
                <div className="flex flex-1 min-w-0 flex-col justify-center py-4 pl-6">
                  {(journey.start_date || (journey.likes ?? 0) > 0) && (
                    <div className="flex items-center gap-2">
                      {journey.start_date && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(journey.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                          {journey.end_date && <>
                            {' ~ '}{new Date(journey.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                            {' · '}{Math.round((new Date(journey.end_date).getTime() - new Date(journey.start_date).getTime()) / 86400000) + 1}d
                          </>}
                        </span>
                      )}
                      {(journey.likes ?? 0) > 0 && (
                        <div className="ml-auto flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                          <FavoriteIcon sx={{ fontSize: 12 }} className="text-rose-400" />
                          <span>{journey.likes}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <a href={`/journeys/${journey.id}/destinations`} title="Destinations" className="truncate text-lg font-medium hover:underline">{journey.name}</a>
                  {journey.description && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 shrink-0">{journey.description}</span>
                  )}
                  {journey.total_price != null && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="text-xs">Budget </span>
                      {new Intl.NumberFormat('en', { style: 'currency', currency: journey.currency ?? 'USD' }).format(journey.total_price)}
                    </span>
                  )}
                  {journey.countries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {journey.countries.map((code) => (
                        <CountryBadge key={code} code={code} />
                      ))}
                    </div>
                  )}
                  {journey.original_id && (
                    journey.original_name ? (
                      <a
                        href={`/explore/${journey.original_id}/destinations`}
                        className="mt-2 text-xs text-zinc-400 hover:underline dark:text-zinc-500"
                      >
                        Imported from {journey.original_name}
                      </a>
                    ) : (
                      <span className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">Imported from a deleted journey</span>
                    )
                  )}
                </div>
                <div className="pr-4 flex-shrink-0">
                  <JourneyButtons id={journey.id} isPrivate={journey.privacy === 'private'} />
                </div>
              </div>
            </li>
          ))}
          {journeys.length === 0 && (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">No journeys yet.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
