import { fetchAccommodationByDestinationId, fetchDestinationById } from '@/app/lib/data';
import { upsertAccommodation } from '@/app/journeys/[id]/destinations/actions';
import { Location } from '@/app/ui/location-autocomplete';
import { ImageUpload } from '@/app/ui/image-upload';
import { PriceField } from '../../events/price-field';

export const metadata = { title: 'Edit Accommodation' };

export default async function EditAccommodationPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/accommodation/edit'>) {
  const { id: journeyId, destinationId } = await props.params;

  const [accommodation, destination] = await Promise.all([
    fetchAccommodationByDestinationId(destinationId),
    fetchDestinationById(destinationId),
  ]);

  const action = upsertAccommodation.bind(null, destinationId);

  return (
    <main className="w-[350px] mx-auto px-4 py-12">
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
            autoComplete="off"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <ImageUpload currentImageUrl={accommodation?.image_url ?? null} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
          <Location
            name="location"
            placeholder="Search location…"
            syncInputId="name"
            defaultLocationName={accommodation?.location_name ?? ''}
            defaultLat={accommodation?.latitude != null ? String(accommodation.latitude) : ''}
            defaultLon={accommodation?.longitude != null ? String(accommodation.longitude) : ''}
            defaultValue={accommodation?.location_name ? accommodation.location_name.split(',')[0].trim() : ''}
            locationIdFieldName="location_id"
            defaultLocationId={accommodation?.location_id ?? ''}
            fallbackCenter={destination?.latitude != null && destination?.longitude != null ? { lat: destination.latitude, lon: destination.longitude } : undefined}
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
        <input type="hidden" name="price_id" value={accommodation?.price_id ?? ''} />
        <PriceField defaultPrice={accommodation?.price} defaultCurrency={accommodation?.price_currency} />
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
        <div className="flex flex-col gap-2">
          <label htmlFor="memo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Memo
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={3}
            defaultValue={accommodation?.memo ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white resize-none"
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
