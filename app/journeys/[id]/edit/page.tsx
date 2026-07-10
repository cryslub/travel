import { notFound } from 'next/navigation';
import { fetchJourneyById, fetchUserPreferences } from '@/app/lib/data';
import { updateJourney, getJourneyCountryCodes } from '../../actions';
import { ImageUpload } from '@/app/ui/image-upload';
import { CountrySelector } from '@/app/ui/country-selector';
import { CurrencySelector } from '@/app/ui/currency-selector';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { JourneyDateFields } from '../../date-fields';

export const metadata = { title: 'Edit Journey' };

export default async function EditJourneyPage(props: PageProps<'/journeys/[id]/edit'>) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  const signInType = (session?.user as any)?.sign_in_type ?? 'Google';
  const prefs = session?.user?.email
    ? await fetchUserPreferences(session.user.email, signInType)
    : null;
  const journey = await fetchJourneyById(id);

  if (!journey) notFound();

  const action = updateJourney.bind(null, id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Journey</h1>
      <form action={action} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={journey.name}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <ImageUpload currentImageUrl={journey.image_url} />
        <JourneyDateFields
          defaultStartDate={journey.start_date ? new Date(journey.start_date).toLocaleDateString('en-CA') : ''}
          defaultEndDate={journey.end_date ? new Date(journey.end_date).toLocaleDateString('en-CA') : ''}
          previousStartDate={journey.start_date ? new Date(journey.start_date).toLocaleDateString('en-CA') : ''}
          showShiftCheckbox
        />
        <CountrySelector name="countries" defaultValue={journey.countries} onAutoGenerate={getJourneyCountryCodes.bind(null, id)} />
        <CurrencySelector defaultCurrency={journey.currency ?? prefs?.currency ?? 'USD'} />
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Save
          </button>
          <a
            href="/journeys"
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
