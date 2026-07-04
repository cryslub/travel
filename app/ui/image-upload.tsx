'use client';

import { useState, useRef, useEffect } from 'react';

export function ImageUpload({ currentImageUrl }: { currentImageUrl?: string | null }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function handleFile(file: File) {
    const resized = await resizeImage(file, 350);
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(resized);
      fileRef.current.files = dt.files;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(resized);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    setHasFile(true);
    setRemoved(false);
  }

  function clearFile() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreviewUrl(null);
    setHasFile(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  const showExisting = !hasFile && !!currentImageUrl && !removed;
  const showPreview = hasFile && !!previewUrl;
  const showUploadArea = !showExisting && !showPreview;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image</label>

      {showPreview && (
        <div
          className={`relative rounded-lg outline-2 -outline-offset-2 ${isDragOver ? 'outline outline-blue-500' : 'outline-transparent'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <img src={previewUrl!} alt="" className="w-full max-h-56 rounded-lg object-cover" />
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Remove selected image"
          >
            <XIcon />
          </button>
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
              <span className="text-sm font-medium text-white">Drop to replace</span>
            </div>
          )}
        </div>
      )}

      {showExisting && (
        <div
          className={`relative rounded-lg outline-2 -outline-offset-2 ${isDragOver ? 'outline outline-blue-500' : 'outline-transparent'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <img src={currentImageUrl!} alt="" className="w-full max-h-56 rounded-lg object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setRemoved(true)}
              className="rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <XIcon />
            </button>
          </div>
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
              <span className="text-sm font-medium text-white">Drop to replace</span>
            </div>
          )}
        </div>
      )}

      {showUploadArea && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
              : 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
          }`}
        >
          <UploadIcon />
          {isDragOver ? 'Drop image here' : 'Click or drag image here'}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        name="image"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {currentImageUrl && !removed && !hasFile && (
        <input type="hidden" name="current_image_url" value={currentImageUrl} />
      )}
      {removed && !hasFile && <input type="hidden" name="remove_image" value="1" />}
    </div>
  );
}

function resizeImage(file: File, maxWidth: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= maxWidth) { resolve(file); return; }
      const height = Math.round(img.height * (maxWidth / img.width));
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, maxWidth, height);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.src = url;
  });
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
