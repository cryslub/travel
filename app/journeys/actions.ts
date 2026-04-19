'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createJourney(formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  await sql`INSERT INTO journeys (name, start_date, created_time) VALUES (${name}, ${start_date}, NOW())`;
  redirect('/journeys');
}

export async function updateJourney(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  await sql`UPDATE journeys SET name = ${name}, start_date = ${start_date} WHERE id = ${id}`;
  redirect('/journeys');
}

export async function deleteJourney(id: string) {
  await sql`DELETE FROM journeys WHERE id = ${id}`;
  redirect('/journeys');
}
