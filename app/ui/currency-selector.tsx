'use client';

import { useEffect, useRef, useState } from 'react';

const CURRENCIES = [
  { code: 'AUD', name: 'Australian Dollar',    country: 'au' },
  { code: 'BRL', name: 'Brazilian Real',        country: 'br' },
  { code: 'CAD', name: 'Canadian Dollar',       country: 'ca' },
  { code: 'CHF', name: 'Swiss Franc',           country: 'ch' },
  { code: 'CNY', name: 'Chinese Yuan',          country: 'cn' },
  { code: 'DKK', name: 'Danish Krone',          country: 'dk' },
  { code: 'EUR', name: 'Euro',                  country: 'eu' },
  { code: 'GBP', name: 'British Pound',         country: 'gb' },
  { code: 'HKD', name: 'Hong Kong Dollar',      country: 'hk' },
  { code: 'IDR', name: 'Indonesian Rupiah',     country: 'id' },
  { code: 'INR', name: 'Indian Rupee',          country: 'in' },
  { code: 'JPY', name: 'Japanese Yen',          country: 'jp' },
  { code: 'KRW', name: 'Korean Won',            country: 'kr' },
  { code: 'MXN', name: 'Mexican Peso',          country: 'mx' },
  { code: 'MYR', name: 'Malaysian Ringgit',     country: 'my' },
  { code: 'NOK', name: 'Norwegian Krone',       country: 'no' },
  { code: 'NZD', name: 'New Zealand Dollar',    country: 'nz' },
  { code: 'PHP', name: 'Philippine Peso',       country: 'ph' },
  { code: 'SEK', name: 'Swedish Krona',         country: 'se' },
  { code: 'SGD', name: 'Singapore Dollar',      country: 'sg' },
  { code: 'THB', name: 'Thai Baht',             country: 'th' },
  { code: 'TRY', name: 'Turkish Lira',          country: 'tr' },
  { code: 'USD', name: 'US Dollar',             country: 'us' },
  { code: 'VND', name: 'Vietnamese Dong',       country: 'vn' },
  { code: 'ZAR', name: 'South African Rand',    country: 'za' },
];

function FlagImg({ country }: { country: string }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${country}.png`}
      alt=""
      className="h-3.5 w-5 flex-shrink-0 object-contain"
    />
  );
}

export function CurrencySelector({ defaultCurrency }: { defaultCurrency?: string | null }) {
  const initial = CURRENCIES.find(c => c.code === (defaultCurrency || 'USD')) ?? CURRENCIES.find(c => c.code === 'USD')!;
  const [selected, setSelected] = useState(initial);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim() === ''
    ? CURRENCIES
    : CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Currency</label>
      <input type="hidden" name="currency" value={selected.code} />
      <div ref={containerRef} className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <FlagImg country={selected.country} />
        </div>
        <input
          type="text"
          value={open ? query : selected.name}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => {
            if (containerRef.current) {
              const spaceBelow = window.innerHeight - containerRef.current.getBoundingClientRect().bottom;
              setDropUp(spaceBelow < 260);
            }
            setOpen(true);
            setQuery('');
          }}
          placeholder="Search currency…"
          className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
        />
        {open && (
          <ul className={`absolute z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500">No results</li>
            ) : (
              filtered.map(c => (
                <li
                  key={c.code}
                  onMouseDown={() => { setSelected(c); setOpen(false); setQuery(''); }}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm ${
                    c.code === selected.code
                      ? 'bg-zinc-100 dark:bg-zinc-800'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <FlagImg country={c.country} />
                  <span className="text-zinc-800 dark:text-zinc-100">{c.name}</span>
                  <span className="ml-auto text-zinc-400 dark:text-zinc-500">{c.code}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
