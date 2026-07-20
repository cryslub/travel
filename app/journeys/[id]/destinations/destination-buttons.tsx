'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { deleteDestination, deleteEvent, deleteRecord } from './actions';
import Chip from '@mui/material/Chip';

export function SectionChip({ label }: { label: string }) {
  return <Chip label={label} size="small" variant="outlined" />;
}

export function CreateDestinationButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Create destination"
      onClick={() => router.push('/destinations/create')}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function EditDestinationButton({ journeyId, id }: { journeyId: string; id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Edit destination"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${id}/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
      className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <EditOutlinedIcon fontSize="small" />
    </button>
  );
}

const MENU_H = 84;

export function MoreOptionsDestinationButton({ journeyId, id, className }: { journeyId: string; id: string; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const top = rect.bottom + 4 + MENU_H > window.innerHeight
        ? rect.top - MENU_H - 4
        : rect.bottom + 4;
      setMenuPos({ top, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
  }

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this destination?')) return;
    await deleteDestination(id, journeyId);
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        title="More options"
        onClick={handleToggle}
        className={`rounded-full py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 ${className ?? 'px-1.5'}`}
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && menuPos && (
        <div
          className="fixed z-[9999] w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/journeys/${journeyId}/destinations/${id}/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <EditOutlinedIcon fontSize="small" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <DeleteOutlinedIcon fontSize="small" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function EditTransportButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Edit transport"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/transport/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
      className="rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
    >
      <EditOutlinedIcon fontSize="small" />
    </button>
  );
}

export function EditAccommodationButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Edit accommodation"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/accommodation/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
      className="rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <EditOutlinedIcon fontSize="small" />
    </button>
  );
}

export function CreateEventButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Add event"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/events/create?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
      className="rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function EditEventButton({ journeyId, destinationId, eventId }: { journeyId: string; destinationId: string; eventId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Edit event"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/events/${eventId}/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <EditOutlinedIcon fontSize="small" />
    </button>
  );
}

export function MoreOptionsEventButton({ journeyId, destinationId, eventId }: { journeyId: string; destinationId: string; eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const top = rect.bottom + 4 + MENU_H > window.innerHeight
        ? rect.top - MENU_H - 4
        : rect.bottom + 4;
      setMenuPos({ top, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
  }

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this event?')) return;
    await deleteEvent(eventId, journeyId);
  }

  return (
    <div ref={ref} className="relative ml-1">
      <button
        ref={btnRef}
        type="button"
        title="More options"
        onClick={handleToggle}
        className="rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && menuPos && (
        <div
          className="fixed z-[9999] w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/journeys/${journeyId}/destinations/${destinationId}/events/${eventId}/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <EditOutlinedIcon fontSize="small" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <DeleteOutlinedIcon fontSize="small" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function DeleteEventButton({ journeyId, eventId }: { journeyId: string; eventId: string }) {
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await deleteEvent(eventId, journeyId);
  }
  return (
    <button
      type="button"
      title="Delete event"
      onClick={handleDelete}
      className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 ml-1"
    >
      <DeleteOutlinedIcon fontSize="small" />
    </button>
  );
}

export function CreateRecordButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Add record"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/records/create?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
      className="rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function MoreOptionsRecordButton({ journeyId, destinationId, recordId }: { journeyId: string; destinationId: string; recordId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const top = rect.bottom + 4 + MENU_H > window.innerHeight
        ? rect.top - MENU_H - 4
        : rect.bottom + 4;
      setMenuPos({ top, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
  }

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this record?')) return;
    await deleteRecord(recordId, journeyId);
  }

  return (
    <div ref={ref} className="relative ml-1">
      <button
        ref={btnRef}
        type="button"
        title="More options"
        onClick={handleToggle}
        className="rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && menuPos && (
        <div
          className="fixed z-[9999] w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/journeys/${journeyId}/destinations/${destinationId}/records/${recordId}/edit?from=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <EditOutlinedIcon fontSize="small" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <DeleteOutlinedIcon fontSize="small" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
