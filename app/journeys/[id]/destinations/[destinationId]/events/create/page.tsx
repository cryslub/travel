import { createEvent } from '@/app/journeys/[id]/destinations/actions';
import { EventTypeSelect } from '@/app/ui/event-type-select';
import { DestinationSelect } from '@/app/ui/destination-select';
import { EventTimeFields } from '../time-fields';
import { PriceField } from '../price-field';
import { fetchDestinationById, fetchLatestEventEndTimeByDestinationId, fetchDestinationsByJourneyId } from '@/app/lib/data';
import { Location } from '@/app/ui/location-autocomplete';
import { ImageUpload } from '@/app/ui/image-upload';

export const metadata = { title: 'Create Event' };

export default async function CreateEventPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/events/create'> & { searchParams?: Promise<Record<string, string>> }) {
  const { id: journeyId, destinationId } = await props.params;
  const searchParams = await props.searchParams;
  const dateFromQuery = searchParams?.date;
  const startTimeFromQuery = searchParams?.startTime;
  const endTimeFromQuery = searchParams?.endTime;
  const from = searchParams?.from ?? null;
  const action = createEvent.bind(null, destinationId);

  const [destination, latestEndTime, allDestinations] = await Promise.all([
    fetchDestinationById(destinationId),
    fetchLatestEventEndTimeByDestinationId(destinationId),
    fetchDestinationsByJourneyId(journeyId),
  ]);

  // When coming from the calendar, find the destination that owns the target date.
  const targetStr = startTimeFromQuery ?? dateFromQuery ?? '';
  const targetDate = targetStr.slice(0, 10);
  let defaultDestinationId = destinationId;
  if (targetDate) {
    const toISO = (v: unknown) => new Date(v as string).toLocaleDateString('en-CA');
    const effective = (d: (typeof allDestinations)[0]) => {
      const date = toISO(d.start_date);
      const tTime = d.transport?.start_time;
      return tTime && tTime.slice(0, 10) === date ? tTime : `${date}T00:00`;
    };
    const sorted = allDestinations
      .filter((d) => d.start_date)
      .sort((a, b) => (effective(a) < effective(b) ? -1 : 1));
    let found: (typeof allDestinations)[0] | undefined;
    if (targetStr.length > 10) {
      found = sorted[0];
      for (const d of sorted) {
        if (effective(d) <= targetStr) found = d;
      }
    } else {
      let lastBefore: (typeof allDestinations)[0] | undefined;
      let firstOfDay: (typeof allDestinations)[0] | undefined;
      for (const d of sorted) {
        const date = toISO(d.start_date);
        if (date < targetDate) lastBefore = d;
        else if (date === targetDate && !firstOfDay) firstOfDay = d;
      }
      found = firstOfDay ?? lastBefore;
    }
    if (found) defaultDestinationId = found.id;
  }

  const fallbackDateTime = destination?.start_date
    ? `${new Date(destination.start_date).toLocaleDateString('en-CA')}T00:00`
    : '';
  const defaultStartTime = startTimeFromQuery ?? (dateFromQuery ? `${dateFromQuery}T00:00` : (latestEndTime ?? fallbackDateTime));
  const defaultEndTime = endTimeFromQuery ?? (dateFromQuery ? '' : (latestEndTime ?? fallbackDateTime));

  return (
    <main className="w-[350px] mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Create Event</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <input type="hidden" name="return_url" value={from ?? ''} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Destination</label>
          <DestinationSelect options={allDestinations.map((d) => ({ id: d.id, name: d.name, start_date: d.start_date ? new Date(d.start_date).toLocaleDateString('en-CA') : null }))} defaultId={defaultDestinationId} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="off"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <ImageUpload />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
          <Location
            name="location"
            placeholder="Search location…"
            syncInputId="name"
            fallbackCenter={destination?.latitude != null && destination?.longitude != null ? { lat: destination.latitude, lon: destination.longitude } : undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
          <EventTypeSelect />
        </div>
        <EventTimeFields defaultStartTime={defaultStartTime} defaultEndTime={defaultEndTime} autoEndHours={1} />
        <PriceField />
        <div className="flex flex-col gap-2">
          <label htmlFor="link" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Link</label>
          <input
            id="link"
            name="link"
            type="url"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="memo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Memo</label>
          <textarea
            id="memo"
            name="memo"
            rows={4}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Create
          </button>
          <a
            href={from ?? `/journeys/${journeyId}/destinations`}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
