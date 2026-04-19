import { notFound } from 'next/navigation';
import { fetchEventsByDestinationId } from '@/app/lib/data';
import { updateEvent } from '@/app/journeys/[id]/destinations/actions';
import { EventTimeFields } from '../../time-fields';

export default async function EditEventPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/events/[eventId]/edit'>) {
  const { id: journeyId, destinationId, eventId } = await props.params;
  const events = await fetchEventsByDestinationId(destinationId);
  const event = events.find((e) => e.id === eventId);

  if (!event) notFound();

  const action = updateEvent.bind(null, eventId, destinationId);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Event</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={event.name ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
          <select
            id="type"
            name="type"
            defaultValue={event.type ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          >
            <option value="">Select type</option>
            <option value="Site">Site</option>
            <option value="Meal">Meal</option>
            <option value="Tour">Tour</option>
            <option value="Activity">Activity</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
        <EventTimeFields
          defaultStartTime={event.start_time ? (() => { const d = new Date(event.start_time!); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })() : ''}
          defaultEndTime={event.end_time ? (() => { const d = new Date(event.end_time!); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })() : ''}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="link" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Link</label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={event.link ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="memo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Memo</label>
          <textarea
            id="memo"
            name="memo"
            rows={4}
            defaultValue={event.memo ?? ''}
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
