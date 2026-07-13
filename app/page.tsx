import { GoogleSignInButton } from '@/app/ui/login-button';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <span className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Imagine and Manage your</span>
      <span className="text-4xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">Journey</span>
      <div className="flex flex-col gap-3 w-56">
        <a
          href="/explore"
          className="flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          Explore
        </a>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
