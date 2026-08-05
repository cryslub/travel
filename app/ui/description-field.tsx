'use client';
import { useState } from 'react';

const MAX_LENGTH = 1000;

export function DescriptionField({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
      <div className="relative">
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={MAX_LENGTH}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2 pb-6 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
        />
        <span className="pointer-events-none absolute bottom-1.5 right-4 mb-1 text-xs text-zinc-400 dark:text-zinc-500">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
