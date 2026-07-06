import { getServerSession } from 'next-auth';
import { SignOutButton } from '@/app/ui/navbar';

export default async function PreferencesLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <>
      <header className="sticky top-0 z-[1001] flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <a href="/journeys" className="text-base font-semibold tracking-tight text-zinc-800 transition-opacity hover:opacity-70 dark:text-zinc-100">
          Journey
        </a>
        <div className="flex items-center gap-2">
          {session?.user?.email && (
            <a href="/preferences" className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">{session.user.email}</a>
          )}
          <SignOutButton />
        </div>
      </header>
      {children}
    </>
  );
}
