'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition, useRef, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DURATION_STEPS, STEP_COUNT } from './duration-config';
import { CONTINENTS, getCountriesForContinent, getAllCountries, COUNTRY_CONTINENT } from './continent-config';

const MIN = 1;
const MAX = STEP_COUNT;

const rangeCls = [
  'absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none',
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing',
  '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-800 [&::-webkit-slider-thumb]:shadow',
  'dark:[&::-webkit-slider-thumb]:border-zinc-200',
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing',
  '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-800',
].join(' ');

export function SearchBar({ isLoggedIn = true }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [lo, setLo] = useState(Number(searchParams.get('durMin') ?? MIN));
  const [hi, setHi] = useState(Number(searchParams.get('durMax') ?? MAX));
  const [continent, setContinent] = useState(searchParams.get('continent') ?? '');
  const [country, setCountry] = useState(searchParams.get('country') ?? '');
  const [liked, setLiked] = useState(searchParams.get('liked') === '1');
  const [collapsed, setCollapsed] = useState(true);

  // Autocomplete state
  const initCode = searchParams.get('country') ?? '';
  const allCountries = useMemo(() => getAllCountries(), []);
  const initName = useMemo(() => allCountries.find((c) => c.code === initCode)?.name ?? '', [allCountries, initCode]);
  const [countryInput, setCountryInput] = useState(initName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Restore or reset search when landing on /explore with no params
  useEffect(() => {
    if (!searchParams.toString()) {
      const returning = sessionStorage.getItem('explore-returning');
      sessionStorage.removeItem('explore-returning');
      if (returning) {
        const saved = sessionStorage.getItem('explore-search');
        if (saved) {
          const p = new URLSearchParams(saved);
          setQ(p.get('q') ?? '');
          setLo(Number(p.get('durMin') ?? MIN));
          setHi(Number(p.get('durMax') ?? MAX));
          setContinent(p.get('continent') ?? '');
          const savedCountry = p.get('country') ?? '';
          setCountry(savedCountry);
          setLiked(p.get('liked') === '1');
          if (savedCountry) {
            const name = allCountries.find((c) => c.code === savedCountry)?.name ?? '';
            setCountryInput(name);
          }
          router.replace(`/explore?${saved}`);
        }
      } else {
        sessionStorage.removeItem('explore-search');
      }
    }
  }, []);

  // Persist search params to sessionStorage on every search
  function buildParams() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (lo !== MIN) params.set('durMin', String(lo));
    if (hi !== MAX) params.set('durMax', String(hi));
    if (continent) params.set('continent', continent);
    if (country) params.set('country', country);
    if (liked) params.set('liked', '1');
    return params;
  }

  const loLabel = DURATION_STEPS[lo - 1]?.label ?? '';
  const hiLabel = DURATION_STEPS[hi - 1]?.label ?? '';
  const rangeLabel = lo === hi ? loLabel : `${loLabel} – ${hiLabel}`;
  const leftPct = ((lo - MIN) / (MAX - MIN)) * 100;
  const rightPct = ((hi - MIN) / (MAX - MIN)) * 100;

  const countryPool = useMemo(
    () => continent ? getCountriesForContinent(continent) : allCountries,
    [continent, allCountries],
  );

  const filteredCountries = useMemo(() => {
    const q = countryInput.toLowerCase();
    if (!q) return countryPool;
    return countryPool.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countryInput, countryPool]);

  function selectCountry(code: string, name: string) {
    setCountry(code);
    setCountryInput(name);
    setDropdownOpen(false);
    const correspondingContinent = COUNTRY_CONTINENT[code.toUpperCase()];
    if (correspondingContinent) setContinent(correspondingContinent);
  }

  function clearCountry() {
    setCountry('');
    setCountryInput('');
  }

  function toggleContinent(code: string) {
    const next = continent === code ? '' : code;
    setContinent(next);
    clearCountry();
  }

  function handleSearch() {
    const params = buildParams();
    sessionStorage.setItem('explore-search', params.toString());
    startTransition(() => router.replace(`/explore?${params.toString()}`));
  }

  function toggleLiked() {
    setLiked((prev) => !prev);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3 w-full">
        {/* Search input */}
        <div className="relative flex-1">
          <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search"
            className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
          />
        </div>
        {isLoggedIn && (
          <button
            type="button"
            onClick={toggleLiked}
            className={`flex-shrink-0 flex items-center justify-center rounded-full border p-2 transition-colors ${liked ? 'border-rose-400 bg-rose-50 text-rose-500 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-400' : 'border-zinc-300 bg-white text-zinc-400 hover:text-rose-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:text-rose-400'}`}
          >
            {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex-shrink-0 flex items-center justify-center rounded-full border border-zinc-300 bg-white p-2 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </button>
        <button type="button" onClick={handleSearch} className="flex-shrink-0 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          <SearchIcon fontSize="small" />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Continent + country autocomplete */}
          <div className="flex flex-wrap items-center gap-2">
            {CONTINENTS.map(({ code, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleContinent(code)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  continent === code
                    ? 'border-zinc-800 bg-zinc-800 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-black'
                    : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {name}
              </button>
            ))}

            {/* Country autocomplete */}
            <div ref={autocompleteRef} className="relative">
              <div className={`flex items-center rounded-full border w-40 ${
                country
                  ? 'border-zinc-800 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-200'
                  : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
              }`}>
                {country && (
                  <img
                    src={`https://flagcdn.com/w20/${country.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${country.toLowerCase()}.png 2x`}
                    width={16} height={12} alt=""
                    className="ml-2.5 flex-shrink-0 rounded-sm"
                  />
                )}
                <input
                  type="text"
                  value={countryInput}
                  onChange={(e) => { setCountryInput(e.target.value); setCountry(''); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  placeholder="Country…"
                  className={`flex-1 min-w-0 bg-transparent py-1 text-xs outline-none ${country ? 'pl-1.5' : 'pl-3'} pr-6 ${
                    country
                      ? 'text-white dark:text-black placeholder-white dark:placeholder-black'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                />
                {countryInput && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); clearCountry(); }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs leading-none ${country ? 'text-zinc-300 hover:text-white dark:text-zinc-600 dark:hover:text-black' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                  >✕</button>
                )}
              </div>
              {dropdownOpen && filteredCountries.length > 0 && (
                <ul className="absolute left-0 top-full mt-1 z-50 max-h-48 w-52 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  {filteredCountries.map(({ code, name }) => (
                    <li key={code}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); selectCountry(code, name); }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <img
                          src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
                          srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
                          width={16} height={12} alt=""
                          className="flex-shrink-0 rounded-sm"
                        />
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Duration slider */}
          <div className="flex flex-col gap-1 w-full pt-1">
            <div className="relative h-5 flex items-center">
              <div className="absolute inset-x-0 h-1 rounded-full bg-zinc-200 dark:bg-zinc-600" />
              <div className="absolute h-1 rounded-full bg-zinc-800 dark:bg-zinc-200" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />
              <input type="range" min={MIN} max={MAX} step={1} value={lo} onChange={(e) => setLo(Math.min(Number(e.target.value), hi - 1))} className={rangeCls} />
              <input type="range" min={MIN} max={MAX} step={1} value={hi} onChange={(e) => setHi(Math.max(Number(e.target.value), lo + 1))} className={rangeCls} />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 text-center truncate">{rangeLabel}</span>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
