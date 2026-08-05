'use client';

import { useState, useRef, useEffect, useId } from 'react';

const TEXT_TOOLTIP_OPEN_EVENT = 'text-tooltip-open';

export function TextTooltip({ text, className }: { text: string; className?: string }) {
  const id = useId();
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const MARGIN = 8;

  useEffect(() => {
    function onOtherOpen(e: Event) {
      if ((e as CustomEvent<string>).detail !== id) setClicked(false);
    }
    window.addEventListener(TEXT_TOOLTIP_OPEN_EVENT, onOtherOpen);
    return () => window.removeEventListener(TEXT_TOOLTIP_OPEN_EVENT, onOtherOpen);
  }, [id]);

  useEffect(() => {
    if (!clicked) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setClicked(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [clicked]);

  function updatePos() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MARGIN;
    if (spaceBelow < 120) {
      setPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
    } else {
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }

  return (
    <span ref={containerRef} className="relative block">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          updatePos();
          window.dispatchEvent(new CustomEvent<string>(TEXT_TOOLTIP_OPEN_EVENT, { detail: id }));
          setClicked((v) => !v);
        }}
        className={`block w-full text-left${className ? ` ${className}` : ''}`}
      >
        {text}
      </button>
      {clicked && (
        <div
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, left: pos.left }}
          className="z-[99999] w-max max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 whitespace-pre-wrap"
        >
          {text}
        </div>
      )}
    </span>
  );
}
