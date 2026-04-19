import { notFound } from 'next/navigation';
import { fetchRecordsByDestinationId } from '@/app/lib/data';
import { updateRecord } from '@/app/journeys/[id]/destinations/actions';

export default async function EditRecordPage(props: PageProps<'/journeys/[id]/destinations/[destinationId]/records/[recordId]/edit'>) {
  const { id: journeyId, destinationId, recordId } = await props.params;
  const records = await fetchRecordsByDestinationId(destinationId);
  const record = records.find((r) => r.id === recordId);

  if (!record) notFound();

  const action = updateRecord.bind(null, recordId);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Edit Record</h1>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="journey_id" value={journeyId} />
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={record.name}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
          <select
            id="type"
            name="type"
            defaultValue={record.type ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          >
            <option value="">Select type</option>
            <option value="Video">Video</option>
            <option value="Blog">Blog</option>
            <option value="Etc">Etc</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="link" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Link</label>
          <input
            id="link"
            name="link"
            type="url"
            defaultValue={record.link ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="memo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Memo</label>
          <textarea
            id="memo"
            name="memo"
            rows={4}
            defaultValue={record.memo ?? ''}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Save
          </button>
          <a
            href={`/journeys/${journeyId}/destinations`}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
