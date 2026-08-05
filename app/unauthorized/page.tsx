export const metadata = { title: 'Unauthorized' };

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 text-center">
      <h1 className="text-3xl font-semibold mb-2">Unauthorized</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        You don&apos;t have permission to view this journey.
      </p>
      <a
        href="/explore"
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Back to Explore
      </a>
    </main>
  );
}
