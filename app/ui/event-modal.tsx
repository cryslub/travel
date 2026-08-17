'use client';

import CloseIcon from '@mui/icons-material/Close';
import { EditEventButton } from '@/app/journeys/[id]/destinations/destination-buttons';

type EventActivity = {
  id: string;
  name: string | null;
  type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  link?: string | null;
  image_url?: string | null;
  memo?: string | null;
  price?: number | null;
  price_currency?: string | null;
};

function formatTime(t: string) {
  const d = new Date(t);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function EventModal({ activity, preferredCurrency, journeyId, destinationId, destinationName, onDestinationClick, onClose }: {
  activity: EventActivity;
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
          <div className="flex flex-col gap-1">
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
            <span className="text-lg font-medium">{activity.name}</span>
            {activity.price != null && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('en', { style: 'currency', currency: activity.price_currency ?? 'USD' }).format(activity.price)}
              </span>
            )}
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-1">
            {journeyId && destinationId && (
              <EditEventButton journeyId={journeyId} destinationId={destinationId} eventId={activity.id} />
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
          {activity.image_url && (
            <img src={activity.image_url} alt="" className="w-full rounded-lg object-cover max-h-64" />
          )}
          {(activity.start_time || activity.end_time) && (
            <div className="flex gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              {activity.start_time && <span>{formatTime(activity.start_time)}</span>}
              {activity.start_time && activity.end_time && <span>~</span>}
              {activity.end_time && <span>{formatTime(activity.end_time)}</span>}
              {activity.start_time && activity.end_time && (() => {
                const diff = (new Date(activity.end_time!).getTime() - new Date(activity.start_time!).getTime()) / 60000;
                const h = Math.floor(Math.abs(diff) / 60);
                const m = Math.abs(diff) % 60;
                return <span>· {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
              })()}
            </div>
          )}
          {activity.link && (
            <a
              href={activity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {activity.link}
            </a>
          )}
          {activity.memo && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{activity.memo}</p>
          )}
        </div>
      </div>
    </div>
  );
}
