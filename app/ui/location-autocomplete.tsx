'use client'

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const MapPreview = dynamic(() => import('./map-preview').then((m) => m.MapPreview), { ssr: false });

type Suggestion = { display_name: string; place_id: number; lat: string; lon: string };

type Selected = { location_name: string; lat: string; lon: string } | null;

export function Location({
  name,
  defaultValue = '',
  defaultLocationName = '',
  defaultLat = '',
  defaultLon = '',
  defaultLocationId = '',
  placeholder = 'Search location…',
  required,
  syncInputId,
  fieldNames = { locationName: 'location_name', lat: 'latitude', lon: 'longitude' },
  locationIdFieldName,
  fallbackCenter,
}: {
  name: string;
  defaultValue?: string;
  defaultLocationName?: string;
  defaultLat?: string;
  defaultLon?: string;
  defaultLocationId?: string;
  placeholder?: string;
  required?: boolean;
  syncInputId?: string;
  fieldNames?: { locationName: string; lat: string; lon: string };
  locationIdFieldName?: string;
  fallbackCenter?: { lat: number; lon: number };
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Selected>(
    defaultLocationName ? { location_name: defaultLocationName, lat: defaultLat, lon: defaultLon } : null
  );
  const [locationId, setLocationId] = useState(defaultLocationId);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setSelected(null);
    setLocationId('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&addressdetails=0`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  function handleSelect(s: Suggestion) {
    const short = s.display_name.split(',')[0].trim();
    setQuery(short);
    setSelected({ location_name: s.display_name, lat: s.lat, lon: s.lon });
    setLocationId('');
    setSuggestions([]);
    setOpen(false);
  }

  function handleMapPick(lat: number, lon: number) {
    const label = `(${lat.toFixed(6)} ${lon.toFixed(6)})`;
    setQuery(label);
    setSelected({ location_name: label, lat: String(lat), lon: String(lon) });
    setLocationId('');
  }

  return (
    <div ref={containerRef}>
      <div className="relative">
        <input
          name={name}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (syncInputId && query === '') {
              const el = document.getElementById(syncInputId) as HTMLInputElement | null;
              if (el?.value) handleChange(el.value);
            }
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
        />
        {open && (
          <ul className="absolute left-0 right-0 top-full z-[1001] mt-1 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            {suggestions.map((s) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input type="hidden" name={fieldNames.locationName} value={selected?.location_name ?? ''} />
      <input type="hidden" name={fieldNames.lat} value={selected?.lat ?? ''} />
      <input type="hidden" name={fieldNames.lon} value={selected?.lon ?? ''} />
      {locationIdFieldName && (
        <input type="hidden" name={locationIdFieldName} value={locationId} />
      )}
      {(() => {
        const markerLat = parseFloat(selected?.lat ?? '');
        const markerLon = parseFloat(selected?.lon ?? '');
        const hasMarker = !isNaN(markerLat) && !isNaN(markerLon);
        const centerLat = hasMarker ? markerLat : fallbackCenter?.lat;
        const centerLon = hasMarker ? markerLon : fallbackCenter?.lon;
        if (centerLat == null || centerLon == null) return null;
        return (
          <div className="mt-2">
            <MapPreview lat={centerLat} lon={centerLon} markerLat={hasMarker ? markerLat : null} markerLon={hasMarker ? markerLon : null} onLocationPick={handleMapPick} />
          </div>
        );
      })()}
    </div>
  );
}
