import { notFound } from 'next/navigation';
import { fetchDestinationById, fetchSectionsByJourneyId } from '@/app/lib/data';
import { updateDestination } from '@/app/journeys/[id]/destinations/actions';
import { Location } from '@/app/ui/location-autocomplete';
import { ImageUpload } from '@/app/ui/image-upload';

export const metadata = { title: 'Edit Destination' };

export default async function EditDestinationPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/edit'>) {
  const { id: journeyId, destinationId } = await props.params;
  const [destination, sections] = await Promise.all([
    fetchDestinationById(destinationId),
    fetchSectionsByJourneyId(journeyId),
  ]);

  if (!destination) notFound();

  const action = updateDestination.bind(null, destinationId);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Destination</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <input type="hidden" name="previous_start_date" value={destination.start_date ? new Date(destination.start_date).toLocaleDateString('en-CA') : ''} />
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={destination.name}
            autoComplete="off"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <ImageUpload currentImageUrl={destination.image_url} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
          <Location
            name="location"
            placeholder="Search location…"
            syncInputId="name"
            defaultLocationName={destination.location_name ?? ''}
            defaultLat={destination.latitude != null ? String(destination.latitude) : ''}
            defaultLon={destination.longitude != null ? String(destination.longitude) : ''}
            defaultValue={destination.location_name ? destination.location_name.split(',')[0].trim() : ''}
            locationIdFieldName="location_id"
            defaultLocationId={destination.location_id ?? ''}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="start_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start Date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={destination.start_date ? new Date(destination.start_date).toLocaleDateString('en-CA') : ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            <input type="checkbox" name="shift_dates" value="1" className="rounded" />
            Also shift the dates of the transport and events.
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input type="checkbox" name="shift_following" value="1" className="rounded" />
            Also shift the dates of the following destinations and their child assets.
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="section_id" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Section</label>
          <select
            id="section_id"
            name="section_id"
            defaultValue={destination.section_id ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          >
            <option value="">None</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
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
