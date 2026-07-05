import { getServerSession } from 'next-auth';
import { SignOutButton } from '@/app/ui/navbar';

export default async function JourneysLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <>
      <header className="sticky top-0 z-[1001] flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <a href="/journeys" className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
          Journey
        </a>
        <div className="flex items-center gap-2">
          {session?.user?.email && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{session.user.email}</span>
          )}
          <SignOutButton />
        </div>
      </header>
      {children}
    </>
  );
}
