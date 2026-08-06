'use client';

import { useState, useRef } from 'react';

const MARGIN = 8;

export function CountryBadge({ code, href }: { code: string; href?: string }) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const ref = useRef<HTMLElement>(null);

  const fullName = new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code;

  function updatePos() {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MARGIN;
    if (spaceBelow < 80) {
      setPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
    } else {
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }

  const className = `relative flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-700 dark:text-zinc-300 ${href ? 'hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors' : 'cursor-default'}`;

  const content = (
    <>
      <img
        src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
        width={20}
        height={15}
        alt={code}
      />
      <span className="font-mono">{code}</span>
      {hovered && (
        <div
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, left: pos.left }}
          className="z-[99999] w-max rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 whitespace-nowrap pointer-events-none"
        >
          {fullName}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={className}
        onMouseEnter={() => { updatePos(); setHovered(true); }}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      onMouseEnter={() => { updatePos(); setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </span>
  );
}
