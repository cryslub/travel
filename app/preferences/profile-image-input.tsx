'use client';

import { useRef, useState } from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { resizeImage } from '@/app/ui/image-upload';
import { updateProfileImage, removeProfileImage } from './actions';

export function ProfileImageInput({ currentImageUrl }: { currentImageUrl: string | null }) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const resized = await resizeImage(file, 425);
      const fd = new FormData();
      fd.set('image', resized);
      const url = await updateProfileImage(fd);
      if (url) setImageUrl(url);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Remove profile image?')) return;
    setBusy(true);
    try {
      await removeProfileImage();
      setImageUrl(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-zinc-500 dark:text-zinc-400">Profile image</label>
      <div className="group relative h-20 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PersonOutlineIcon className="text-zinc-400 dark:text-zinc-500" sx={{ fontSize: 36 }} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Change Image"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-50"
          >
            <EditOutlinedIcon style={{ fontSize: 16 }} />
          </button>
          {imageUrl && (
            <button
              type="button"
              title="Remove image"
              disabled={busy}
              onClick={handleRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-50"
            >
              <CloseIcon style={{ fontSize: 16 }} />
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
    </div>
  );
}
