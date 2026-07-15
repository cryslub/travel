'use client';

import { useState } from 'react';
import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import MovingIcon from '@mui/icons-material/Moving';
import { MemoIcon } from '@/app/ui/memo-icon';

const eventIcons: Record<string, ElementType<SvgIconProps>> = {
  Site: LocationOnOutlinedIcon,
  Meal: RestaurantOutlinedIcon,
  Tour: TourOutlinedIcon,
  Activity: StarBorderOutlinedIcon,
  Transfer: MovingIcon,
};

const eventTypeColors: Record<string, string> = {
  Site: '#3b82f6',
  Meal: '#f59e0b',
  Tour: '#10b981',
  Activity: '#8b5cf6',
  Transfer: '#64748b',
};

type EventActivity = {
  id: string;
  name: string | null;
  type: string | null;
  link: string | null;
  image_url: string | null;
  memo: string | null;
  price: number | null;
  price_currency: string | null;
};

export function ExploreEventItem({ activity }: { activity: EventActivity }) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const Icon = (activity.type && eventIcons[activity.type]) || StarBorderOutlinedIcon;
  const color = (activity.type && eventTypeColors[activity.type]) || '#3b82f6';

  return (
    <div className="flex flex-col py-1.5">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: color }}>
          <Icon style={{ fontSize: 16 }} className="text-white" />
        </div>
        {activity.image_url && !imageExpanded && (
          <img
            src={activity.image_url}
            alt=""
            className="w-10 h-10 rounded-md object-cover flex-shrink-0 cursor-pointer"
            onClick={() => setImageExpanded(true)}
          />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1">
            {activity.link
              ? <a href={activity.link} target="_blank" rel="noopener noreferrer" title="External link" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{activity.name}</a>
              : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activity.name}</span>
            }
            {activity.memo && <MemoIcon memo={activity.memo} />}
          </div>
          {activity.price != null && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              {new Intl.NumberFormat('en', { style: 'currency', currency: activity.price_currency ?? 'USD' }).format(activity.price)}
            </span>
          )}
        </div>
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
