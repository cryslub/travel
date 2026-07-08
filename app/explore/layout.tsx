import { getServerSession } from 'next-auth';
import { fetchUserPreferences, fetchJourneys } from '@/app/lib/data';
import { Sidebar } from '@/app/ui/sidebar';

export default async function ExploreLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const signInType = (session?.user as any)?.sign_in_type ?? 'Google';
  const [prefs, journeys] = session?.user?.email
    ? await Promise.all([
        fetchUserPreferences(session.user.email, signInType),
        fetchJourneys(session.user.email, signInType),
      ])
    : [null, []];
  const displayLabel = prefs?.name || session?.user?.email;

  return (
    <div className="sm:flex">
      <Sidebar displayLabel={displayLabel} journeys={journeys} />
      <div className="pb-[57px] sm:pb-0 sm:flex-1 sm:min-w-0 min-h-[calc(100vh-57px)] sm:min-h-screen">{children}</div>
    </div>
  );
}
