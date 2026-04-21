'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Section } from '@/app/lib/definitions';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

export function SectionFilter({ sections, journeyId }: { sections: Section[]; journeyId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('section');

  const setSection = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('section', id);
    } else {
      params.delete('section');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
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
      <a href={`/journeys/${journeyId}/sections/create`} className="rounded-full border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
        <AddIcon fontSize="small" />
      </a>
      <a href={`/journeys/${journeyId}/sections`} className="rounded-full border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
        <SettingsIcon fontSize="small" />
      </a>
    </div>
  );
}
