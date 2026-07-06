'use client'

import { useState } from 'react';

type JourneyWithSections = {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
};

export function ImportSectionsForm({
  journeys,
  action,
  cancelHref,
}: {
  journeys: JourneyWithSections[];
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
}) {
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);

  function selectJourney(id: string) {
    setSelectedJourneyId(id);
    setChecked(new Set());
  }

  function toggleSection(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const NONE_ID = '__none__';
  const totalSections = selectedJourney ? selectedJourney.sections.length + 1 : 0;

  function toggleAll() {
    if (!selectedJourney) return;
    if (checked.size === totalSections) {
      setChecked(new Set());
    } else {
      setChecked(new Set([NONE_ID, ...selectedJourney.sections.map((s) => s.id)]));
    }
  }

  return (
    <form action={action}>
      {selectedJourneyId && <input type="hidden" name="source_journey_id" value={selectedJourneyId} />}
      {/* Journey list */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Select a journey to import sections from</p>
        {journeys.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No other journeys available.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {journeys.map((journey) => (
              <li key={journey.id}>
                <button
                  type="button"
                  onClick={() => selectJourney(journey.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    selectedJourneyId === journey.id
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{journey.name}</span>
                  <span className={`ml-2 text-xs ${selectedJourneyId === journey.id ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {journey.sections.length} section{journey.sections.length !== 1 ? 's' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sections checkboxes */}
      {selectedJourney && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select sections to import</p>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {checked.size === totalSections ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            <li>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                <input
                  type="checkbox"
                  name="section_id"
                  value={NONE_ID}
                  checked={checked.has(NONE_ID)}
                  onChange={() => toggleSection(NONE_ID)}
                  className="h-4 w-4 accent-black dark:accent-white"
                />
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">None</span>
              </label>
            </li>
            {selectedJourney.sections.map((section) => (
              <li key={section.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                  <input
                    type="checkbox"
                    name="section_id"
                    value={section.id}
                    checked={checked.has(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="h-4 w-4 accent-black dark:accent-white"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{section.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={checked.size === 0}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Import {checked.size > 0 ? `(${checked.size})` : ''}
        </button>
        <a
          href={cancelHref}
          className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
