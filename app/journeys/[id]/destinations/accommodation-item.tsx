'use client';

import { useState } from 'react';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import { MemoIcon } from '@/app/ui/memo-icon';

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

export function AccommodationItem({ accommodation }: { accommodation: Accommodation }) {
  const [imageExpanded, setImageExpanded] = useState(false);

  if (!accommodation.name) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {accommodation.image_url && !imageExpanded
          ? (
            <img
              src={accommodation.image_url}
              alt=""
              className="w-10 h-10 rounded-md object-cover flex-shrink-0 cursor-pointer"
              onClick={() => setImageExpanded(true)}
            />
          ) : (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 flex-shrink-0">
              <HotelOutlinedIcon style={{ fontSize: 16 }} className="text-white" />
            </div>
          )}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            {accommodation.link
              ? <a href={accommodation.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{accommodation.name}</a>
              : <span className="font-medium text-zinc-700 dark:text-zinc-300">{accommodation.name}</span>}
            {accommodation.memo && <MemoIcon memo={accommodation.memo} className="mr-6" />}
          </div>
          {(accommodation.check_in || accommodation.check_out) && (
            <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {accommodation.check_in && <span>Check-in: {formatTime(accommodation.check_in)}</span>}
              {accommodation.check_out && <span>Check-out: {formatTime(accommodation.check_out)}</span>}
            </div>
          )}
          {accommodation.price != null && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              {new Intl.NumberFormat('en', { style: 'currency', currency: accommodation.price_currency ?? 'USD' }).format(accommodation.price)}
            </span>
          )}
        </div>
      </div>
      {imageExpanded && accommodation.image_url && (
        <img
          src={accommodation.image_url}
          alt=""
          className="w-full rounded-lg object-cover cursor-pointer"
          onClick={() => setImageExpanded(false)}
        />
      )}
    </div>
  );
}
