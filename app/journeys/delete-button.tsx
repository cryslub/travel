'use client'

import { deleteJourney } from './actions';
import DeleteIcon from '@mui/icons-material/Delete';

export function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this journey?')) return;
    await deleteJourney(id);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
    >
      <DeleteIcon fontSize="small" />
    </button>
  );
}
