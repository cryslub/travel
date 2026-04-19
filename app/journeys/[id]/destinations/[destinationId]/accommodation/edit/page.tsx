import { fetchAccommodationByDestinationId } from '@/app/lib/data';
import { upsertAccommodation } from '@/app/journeys/[id]/destinations/actions';

export default async function EditAccommodationPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/accommodation/edit'>) {
  const { id: journeyId, destinationId } = await props.params;
  const accommodation = await fetchAccommodationByDestinationId(destinationId);

  const action = upsertAccommodation.bind(null, destinationId);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Accommodation</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={accommodation?.name ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="check_in" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Check-in
          </label>
          <input
            id="check_in"
            name="check_in"
            type="time"
            defaultValue={accommodation?.check_in ?? '12:00'}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="check_out" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Check-out
          </label>
          <input
            id="check_out"
            name="check_out"
            type="time"
            defaultValue={accommodation?.check_out ?? '12:00'}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="link" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Link
          </label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={accommodation?.link ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Save
          </button>
          <a
            href={`/journeys/${journeyId}/destinations`}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
