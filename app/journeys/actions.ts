'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createJourney(formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  const end_date = (formData.get('end_date') as string) || null;

  const imageFile = formData.get('image') as File | null;
  let image_url: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.slice(imageFile.name.lastIndexOf('.'));
    const { url } = await put(`journeys/new-${Date.now()}${ext}`, imageFile, { access: 'public' });
    image_url = url;
  }

  await sql`INSERT INTO journeys (name, start_date, end_date, image_url, created_time) VALUES (${name}, ${start_date}, ${end_date}, ${image_url}, NOW())`;
  redirect('/journeys');
}

export async function updateJourney(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  const end_date = (formData.get('end_date') as string) || null;
  const previous_start_date = (formData.get('previous_start_date') as string) || null;
  const shift_destinations = formData.get('shift_destinations') === '1';

  const imageFile = formData.get('image') as File | null;
  const removeImage = formData.get('remove_image') === '1';
  const currentImageUrl = (formData.get('current_image_url') as string) || null;
  let imageUrl: string | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.slice(imageFile.name.lastIndexOf('.'));
    const { url } = await put(`journeys/${id}-${Date.now()}${ext}`, imageFile, { access: 'public' });
    imageUrl = url;
  } else if (removeImage) {
    imageUrl = null;
  } else {
    imageUrl = currentImageUrl;
  }

  await sql`UPDATE journeys SET name = ${name}, start_date = ${start_date}, end_date = ${end_date}, image_url = ${imageUrl} WHERE id = ${id}`;

  if (shift_destinations && start_date && previous_start_date) {
    const offsetDays = Math.round((new Date(start_date).getTime() - new Date(previous_start_date).getTime()) / 86400000);
    if (offsetDays !== 0) {
      await sql`UPDATE destinations SET start_date = start_date + ${offsetDays}::int WHERE journey_id = ${id} AND start_date IS NOT NULL`;
      await sql`UPDATE events SET start_time = to_char(NULLIF(start_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI'), end_time = to_char(NULLIF(end_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI') WHERE destination_id IN (SELECT id FROM destinations WHERE journey_id = ${id})`;
      await sql`UPDATE transports SET start_time = to_char(NULLIF(start_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI'), end_time = to_char(NULLIF(end_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI') WHERE destination_id IN (SELECT id FROM destinations WHERE journey_id = ${id})`;
    }
  }

  redirect('/journeys');
}

export async function deleteJourney(id: string) {
  await sql`DELETE FROM journeys WHERE id = ${id}`;
  redirect('/journeys');
}
