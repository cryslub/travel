'use client';

import { useState } from 'react';
import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import MovingIcon from '@mui/icons-material/Moving';
import { MoreOptionsEventButton } from './destination-buttons';

const eventIcons: Record<string, ElementType<SvgIconProps>> = {
  Site: LocationOnOutlinedIcon,
  Meal: RestaurantOutlinedIcon,
  Tour: TourOutlinedIcon,
  Activity: StarBorderOutlinedIcon,
  Transfer: MovingIcon,
};

type EventActivity = {
  id: string;
  name: string | null;
  type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  link?: string | null;
  image_url?: string | null;
  price?: number | null;
  price_currency?: string | null;
};

function formatTime(t: string) {
  const d = new Date(t);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function EventItem({ activity, journeyId, destinationId }: {
  activity: EventActivity;
  journeyId: string;
  destinationId: string;
}) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const Icon = (activity.type && eventIcons[activity.type]) || StarBorderOutlinedIcon;

  return (
    <div className="flex flex-col py-1.5">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {activity.image_url && !imageExpanded
            ? (
              <img
                src={activity.image_url}
                alt=""
                className="w-10 h-10 rounded-md object-cover flex-shrink-0 cursor-pointer"
                onClick={() => setImageExpanded(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 flex-shrink-0">
                <Icon style={{ fontSize: 16 }} className="text-white" />
              </div>
            )}
          <div className="flex flex-col gap-0.5 min-w-0">
            {activity.link
              ? <a href={activity.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{activity.name}</a>
              : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activity.name}</span>
            }
            {(activity.start_time || activity.end_time) && (
              <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
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
            {activity.price != null && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('en', { style: 'currency', currency: activity.price_currency ?? 'USD' }).format(activity.price)}
              </span>
            )}
          </div>
        </div>
        <MoreOptionsEventButton journeyId={journeyId} destinationId={destinationId} eventId={activity.id} />
      </div>
      {imageExpanded && activity.image_url && (
        <img
          src={activity.image_url}
          alt=""
          className="w-full rounded-lg object-cover mt-2 cursor-pointer"
          onClick={() => setImageExpanded(false)}
        />
      )}
    </div>
  );
}
