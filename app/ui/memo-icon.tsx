'use client';

import { useState, useRef, useEffect, useId } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const MEMO_OPEN_EVENT = 'memo-icon-open';

export function MemoIcon({ memo, className }: { memo: string; className?: string }) {
  const id = useId();
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const show = clicked || hovered;

  const TOOLTIP_WIDTH = 192; // w-48
  const MARGIN = 8;

  useEffect(() => {
    function onOtherOpen(e: Event) {
      if ((e as CustomEvent<string>).detail !== id) {
        setClicked(false);
        setHovered(false);
      }
    }
    window.addEventListener(MEMO_OPEN_EVENT, onOtherOpen);
    return () => window.removeEventListener(MEMO_OPEN_EVENT, onOtherOpen);
  }, [id]);

  useEffect(() => {
    if (!show) return;
    function onTouchOutside(e: TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setClicked(false);
        setHovered(false);
      }
    }
    document.addEventListener('touchstart', onTouchOutside);
    return () => document.removeEventListener('touchstart', onTouchOutside);
  }, [show]);

  function broadcast() {
    window.dispatchEvent(new CustomEvent<string>(MEMO_OPEN_EVENT, { detail: id }));
  }

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
    <span ref={containerRef} className={`relative flex-shrink-0${className ? ` ${className}` : ''}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => { updatePos(); broadcast(); setClicked(v => !v); }}
        onMouseEnter={() => { updatePos(); broadcast(); setHovered(true); }}
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
