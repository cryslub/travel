'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createJourney(formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  await sql`INSERT INTO journeys (name, start_date, created_time) VALUES (${name}, ${start_date}, NOW())`;
  revalidatePath('/journeys');
  redirect('/journeys');
}

export async function updateJourney(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  const previous_start_date = (formData.get('previous_start_date') as string) || null;
  const shift_destinations = formData.get('shift_destinations') === '1';

  await sql`UPDATE journeys SET name = ${name}, start_date = ${start_date} WHERE id = ${id}`;

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
