'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Section } from '@/app/lib/definitions';

export function SectionTabs({ sections, currentSection }: { sections: Section[]; currentSection?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  if (sections.length === 0) return null;

  function setSection(id: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (id) p.set('section', id); else p.delete('section');
    router.push(`?${p.toString()}`);
  }

  const activeTab = 'border-b-2 border-black text-black dark:border-white dark:text-white';
  const inactiveTab = 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200';
  const arrowBtn = 'shrink-0 flex items-center justify-center px-1 py-2 -mb-px text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors';

  return (
    <div className="flex items-center border-b border-zinc-200 dark:border-zinc-700 mb-2 sm:mb-4">
      {canScrollLeft && (
        <button onClick={() => scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })} className={arrowBtn} aria-label="Scroll left">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
        </button>
      )}
      <div ref={scrollRef} className="flex flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={() => setSection(null)} className={`shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap -mb-px transition-colors ${!currentSection ? activeTab : inactiveTab}`}>
          All
        </button>
        {sections.map((s) => (
          <button key={s.id} type="button" onClick={() => setSection(s.id)} className={`shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap -mb-px transition-colors ${currentSection === s.id ? activeTab : inactiveTab}`}>
            {s.name}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })} className={arrowBtn} aria-label="Scroll right">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M400-240 640-480 400-720l-56 56 184 184-184 184 56 56Z"/></svg>
        </button>
      )}
    </div>
  );
}
