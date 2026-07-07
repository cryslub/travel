'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Section } from '@/app/lib/definitions';

export function SectionTabs({ sections, currentSection }: { sections: Section[]; currentSection?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (sections.length === 0) return null;

  function setSection(id: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (id) p.set('section', id); else p.delete('section');
    router.push(`?${p.toString()}`);
  }

  const activeBtn = 'bg-black text-white dark:bg-white dark:text-black';
  const inactiveBtn = 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700';

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button type="button" onClick={() => setSection(null)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!currentSection ? activeBtn : inactiveBtn}`}>
        All
      </button>
      {sections.map((s) => (
        <button key={s.id} type="button" onClick={() => setSection(s.id)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${currentSection === s.id ? activeBtn : inactiveBtn}`}>
          {s.name}
        </button>
      ))}
    </div>
  );
}
