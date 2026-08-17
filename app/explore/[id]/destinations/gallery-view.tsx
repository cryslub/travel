'use client';

import { useEffect, useRef, useState } from 'react';
import type { ElementType } from 'react';
import type { SvgIconProps } from '@mui/material';
import type { DestinationWithTransport } from '@/app/lib/definitions';
import { ReadonlyDestinationModal } from './readonly-destination-modal';
import { AccommodationModal } from '@/app/ui/accommodation-modal';
import { EventModal } from '@/app/ui/event-modal';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import MovingIcon from '@mui/icons-material/Moving';

const eventIcons: Record<string, ElementType<SvgIconProps>> = {
  Site: LocationOnOutlinedIcon,
  Meal: RestaurantOutlinedIcon,
  Tour: TourOutlinedIcon,
  Activity: StarBorderOutlinedIcon,
  Transfer: MovingIcon,
};

type GalleryImage = { url: string; alt: string; destIndex: number | null; accIndex: number | null; event: DestinationWithTransport['events'][number] | null; eventDestIndex: number | null; Icon: ElementType<SvgIconProps> };

const MAX_TILE_SIZE = 300;

export function GalleryView({ destinations, preferredCurrency }: { destinations: DestinationWithTransport[]; preferredCurrency?: string }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [selectedAccIdx, setSelectedAccIdx] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DestinationWithTransport['events'][number] | null>(null);
  const [selectedEventDestIndex, setSelectedEventDestIndex] = useState<number | null>(null);
  const dest = selectedIdx !== null ? destinations[selectedIdx] : null;
  const nextDest = selectedIdx !== null ? (destinations[selectedIdx + 1] ?? null) : null;
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setColumns(Math.max(1, Math.ceil(width / MAX_TILE_SIZE)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const images: GalleryImage[] = [];
  destinations.forEach((d, i) => {
    if (d.image_url) images.push({ url: d.image_url, alt: d.name, destIndex: i, accIndex: null, event: null, eventDestIndex: null, Icon: ExploreOutlinedIcon });
    if (d.accommodation?.image_url) images.push({ url: d.accommodation.image_url, alt: d.accommodation.name ?? d.name, destIndex: null, accIndex: i, event: null, eventDestIndex: null, Icon: HotelOutlinedIcon });
    for (const e of d.events) {
      if (e.image_url) images.push({ url: e.image_url, alt: e.name ?? d.name, destIndex: null, accIndex: null, event: e, eventDestIndex: i, Icon: (e.type && eventIcons[e.type]) || StarBorderOutlinedIcon });
    }
  });

  return (
    <>
      {images.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No images yet.</p>
      ) : (
        <div
          ref={gridRef}
          className="grid gap-px -mx-[13px] px-px sm:-mx-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square w-full">
              {img.destIndex !== null ? (
                <button
                  type="button"
                  onClick={() => setSelectedIdx(img.destIndex)}
                  className="block h-full w-full transition-opacity hover:opacity-90"
                >
                  <img src={img.url} alt={img.alt} title={img.alt} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ) : img.accIndex !== null ? (
                <button
                  type="button"
                  onClick={() => setSelectedAccIdx(img.accIndex)}
                  className="block h-full w-full transition-opacity hover:opacity-90"
                >
                  <img src={img.url} alt={img.alt} title={img.alt} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ) : img.event !== null ? (
                <button
                  type="button"
                  onClick={() => { setSelectedEvent(img.event); setSelectedEventDestIndex(img.eventDestIndex); }}
                  className="block h-full w-full transition-opacity hover:opacity-90"
                >
                  <img src={img.url} alt={img.alt} title={img.alt} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ) : (
                <img src={img.url} alt={img.alt} title={img.alt} loading="lazy" className="h-full w-full object-cover" />
              )}
              <div className="pointer-events-none absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/60">
                <img.Icon style={{ fontSize: 22 }} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      )}
      {dest && (
        <ReadonlyDestinationModal
          dest={dest}
          nextDest={nextDest}
          onClose={() => setSelectedIdx(null)}
        />
      )}
      {selectedAccIdx !== null && destinations[selectedAccIdx].accommodation && (
        <AccommodationModal
          accommodation={destinations[selectedAccIdx].accommodation!}
          preferredCurrency={preferredCurrency}
          destinationName={destinations[selectedAccIdx].name}
          onDestinationClick={() => { const idx = selectedAccIdx; setSelectedAccIdx(null); setSelectedIdx(idx); }}
          onClose={() => setSelectedAccIdx(null)}
        />
      )}
      {selectedEvent && (
        <EventModal
          activity={selectedEvent}
          preferredCurrency={preferredCurrency}
          destinationName={selectedEventDestIndex !== null ? destinations[selectedEventDestIndex].name : undefined}
          onDestinationClick={() => { const idx = selectedEventDestIndex; setSelectedEvent(null); setSelectedEventDestIndex(null); setSelectedIdx(idx); }}
          onClose={() => { setSelectedEvent(null); setSelectedEventDestIndex(null); }}
        />
      )}
    </>
  );
}
