'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Section } from '@/app/lib/definitions';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export function SectionFilter({ sections, journeyId }: { sections: Section[]; journeyId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get('section');
  const storageKey = `section-filter:${journeyId}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener('scroll', updateScroll);
    const ro = new ResizeObserver(updateScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScroll); ro.disconnect(); };
  }, [sections]);

  useEffect(() => {
    if (active !== null) {
      localStorage.setItem(storageKey, active);
    } else {
      const saved = localStorage.getItem(storageKey);
      if (saved && sections.some((s) => s.id === saved)) {
        router.replace(`?section=${saved}`);
      }
    }
  }, [active, storageKey, sections, router]);

  const setSection = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('section', id);
    } else {
      params.delete('section');
      localStorage.removeItem(storageKey);
    }
    router.push(`?${params.toString()}`);
  };

  const activeTab = 'border-b-2 border-black text-black dark:border-white dark:text-white';
  const inactiveTab = 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200';
  const actionBtn = 'shrink-0 flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors';
  const arrowBtn = 'shrink-0 flex items-center justify-center px-1 py-2 -mb-px text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors';

  return (
    <div className="flex items-center border-b border-zinc-200 dark:border-zinc-700 mb-2 sm:mb-4">
      {canScrollLeft && (
        <button onClick={() => scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })} className={arrowBtn} aria-label="Scroll left">
          <ChevronLeftIcon fontSize="small" />
        </button>
      )}
      <div ref={scrollRef} className="flex flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSection(null)}
          className={`shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap -mb-px transition-colors ${active === null ? activeTab : inactiveTab}`}
        >
          All
        </button>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSection(section.id)}
            className={`shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap -mb-px transition-colors ${active === section.id ? activeTab : inactiveTab}`}
          >
            {section.name}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })} className={arrowBtn} aria-label="Scroll right">
          <ChevronLeftIcon fontSize="small" style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
      <div className="shrink-0 flex items-center gap-0.5 pl-2">
        <a title="Add section" href={`/journeys/${journeyId}/sections/create?redirectTo=${encodeURIComponent(searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname)}`} className={`hidden sm:flex ${actionBtn}`}>
          <AddIcon fontSize="small" />
        </a>
        <a title="Overview" href={`/journeys/${journeyId}/sections/overview?from=${encodeURIComponent(searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname)}`} className={`hidden sm:flex ${actionBtn}`}>
          <AccountTreeOutlinedIcon fontSize="small" />
        </a>
        <a title="Manage sections" href={`/journeys/${journeyId}/sections?from=${encodeURIComponent(searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname)}`} className={actionBtn}>
          <SettingsOutlinedIcon fontSize="small" />
        </a>
      </div>
    </div>
  );
}
