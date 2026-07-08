import { getServerSession } from 'next-auth';
import { SignOutButton } from '@/app/ui/navbar';
import { fetchUserPreferences } from '@/app/lib/data';

export default async function JourneysLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const signInType = (session?.user as any)?.sign_in_type ?? 'Google';
  const prefs = session?.user?.email ? await fetchUserPreferences(session.user.email, signInType) : null;
  const displayLabel = prefs?.name || session?.user?.email;

  return (
    <>
      <header className="sticky top-0 z-[1001] flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <a href="/journeys" className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-zinc-800 transition-opacity hover:opacity-70 dark:text-zinc-100">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>
          Journey
        </a>
        <div className="flex items-center gap-2">
          {displayLabel && (
            <a href="/preferences" className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">{displayLabel}</a>
          )}
          <SignOutButton />
        </div>
      </header>
      {children}
    </>
  );
}
