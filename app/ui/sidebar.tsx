'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';

interface JourneyItem {
  id: string;
  name: string;
}

interface SidebarProps {
  displayLabel?: string | null;
  journeys?: JourneyItem[];
  isLoggedIn?: boolean;
}

export function Sidebar({ displayLabel, journeys, isLoggedIn = true }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const textCls = collapsed ? 'hidden' : 'hidden sm:inline';

  return (
    <header className="fixed bottom-0 left-0 right-0 z-[1001] flex items-center justify-between border-t border-zinc-800 bg-black px-6 py-3 sm:static sm:sticky sm:top-0 sm:h-screen sm:shrink-0 sm:flex-col sm:items-start sm:justify-start sm:gap-1 sm:border-t-0 sm:border-r sm:border-b-0 sm:px-4 sm:py-6 sm:overflow-y-auto">

      {/* Mobile: Journey text */}
      <a href="/journeys" className="sm:hidden flex items-center text-base font-semibold tracking-tight text-white">
        Journey
      </a>

      {/* Desktop: hamburger toggle + Journey link */}
      <div className="hidden sm:flex items-center gap-1.5 sm:mb-4">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-white transition-opacity hover:opacity-70"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
        </button>
        {!collapsed && (
          <a href="/journeys" className="text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-70">
            Journey
          </a>
        )}
      </div>

      {/* Journeys */}
      {isLoggedIn && (
        <>
          <a href="/journeys" className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm240-600h160v-80H400v80Zm-160 80h-80v440h80v-440Zm400 440v-440H320v440h320Zm80-440v440h80v-440h-80ZM480-420Z"/></svg>
            <span className={textCls}>Journeys</span>
          </a>
          {!collapsed && journeys && journeys.length > 0 && (
            <div className="hidden sm:flex sm:flex-col sm:gap-0.5 sm:pl-7 sm:w-full">
              {journeys.map(j => (
                <a
                  key={j.id}
                  href={`/journeys/${j.id}/destinations`}
                  className="truncate text-xs text-zinc-500 transition-colors hover:text-zinc-300 py-0.5"
                >
                  {j.name}
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {/* Explore */}
      <a href="/explore" className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        <span className={textCls}>Explore</span>
      </a>

      {/* Preferences */}
      {displayLabel && (
        <a href="/preferences" className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
          <span className={textCls}>{displayLabel}</span>
        </a>
      )}

      {/* Sign out — desktop only, pinned to bottom */}
      {isLoggedIn && (
        <div className="hidden sm:block sm:mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
            <span className={textCls}>Sign out</span>
          </button>
        </div>
      )}

      {/* Sign in — mobile and desktop, pinned to bottom on desktop */}
      {!isLoggedIn && (
        <div className="sm:mt-auto">
          <button
            onClick={() => signIn('google', { callbackUrl: '/journeys' })}
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/></svg>
            <span className={textCls}>Sign in</span>
          </button>
        </div>
      )}
    </header>
  );
}
