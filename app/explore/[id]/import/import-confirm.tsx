'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { importJourney } from '@/app/explore/actions';

type Section = { id: string; name: string; destination_count: number };

export function ImportConfirm({ journeyId, sections }: { journeyId: string; sections: Section[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(sections.map((s) => s.id)));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === sections.length ? new Set() : new Set(sections.map((s) => s.id)),
    );
  }

  function handleImport() {
    startTransition(async () => {
      try {
        const newId = await importJourney(journeyId, [...selected]);
        router.push(newId ? `/journeys/${newId}/destinations` : '/journeys');
      } catch {
        setError(true);
      }
    });
  }

  const allChecked = selected.size === sections.length;
  const noneChecked = selected.size === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Section checkboxes */}
      {sections.length > 0 && (
        <div className="flex flex-col gap-1">
          {sections.length > 1 && (
            <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-zinc-800 dark:accent-zinc-200"
              />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                All sections
              </span>
            </label>
          )}
          <div className="flex flex-col gap-0.5 pl-1">
            {sections.map((s) => (
              <label key={s.id} className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="w-4 h-4 rounded accent-zinc-800 dark:accent-zinc-200"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.name}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                  {s.destination_count} dest{s.destination_count !== 1 ? 's' : ''}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="flex-1 rounded-full border border-zinc-300 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={isPending || noneChecked}
          className="flex-1 rounded-full bg-black py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {isPending ? 'Importing…' : 'Import'}
        </button>
      </div>
    </div>
  );
}
