import { fetchTransportByDestinationId, fetchDestinationById } from '@/app/lib/data';
import { upsertTransport } from '@/app/journeys/[id]/destinations/actions';
import { TransportTimeFields } from '../time-fields';

export default async function EditTransportPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/transport/edit'>) {
  const { id: journeyId, destinationId } = await props.params;
  const [transport, destination] = await Promise.all([
    fetchTransportByDestinationId(destinationId),
    fetchDestinationById(destinationId),
  ]);

  const action = upsertTransport.bind(null, destinationId);

  const datePrefix = destination?.start_date
    ? new Date(destination.start_date).toLocaleDateString('en-CA')
    : new Date().toLocaleDateString('en-CA');

  const toDateTimeLocal = (time: string | null) =>
    time ? (time.includes('T') ? time.slice(0, 16) : `${datePrefix}T${time.slice(0, 5)}`) : '';

  const defaultStartTime = transport?.start_time
    ? toDateTimeLocal(transport.start_time)
    : `${datePrefix}T00:00`;

  const defaultEndTime = transport?.end_time
    ? toDateTimeLocal(transport.end_time)
    : `${datePrefix}T00:00`;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Transport</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={transport?.type ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          >
            <option value="">Select type</option>
            <option value="Flight">Flight</option>
            <option value="Train">Train</option>
            <option value="Bus">Bus</option>
            <option value="Car">Car</option>
            <option value="Ferry">Ferry</option>
            <option value="Combined">Combined</option>
          </select>
        </div>
        <TransportTimeFields
          defaultStartTime={defaultStartTime}
          defaultEndTime={defaultEndTime}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="start_terminal" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start Terminal
          </label>
          <input
            id="start_terminal"
            name="start_terminal"
            type="text"
            defaultValue={transport?.start_terminal ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="end_terminal" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            End Terminal
          </label>
          <input
            id="end_terminal"
            name="end_terminal"
            type="text"
            defaultValue={transport?.end_terminal ?? ''}
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
            defaultValue={transport?.link ?? ''}
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
