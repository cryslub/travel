'use client'

import { useRouter, usePathname } from 'next/navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { deleteSection, deleteSectionAndDestinations } from './actions';

export function BackToDestinationsButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Back to destinations"
      onClick={() => router.push(`/journeys/${journeyId}/destinations`)}
      className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <ChevronLeftIcon fontSize="small" />
    </button>
  );
}

export function CreateSectionButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      title="Add section"
      onClick={() => router.push(`/journeys/${journeyId}/sections/create?redirectTo=${encodeURIComponent(pathname)}`)}
      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <AddIcon fontSize="small" />
    </button>
  );
}

export function OverviewButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      title="Overview"
      onClick={() => router.push(`/journeys/${journeyId}/sections/overview?from=${encodeURIComponent(pathname)}`)}
      className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <AccountTreeOutlinedIcon fontSize="small" />
    </button>
  );
}

export function ImportSectionButton({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Import sections"
      onClick={() => router.push(`/journeys/${journeyId}/sections/import`)}
      className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <FileDownloadOutlinedIcon fontSize="small" />
    </button>
  );
}

export function DeleteSectionButton({ journeyId, sectionId }: { journeyId: string; sectionId: string }) {
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this section?')) return;
    if (confirm('Do you also want to delete all destinations in this section?')) {
      await deleteSectionAndDestinations(sectionId, journeyId);
    } else {
      await deleteSection(sectionId, journeyId);
    }
  }
  return (
    <button
      type="button"
      title="Delete section"
      onClick={handleDelete}
      className="rounded-full px-4 py-1.5 text-red-600 dark:text-red-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
    >
      <DeleteOutlinedIcon fontSize="small" />
    </button>
  );
}

export function EditSectionButton({ journeyId, sectionId }: { journeyId: string; sectionId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      title="Edit section"
      onClick={() => router.push(`/journeys/${journeyId}/sections/${sectionId}/edit`)}
      className="rounded-full px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
    >
      <EditOutlinedIcon fontSize="small" />
    </button>
  );
}
