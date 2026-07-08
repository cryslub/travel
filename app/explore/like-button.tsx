'use client';

import { useState, useTransition } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { toggleJourneyLike } from './actions';

export function LikeButton({ journeyId, initialLiked, initialCount }: { journeyId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isPending) return;
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    startTransition(() => toggleJourneyLike(journeyId, liked));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-row items-center gap-1 text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
    >
      {liked
        ? <FavoriteIcon fontSize="small" className="text-rose-500 dark:text-rose-400" />
        : <FavoriteBorderIcon fontSize="small" />
      }
      <span className="text-xs leading-none">{count}</span>
    </button>
  );
}
