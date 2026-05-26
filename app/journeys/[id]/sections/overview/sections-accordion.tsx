'use client'

import { useState, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { moveDestination } from '../actions';

type DestItem = {
  id: string;
  name: string;
  start_date: string | null;
};

type SectionItem = {
  id: string;
  name: string;
  destinations: DestItem[];
};

export function SectionsAccordion({ sectionsWithDests: initial, journeyId }: { sectionsWithDests: SectionItem[]; journeyId: string }) {
  const [sections, setSections] = useState(initial);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(initial.map((s) => s.id)));
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const dragging = useRef<{ destId: string; sourceSectionId: string } | null>(null);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDragStart(destId: string, sourceSectionId: string) {
    dragging.current = { destId, sourceSectionId };
  }

  function handleDragEnd() {
    dragging.current = null;
    setDragOverSectionId(null);
  }

  function handleDragEnter(e: React.DragEvent, sectionId: string) {
    e.preventDefault();
    if (!dragging.current || dragging.current.sourceSectionId === sectionId) return;
    setDragOverSectionId(sectionId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSectionId(null);
    }
  }

  function handleDrop(e: React.DragEvent, targetSectionId: string) {
    e.preventDefault();
    setDragOverSectionId(null);
    const { destId, sourceSectionId } = dragging.current ?? {};
    if (!destId || !sourceSectionId || sourceSectionId === targetSectionId) return;

    setSections((prev) => {
      const dest = prev.find((s) => s.id === sourceSectionId)?.destinations.find((d) => d.id === destId);
      if (!dest) return prev;
      return prev.map((s) => {
        if (s.id === sourceSectionId) return { ...s, destinations: s.destinations.filter((d) => d.id !== destId) };
        if (s.id === targetSectionId) return { ...s, destinations: [...s.destinations, dest] };
        return s;
      });
    });

    moveDestination(destId, targetSectionId === '__none__' ? null : targetSectionId, journeyId);
  }

  if (!sections.length) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No sections yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {sections.map((section) => {
        const isOpen = openIds.has(section.id);
        const isDragOver = dragOverSectionId === section.id;
        return (
          <li
            key={section.id}
            className={`overflow-hidden rounded-lg border bg-white transition-colors dark:bg-zinc-800 ${isDragOver ? 'border-blue-400 dark:border-blue-500' : 'border-zinc-200 dark:border-zinc-700'}`}
            onDragEnter={(e) => handleDragEnter(e, section.id)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{section.name}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {section.destinations.length} destination{section.destinations.length !== 1 ? 's' : ''}
                </span>
              </div>
              {isOpen
                ? <ExpandLessIcon fontSize="small" className="shrink-0 text-zinc-400" />
                : <ExpandMoreIcon fontSize="small" className="shrink-0 text-zinc-400" />}
            </button>
            {isOpen && (
              section.destinations.length === 0 ? (
                <p className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                  No destinations.
                </p>
              ) : (
                <ul className="border-t border-zinc-100 dark:border-zinc-700">
                  {section.destinations.map((dest, i) => (
                    <li
                      key={dest.id}
                      draggable
                      onDragStart={() => handleDragStart(dest.id, section.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex cursor-grab items-center justify-between px-4 py-2.5 active:cursor-grabbing active:opacity-50 ${i < section.destinations.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-700' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <DragIndicatorIcon fontSize="small" className="shrink-0 text-zinc-300 dark:text-zinc-600" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{dest.name}</span>
                      </div>
                      {dest.start_date && (
                        <span className="ml-4 shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(dest.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )
            )}
          </li>
        );
      })}
    </ul>
  );
}
