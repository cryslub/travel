import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { fetchUserPreferences } from '@/app/lib/data';
import { PreferenceViewToggle } from './view-toggle';
import { CurrencySelector } from './currency-selector';
import { DisplayNameInput } from './display-name-input';

export default async function PreferencesPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect('/');

  const signInType = (session.user as any).sign_in_type ?? 'Google';
  const prefs = await fetchUserPreferences(session.user.email, signInType);

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-zinc-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Preferences</h1>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-6 flex flex-col gap-0.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</span>
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{session.user.email}</span>
          </div>
          <div className="mb-6">
            <DisplayNameInput currentName={prefs.name} />
          </div>
          <PreferenceViewToggle currentView={prefs.destinations_view} />
          <div className="mt-6">
            <CurrencySelector currentCurrency={prefs.currency} />
          </div>
        </div>
      </div>
    </main>
  );
}
