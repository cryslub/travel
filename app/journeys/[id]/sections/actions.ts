'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createSection(journeyId: string, formData: FormData) {
  const name = formData.get('name') as string;

  await sql`INSERT INTO sections (journey_id, name, created_time) VALUES (${journeyId}, ${name}, NOW())`;

  redirect(`/journeys/${journeyId}/destinations`);
}

export async function updateSection(sectionId: string, journeyId: string, formData: FormData) {
  const name = formData.get('name') as string;

  await sql`UPDATE sections SET name = ${name} WHERE id = ${sectionId}`;

  redirect(`/journeys/${journeyId}/sections`);
}

export async function deleteSection(sectionId: string, journeyId: string) {
  await sql`DELETE FROM sections WHERE id = ${sectionId}`;

  redirect(`/journeys/${journeyId}/sections`);
}
