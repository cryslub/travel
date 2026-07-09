'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { put, del } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { updateDestinationTotalPrice } from '@/app/lib/prices';

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

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email ?? null;
  const signInType = (session?.user as any)?.sign_in_type ?? null;
  const [user] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${userEmail} AND sign_in_type = ${signInType} LIMIT 1`;

  const currency = (formData.get('currency') as string) || null;
  const countries = formData.getAll('countries') as string[];
  const [{ id }] = await sql<{ id: string }[]>`INSERT INTO journeys (name, start_date, end_date, image_url, currency, created_time, user_id) VALUES (${name}, ${start_date}, ${end_date}, ${image_url}, ${currency}, NOW(), ${user?.id ?? null}) RETURNING id`;
  for (const code of countries) {
    await sql`INSERT INTO journey_countries (journey_id, country_code) VALUES (${id}, ${code})`;
  }
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

  const currency = (formData.get('currency') as string) || null;
  const [prev] = await sql<{ currency: string | null }[]>`SELECT currency FROM journeys WHERE id = ${id}`;
  const countries = formData.getAll('countries') as string[];
  await sql`UPDATE journeys SET name = ${name}, start_date = ${start_date}, end_date = ${end_date}, image_url = ${imageUrl}, currency = ${currency} WHERE id = ${id}`;
  await sql`DELETE FROM journey_countries WHERE journey_id = ${id}`;
  for (const code of countries) {
    await sql`INSERT INTO journey_countries (journey_id, country_code) VALUES (${id}, ${code})`;
  }

  if (currency !== (prev?.currency ?? null)) {
    const destinations = await sql<{ id: string }[]>`SELECT id FROM destinations WHERE journey_id = ${id}`;
    await Promise.all(destinations.map(d => updateDestinationTotalPrice(d.id)));
  }

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

export async function getJourneyCountryCodes(journeyId: string): Promise<string[]> {
  const locations = await sql<{ latitude: number; longitude: number }[]>`
    SELECT DISTINCT l.latitude, l.longitude
    FROM destinations d
    JOIN locations l ON l.id = d.location_id
    WHERE d.journey_id = ${journeyId}
      AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
  `;

  const codes = new Set<string>();
  for (const { latitude, longitude } of locations) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { headers: { 'User-Agent': 'travel-app/1.0' }, cache: 'force-cache' },
      );
      const data = await res.json();
      if (data?.address?.country_code) {
        codes.add((data.address.country_code as string).toUpperCase());
      }
    } catch {
      // skip failed geocoding
    }
  }
  return [...codes];
}

export async function deleteJourney(id: string) {
  const [journeyImgs, destImgs, eventImgs, accImgs] = await Promise.all([
    sql<{ image_url: string }[]>`SELECT image_url FROM journeys WHERE id = ${id} AND image_url IS NOT NULL`,
    sql<{ image_url: string }[]>`SELECT image_url FROM destinations WHERE journey_id = ${id} AND image_url IS NOT NULL`,
    sql<{ image_url: string }[]>`SELECT e.image_url FROM events e JOIN destinations d ON d.id = e.destination_id WHERE d.journey_id = ${id} AND e.image_url IS NOT NULL`,
    sql<{ image_url: string }[]>`SELECT a.image_url FROM accommodations a JOIN destinations d ON d.id = a.destination_id WHERE d.journey_id = ${id} AND a.image_url IS NOT NULL`,
  ]);
  await sql`DELETE FROM journeys WHERE id = ${id}`;
  const urls = [...journeyImgs, ...destImgs, ...eventImgs, ...accImgs].map((r) => r.image_url);
  if (urls.length > 0) await del(urls);
  redirect('/journeys');
}
