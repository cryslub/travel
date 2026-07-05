'use client';

import { signOut } from 'next-auth/react';
import LogoutIcon from '@mui/icons-material/Logout';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      title="Sign out"
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
    >
      <LogoutIcon fontSize="small" />
    </button>
  );
}
