'use client';

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import MovingIcon from '@mui/icons-material/Moving';
import FlightOutlinedIcon from '@mui/icons-material/FlightOutlined';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import DirectionsBoatOutlinedIcon from '@mui/icons-material/DirectionsBoatOutlined';
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { SvgIconProps } from '@mui/material';
import { ElementType } from 'react';
import { MemoIcon } from '@/app/ui/memo-icon';
import { AccommodationItem } from '@/app/journeys/[id]/destinations/accommodation-item';
import { DestinationCardMap } from '@/app/ui/destination-card-map';
import type { DestinationWithTransport } from '@/app/lib/definitions';

const eventIcons: Record<string, ElementType<SvgIconProps>> = {
  Site: LocationOnOutlinedIcon,
  Meal: RestaurantOutlinedIcon,
  Tour: TourOutlinedIcon,
  Activity: StarBorderOutlinedIcon,
  Transfer: MovingIcon,
};

const transportIcons: Record<string, ElementType<SvgIconProps>> = {
  Flight: FlightOutlinedIcon,
  Train: TrainOutlinedIcon,
  Bus: DirectionsBusOutlinedIcon,
  Car: DirectionsCarOutlinedIcon,
  Ferry: DirectionsBoatOutlinedIcon,
  Combined: MovingIcon,
};

const recordIcons: Record<string, ElementType<SvgIconProps>> = {
  Video: SmartDisplayOutlinedIcon,
  Blog: ArticleOutlinedIcon,
  Etc: NoteOutlinedIcon,
};

function formatTime(t: string) {
  const d = new Date(t);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ReadonlyDestinationsView({ destinations, preferredCurrency }: { destinations: DestinationWithTransport[]; preferredCurrency?: string }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [expandedEventImages, setExpandedEventImages] = useState<Set<string>>(new Set());
  const dest = selectedIdx !== null ? destinations[selectedIdx] : null;
  const nextDest = selectedIdx !== null ? (destinations[selectedIdx + 1] ?? null) : null;

  return (
    <>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700 max-w-2xl mx-auto">
        {destinations.map((d, i) => (
          <li key={d.id} className="flex items-center gap-4 py-3">
            <button
              type="button"
              onClick={() => setSelectedIdx(i)}
              className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md transition-opacity hover:opacity-75"
            >
              {d.image_url
                ? <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500"><LocationOnOutlinedIcon fontSize="small" /></div>
              }
            </button>
            <div className="flex-1 min-w-0">
              {d.start_date && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(d.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  className="font-medium text-zinc-900 dark:text-zinc-100 truncate hover:underline text-left"
                >
                  {d.name}
                </button>
                {d.section_name && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">{d.section_name}</span>
                )}
              </div>
              {d.price != null && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('en', { style: 'currency', currency: d.price_currency ?? 'USD' }).format(d.price)}
                </span>
              )}
            </div>
          </li>
        ))}
        {destinations.length === 0 && (
          <li className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No destinations.</li>
        )}
      </ul>

      {dest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onMouseDown={() => setSelectedIdx(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 mx-4 flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800 max-h-[80vh]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
              <div className="flex flex-col">
                {dest.start_date && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(dest.start_date).toLocaleDateString()}</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{dest.name}</span>
                  {dest.section_name && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{dest.section_name}</span>
                  )}
                </div>
                {dest.price != null && (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('en', { style: 'currency', currency: preferredCurrency ?? dest.price_currency ?? 'USD' }).format(dest.price)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onMouseDown={() => setSelectedIdx(null)}
                className="ml-4 rounded-full p-1.5 text-sm text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 p-4">
              {dest.image_url && (
                <img src={dest.image_url} alt="" className="w-full rounded-lg object-cover max-h-48" />
              )}

              {/* Transport */}
              {dest.transport && <div className="py-3 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Transport</span>
                <div className="mt-2 flex flex-col gap-1">
                  {dest.transport?.type && (() => {
                    const Icon = transportIcons[dest.transport!.type!];
                    const label = dest.transport!.link
                      ? <a href={dest.transport!.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{dest.transport!.type}</a>
                      : <span className="font-medium text-zinc-700 dark:text-zinc-300">{dest.transport!.type}</span>;
                    return (
                      <div className="flex items-center gap-2">
                        {Icon && <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>}
                        {label}
                        {dest.transport!.memo && <MemoIcon memo={dest.transport!.memo} />}
                      </div>
                    );
                  })()}
                  <div className="flex gap-3 text-zinc-500 dark:text-zinc-400">
                    {dest.transport?.start_time && <span>{dest.transport.start_time.split('T')[1]?.slice(0, 5) ?? dest.transport.start_time.slice(0, 5)}</span>}
                    {dest.transport?.start_time && dest.transport?.end_time && <span>~</span>}
                    {dest.transport?.end_time && <span>{dest.transport.end_time.split('T')[1]?.slice(0, 5) ?? dest.transport.end_time.slice(0, 5)}</span>}
                    {dest.transport?.start_time && dest.transport?.end_time && (() => {
                      const diff = (new Date(dest.transport!.end_time!).getTime() - new Date(dest.transport!.start_time!).getTime()) / 60000;
                      const h = Math.floor(Math.abs(diff) / 60);
                      const m = Math.abs(diff) % 60;
                      return <span>· {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
                    })()}
                  </div>
                  {(dest.transport?.start_terminal || dest.transport?.end_terminal) && (
                    <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {dest.transport!.start_terminal && <span>{dest.transport!.start_terminal}</span>}
                      {dest.transport!.start_terminal && dest.transport!.end_terminal && <span>→</span>}
                      {dest.transport!.end_terminal && <span>{dest.transport!.end_terminal}</span>}
                    </div>
                  )}
                  {dest.transport?.price != null && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('en', { style: 'currency', currency: dest.transport.price_currency ?? 'USD' }).format(dest.transport.price)}
                    </span>
                  )}
                </div>
              </div>}

              {/* Accommodation */}
              {dest.accommodation && <div className="py-3 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Accommodation</span>
                <div className="mt-2 flex flex-col gap-1">
                  <AccommodationItem accommodation={dest.accommodation} />
                </div>
              </div>}

              {/* Events */}
              {dest.events.length > 0 && <div className="py-3 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Events</span>
                <div className="mt-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
                  {dest.events.map((activity) => {
                    const Icon = (activity.type && eventIcons[activity.type]) || StarBorderOutlinedIcon;
                    const imgExpanded = expandedEventImages.has(activity.id);
                    return (
                      <div key={activity.id} className="flex flex-col py-1.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>
                          {activity.image_url && !imgExpanded && (
                            <img src={activity.image_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0 cursor-pointer" onClick={() => setExpandedEventImages(s => new Set(s).add(activity.id))} />
                          )}
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-1">
                              {activity.link
                                ? <a href={activity.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{activity.name}</a>
                                : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activity.name}</span>
                              }
                              {activity.memo && <MemoIcon memo={activity.memo} />}
                            </div>
                            {(activity.start_time || activity.end_time) && (
                              <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                                {activity.start_time && <span>{formatTime(activity.start_time)}</span>}
                                {activity.start_time && activity.end_time && <span>~</span>}
                                {activity.end_time && <span>{formatTime(activity.end_time)}</span>}
                              </div>
                            )}
                            {activity.price != null && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat('en', { style: 'currency', currency: activity.price_currency ?? 'USD' }).format(activity.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        {imgExpanded && activity.image_url && (
                          <img src={activity.image_url} alt="" className="w-full rounded-lg object-cover mt-2 cursor-pointer" onClick={() => setExpandedEventImages(s => { const n = new Set(s); n.delete(activity.id); return n; })} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>}

              {dest.latitude != null && dest.longitude != null && (
                <DestinationCardMap
                  lat={dest.latitude}
                  lon={dest.longitude}
                  eventMarkers={dest.events.filter((e) => e.latitude != null && e.longitude != null).map((e) => ({ lat: e.latitude!, lon: e.longitude!, name: e.name, type: e.type, image_url: e.image_url }))}
                  accommodationMarker={dest.accommodation?.latitude != null && dest.accommodation?.longitude != null ? { lat: dest.accommodation.latitude, lon: dest.accommodation.longitude, name: dest.accommodation.name, image_url: dest.accommodation.image_url } : null}
                  transportEndMarker={dest.transport?.end_latitude != null && dest.transport?.end_longitude != null ? { lat: dest.transport.end_latitude, lon: dest.transport.end_longitude, name: dest.transport.end_terminal ?? null, type: dest.transport.type } : null}
                  transportStartMarker={nextDest?.transport?.start_latitude != null && nextDest?.transport?.start_longitude != null ? { lat: nextDest.transport.start_latitude, lon: nextDest.transport.start_longitude, name: nextDest.transport.start_terminal ?? null, type: nextDest.transport.type } : null}
                />
              )}

              {/* Records */}
              {dest.records.length > 0 && <div className="py-3 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Records</span>
                <div className="mt-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
                  {dest.records.map((record) => {
                    const Icon = (record.type && recordIcons[record.type]) || NoteOutlinedIcon;
                    return (
                      <div key={record.id} className="flex items-center gap-2 py-1.5">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 flex-shrink-0">
                          <Icon style={{ fontSize: 16 }} className="text-white" />
                        </div>
                        {record.link
                          ? <a href={record.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{record.name}</a>
                          : <span className="font-medium text-zinc-700 dark:text-zinc-300">{record.name}</span>
                        }
                        {record.memo && <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">{record.memo}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
