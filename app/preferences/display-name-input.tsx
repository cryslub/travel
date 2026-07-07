'use client';

import { useState, useRef } from 'react';
import { updateDisplayName } from './actions';

export function DisplayNameInput({ currentName }: { currentName: string | null }) {
  const [value, setValue] = useState(currentName ?? '');
  const [saving, setSaving] = useState(false);
  const initialRef = useRef(currentName ?? '');

  async function handleBlur() {
    if (value === initialRef.current) return;
    setSaving(true);
    await updateDisplayName(value);
    initialRef.current = value;
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Display name</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        placeholder="Enter a display name"
        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
      />
      {saving && <span className="text-xs text-zinc-400">Saving…</span>}
    </div>
  );
}
