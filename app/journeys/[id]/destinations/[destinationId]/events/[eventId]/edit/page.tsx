import { notFound } from 'next/navigation';
import { fetchEventsByDestinationId, fetchDestinationById, fetchDestinationsByJourneyId } from '@/app/lib/data';
import { updateEvent } from '@/app/journeys/[id]/destinations/actions';
import { EventTimeFields } from '../../time-fields';
import { PriceField } from '../../price-field';
import { Location } from '@/app/ui/location-autocomplete';
import { EventTypeSelect } from '@/app/ui/event-type-select';
import { DestinationSelect } from '@/app/ui/destination-select';
import { ImageUpload } from '@/app/ui/image-upload';

export const metadata = { title: 'Edit Event' };

export default async function EditEventPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/events/[eventId]/edit'> & { searchParams?: Promise<Record<string, string>> }) {
  const { id: journeyId, destinationId, eventId } = await props.params;
  const from = (await props.searchParams)?.from ?? null;

  const [events, destination, allDestinations] = await Promise.all([
    fetchEventsByDestinationId(destinationId),
    fetchDestinationById(destinationId),
    fetchDestinationsByJourneyId(journeyId),
  ]);
  const event = events.find((e) => e.id === eventId);

  if (!event) notFound();

  const action = updateEvent.bind(null, eventId, destinationId);

  return (
    <main className="w-[350px] mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Event</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <input type="hidden" name="return_url" value={from ?? ''} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Destination</label>
          <DestinationSelect options={allDestinations.map((d) => ({ id: d.id, name: d.name, start_date: d.start_date ? new Date(d.start_date).toLocaleDateString('en-CA') : null }))} defaultId={destinationId} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={event.name ?? ''}
            autoComplete="off"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <ImageUpload currentImageUrl={event.image_url} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
          <Location
            name="location"
            placeholder="Search location…"
            syncInputId="name"
            defaultLocationName={event.location_name ?? ''}
            defaultLat={event.latitude != null ? String(event.latitude) : ''}
            defaultLon={event.longitude != null ? String(event.longitude) : ''}
            defaultValue={event.location_name ? event.location_name.split(',')[0].trim() : ''}
            locationIdFieldName="location_id"
            defaultLocationId={event.location_id ?? ''}
            fallbackCenter={destination?.latitude != null && destination?.longitude != null ? { lat: destination.latitude, lon: destination.longitude } : undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
          <EventTypeSelect defaultValue={event.type ?? 'Site'} />
        </div>
        <EventTimeFields
          defaultStartTime={event.start_time ? (() => { const d = new Date(event.start_time!); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })() : ''}
          defaultEndTime={event.end_time ? (() => { const d = new Date(event.end_time!); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })() : ''}
        />
        <input type="hidden" name="price_id" value={event.price_id ?? ''} />
        <PriceField defaultPrice={event.price} defaultCurrency={event.price_currency} />
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
