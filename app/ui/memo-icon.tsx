'use client';

import { useState, useRef } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export function MemoIcon({ memo }: { memo: string }) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const show = clicked || hovered;

  const TOOLTIP_WIDTH = 192; // w-48
  const MARGIN = 8;

  function updatePos() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - MARGIN);
    const spaceBelow = window.innerHeight - rect.bottom - MARGIN;
    if (spaceBelow < 120) {
      setPos({ bottom: window.innerHeight - rect.top + 4, left });
    } else {
      setPos({ top: rect.bottom + 4, left });
    }
  }

  return (
    <span className="relative flex-shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => { updatePos(); setClicked(v => !v); }}
        onMouseEnter={() => { updatePos(); setHovered(true); }}
        onMouseLeave={() => setHovered(false)}
        onBlur={() => { setClicked(false); setHovered(false); }}
        className="flex items-center text-zinc-400 dark:text-zinc-500"
      >
        <InfoOutlinedIcon style={{ fontSize: 16 }} />
      </button>
      {show && (
        <div
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, left: pos.left }}
          className="z-[99999] w-48 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 whitespace-pre-wrap"
        >
          {memo}
        </div>
      )}
    </span>
  );
}
