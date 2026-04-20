'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createDestination(formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  const journey_id = (formData.get('journey_id') as string) || null;

  await sql`INSERT INTO destinations (name, start_date, journey_id, created_time) VALUES (${name}, ${start_date}, ${journey_id}, NOW())`;

  redirect(journey_id ? `/journeys/${journey_id}/destinations` : '/destinations');
}

export async function updateDestination(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = formData.get('start_date') as string | null;
  const journey_id = formData.get('journey_id') as string;

  await sql`UPDATE destinations SET name = ${name}, start_date = ${start_date} WHERE id = ${id}`;

  redirect(`/journeys/${journey_id}/destinations`);
}

export async function deleteDestination(id: string, journeyId: string) {
  await sql`DELETE FROM destinations WHERE id = ${id}`;

  redirect(`/journeys/${journeyId}/destinations`);
}

export async function createEvent(destinationId: string, formData: FormData) {
  const name = formData.get('name') as string | null;
  const type = formData.get('type') as string | null;
  const start_time = (formData.get('start_time') as string) || null;
  const end_time = (formData.get('end_time') as string) || null;
  const link = formData.get('link') as string | null;
  const memo = formData.get('memo') as string | null;
  const journey_id = formData.get('journey_id') as string;

  await sql`INSERT INTO events (destination_id, name, type, start_time, end_time, link, memo, created_time) VALUES (${destinationId}, ${name}, ${type}, ${start_time}, ${end_time}, ${link}, ${memo}, NOW())`;

  redirect(`/journeys/${journey_id}/destinations`);
}

export async function updateEvent(eventId: string, _destinationId: string, formData: FormData) {
  const name = formData.get('name') as string | null;
  const type = formData.get('type') as string | null;
  const start_time = (formData.get('start_time') as string) || null;
  const end_time = (formData.get('end_time') as string) || null;
  const link = formData.get('link') as string | null;
  const memo = formData.get('memo') as string | null;
  const journey_id = formData.get('journey_id') as string;

  await sql`UPDATE events SET name = ${name}, type = ${type}, start_time = ${start_time}, end_time = ${end_time}, link = ${link}, memo = ${memo} WHERE id = ${eventId}`;

  redirect(`/journeys/${journey_id}/destinations`);
}

export async function deleteEvent(eventId: string, journeyId: string) {
  await sql`DELETE FROM events WHERE id = ${eventId}`;

  redirect(`/journeys/${journeyId}/destinations`);
}

export async function upsertAccommodation(destinationId: string, formData: FormData) {
  const name = formData.get('name') as string | null;
  const check_in = (formData.get('check_in') as string) || null;
  const check_out = (formData.get('check_out') as string) || null;
  const link = formData.get('link') as string | null;
  const journey_id = formData.get('journey_id') as string;

  await sql`
    INSERT INTO accommodations (destination_id, name, check_in, check_out, link)
    VALUES (${destinationId}, ${name}, ${check_in}, ${check_out}, ${link})
    ON CONFLICT (destination_id) DO UPDATE SET name = ${name}, check_in = ${check_in}, check_out = ${check_out}, link = ${link}
  `;

  redirect(`/journeys/${journey_id}/destinations`);
}

export async function createRecord(destinationId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const type = (formData.get('type') as string) || null;
  const link = (formData.get('link') as string) || null;
  const memo = (formData.get('memo') as string) || null;
  const journey_id = formData.get('journey_id') as string;

  await sql`INSERT INTO records (destination_id, name, type, link, memo, created_time) VALUES (${destinationId}, ${name}, ${type}, ${link}, ${memo}, NOW())`;

  redirect(`/journeys/${journey_id}/destinations`);
}

export async function updateRecord(recordId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const type = (formData.get('type') as string) || null;
  const link = (formData.get('link') as string) || null;
  const memo = (formData.get('memo') as string) || null;
  const journey_id = formData.get('journey_id') as string;

  await sql`UPDATE records SET name = ${name}, type = ${type}, link = ${link}, memo = ${memo} WHERE id = ${recordId}`;

  redirect(`/journeys/${journey_id}/destinations`);
}

export async function deleteRecord(recordId: string, journeyId: string) {
  await sql`DELETE FROM records WHERE id = ${recordId}`;

  redirect(`/journeys/${journeyId}/destinations`);
}

export async function upsertTransport(destinationId: string, formData: FormData) {
  const type = formData.get('type') as string | null;
  const start_time = (formData.get('start_time') as string) || null;
  const end_time = (formData.get('end_time') as string) || null;
  const start_terminal = (formData.get('start_terminal') as string) || null;
  const end_terminal = (formData.get('end_terminal') as string) || null;
  const link = formData.get('link') as string | null;
  const journey_id = formData.get('journey_id') as string;

  await sql`
    INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, link)
    VALUES (${destinationId}, ${type}, ${start_time}, ${end_time}, ${start_terminal}, ${end_terminal}, ${link})
    ON CONFLICT (destination_id) DO UPDATE SET type = ${type}, start_time = ${start_time}, end_time = ${end_time}, start_terminal = ${start_terminal}, end_terminal = ${end_terminal}, link = ${link}
  `;

  redirect(`/journeys/${journey_id}/destinations`);
}
