import FileDownloadIcon from '@mui/icons-material/FileDownload';

export function ImportButton({ journeyId }: { journeyId: string }) {
  return (
    <a
      href={`/explore/${journeyId}/import`}
      title="Import journey"
      className="flex flex-row items-center gap-1 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
    >
      <FileDownloadIcon fontSize="small" />
    </a>
  );
}
