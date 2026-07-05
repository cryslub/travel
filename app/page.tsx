import { GoogleSignInButton } from '@/app/ui/login-button';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <span className="text-4xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">Journey</span>
      <GoogleSignInButton />
    </div>
  );
}
