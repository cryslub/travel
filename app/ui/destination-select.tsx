'use client'

import { useState, useRef, useEffect } from 'react';

type Option = { id: string; name: string; start_date?: string | null };

function formatDate(raw: string) {
  const d = new Date(raw);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function DestinationSelect({ options, defaultId = '' }: { options: Option[]; defaultId?: string }) {
  const defaultDest = options.find((o) => o.id === defaultId);
  const [query, setQuery] = useState(defaultDest?.name ?? '');
  const [selectedId, setSelectedId] = useState(defaultId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        const sel = options.find((o) => o.id === selectedId);
        if (sel) setQuery(sel.name);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [selectedId, options]);

  function handleSelect(o: Option) {
    setQuery(o.name);
    setSelectedId(o.id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name="destination_id" value={selectedId} />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setSelectedId(''); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        placeholder="Select destination…"
        className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onMouseDown={() => handleSelect(o)}
                className={`w-full px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 ${selectedId === o.id ? 'bg-zinc-50 dark:bg-zinc-800' : ''}`}
              >
                <span className="flex items-baseline gap-2">
                  <span className={`text-sm ${selectedId === o.id ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{o.name}</span>
                  {o.start_date && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatDate(o.start_date)}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
