'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${id}/edit`)}
      className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <EditIcon fontSize="small" />
    </button>
  );
}

export function MoreOptionsDestinationButton({ journeyId, id }: { journeyId: string; id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this destination?')) return;
    await deleteDestination(id, journeyId);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/journeys/${journeyId}/destinations/${id}/edit`); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <EditIcon fontSize="small" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <DeleteIcon fontSize="small" /> Delete
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
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/transport/edit`)}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
    >
      <EditIcon fontSize="small" />
    </button>
  );
}

export function EditAccommodationButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/accommodation/edit`)}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <EditIcon fontSize="small" />
    </button>
  );
}

export function CreateEventButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/events/create`)}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ml-4"
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
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/events/${eventId}/edit`)}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <EditIcon fontSize="small" />
    </button>
  );
}

export function MoreOptionsEventButton({ journeyId, destinationId, eventId }: { journeyId: string; destinationId: string; eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this event?')) return;
    await deleteEvent(eventId, journeyId);
  }

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/journeys/${journeyId}/destinations/${destinationId}/events/${eventId}/edit`); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <EditIcon fontSize="small" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <DeleteIcon fontSize="small" /> Delete
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
      onClick={handleDelete}
      className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 ml-1"
    >
      <DeleteIcon fontSize="small" />
    </button>
  );
}

export function CreateRecordButton({ journeyId, destinationId }: { journeyId: string; destinationId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/journeys/${journeyId}/destinations/${destinationId}/records/create`)}
      className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ml-4"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function MoreOptionsRecordButton({ journeyId, destinationId, recordId }: { journeyId: string; destinationId: string; recordId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleDelete() {
    setOpen(false);
    if (!confirm('Are you sure you want to delete this record?')) return;
    await deleteRecord(recordId, journeyId);
  }

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/journeys/${journeyId}/destinations/${destinationId}/records/${recordId}/edit`); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <EditIcon fontSize="small" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <DeleteIcon fontSize="small" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
