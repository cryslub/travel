'use client';

import CloseIcon from '@mui/icons-material/Close';
import { EditAccommodationButton } from '@/app/journeys/[id]/destinations/destination-buttons';

type Accommodation = {
  name: string | null;
  link?: string | null;
  image_url?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  memo?: string | null;
  price?: number | null;
  price_currency?: string | null;
};

function formatTime(t: string) {
  return new Date(`1970-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function AccommodationModal({ accommodation, preferredCurrency, journeyId, destinationId, destinationName, onDestinationClick, onClose }: {
  accommodation: Accommodation;
  preferredCurrency?: string;
  journeyId?: string;
  destinationId?: string;
  destinationName?: string;
  onDestinationClick?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 mx-4 flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800 max-h-[80vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
          <div className="flex flex-col">
            {destinationName && (
              onDestinationClick ? (
                <button
                  type="button"
                  onClick={onDestinationClick}
                  className="text-left text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  {destinationName}
                </button>
              ) : (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{destinationName}</span>
              )
            )}
            <span className="text-lg font-medium">{accommodation.name}</span>
            {accommodation.price != null && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('en', { style: 'currency', currency: preferredCurrency ?? accommodation.price_currency ?? 'USD' }).format(accommodation.price)}
              </span>
            )}
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-1">
            {journeyId && destinationId && (
              <EditAccommodationButton journeyId={journeyId} destinationId={destinationId} />
            )}
            <button
              type="button"
              onMouseDown={onClose}
              className="rounded-full p-1.5 text-sm text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 p-4">
          {accommodation.image_url && (
            <img src={accommodation.image_url} alt="" className="w-full rounded-lg object-cover max-h-64" />
          )}
          {(accommodation.check_in || accommodation.check_out) && (
            <div className="flex gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              {accommodation.check_in && <span>Check-in: {formatTime(accommodation.check_in)}</span>}
              {accommodation.check_out && <span>Check-out: {formatTime(accommodation.check_out)}</span>}
            </div>
          )}
          {accommodation.link && (
            <a
              href={accommodation.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {accommodation.link}
            </a>
          )}
          {accommodation.memo && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{accommodation.memo}</p>
          )}
        </div>
      </div>
    </div>
  );
}
