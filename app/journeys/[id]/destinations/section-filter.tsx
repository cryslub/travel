'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Section } from '@/app/lib/definitions';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export function SectionFilter({ sections, journeyId }: { sections: Section[]; journeyId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get('section');
  const storageKey = `section-filter:${journeyId}`;
  const [expanded, setExpanded] = useState(true);

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

  return (
    <div className="flex flex-wrap gap-2 mb-2 sm:mb-4">
      <button
        title={expanded ? 'Collapse sections' : 'Show sections'}
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </button>
      {expanded && (
        <>
          <button
            onClick={() => setSection(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === null
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSection(section.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === section.id
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {section.name}
            </button>
          ))}
          <a title="Overview" href={`/journeys/${journeyId}/sections/overview?from=${encodeURIComponent(searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname)}`} className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
            <AccountTreeOutlinedIcon fontSize="small" />
          </a>
          <a title="Add section" href={`/journeys/${journeyId}/sections/create?redirectTo=${encodeURIComponent(searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname)}`} className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
            <AddIcon fontSize="small" />
          </a>
          <a title="Manage sections" href={`/journeys/${journeyId}/sections`} className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
            <SettingsOutlinedIcon fontSize="small" />
          </a>
        </>
      )}
    </div>
  );
}
