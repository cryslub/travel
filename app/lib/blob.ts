'use server';

import { put } from '@vercel/blob';

export async function duplicateBlob(url: string | null, folder: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const extMatch = url.match(/\.[a-zA-Z0-9]+(?:\?.*)?$/);
    const ext = extMatch ? extMatch[0].split('?')[0] : '.jpg';
    const { url: newUrl } = await put(
      `${folder}/copy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`,
      Buffer.from(arrayBuffer),
      { access: 'public' },
    );
    return newUrl;
  } catch {
    return null;
  }
}

export async function duplicateBlobs(urls: (string | null)[], folder: string): Promise<(string | null)[]> {
  return Promise.all(urls.map((u) => duplicateBlob(u, folder)));
}
