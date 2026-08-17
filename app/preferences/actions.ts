'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function updateDestinationsView(view: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET destinations_view = ${view}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
}

export async function updateCalendarSubView(subView: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET destinations_view_sub = ${subView}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
}

export async function updateDisplayName(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET name = ${name}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
  revalidatePath('/explore');
}

export async function updateProfileImage(formData: FormData): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';
  const imageFile = formData.get('image') as File;

  const [existing] = await sql<{ id: string; image_url: string | null }[]>`
    SELECT p.id, p.image_url
    FROM preferences p
    JOIN users u ON u.id = p.user_id
    WHERE u.email = ${session.user.email} AND u.sign_in_type = ${signInType}
    LIMIT 1
  `;
  if (!existing) return;

  const ext = imageFile.name.slice(imageFile.name.lastIndexOf('.')) || '.jpg';
  const { url } = await put(`profiles/${existing.id}-${Date.now()}${ext}`, imageFile, { access: 'public' });

  await sql`UPDATE preferences SET image_url = ${url} WHERE id = ${existing.id}`;
  if (existing.image_url) await del(existing.image_url);

  revalidatePath('/preferences');
  revalidatePath('/explore');
  return url;
}

export async function removeProfileImage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  const [existing] = await sql<{ id: string; image_url: string | null }[]>`
    SELECT p.id, p.image_url
    FROM preferences p
    JOIN users u ON u.id = p.user_id
    WHERE u.email = ${session.user.email} AND u.sign_in_type = ${signInType}
    LIMIT 1
  `;
  if (!existing) return;

  await sql`UPDATE preferences SET image_url = NULL WHERE id = ${existing.id}`;
  if (existing.image_url) await del(existing.image_url);

  revalidatePath('/preferences');
  revalidatePath('/explore');
}

export async function updateCurrency(currency: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET currency = ${currency}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
}
