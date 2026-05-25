'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createDestination(formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  const journey_id = (formData.get('journey_id') as string) || null;
  const section_id = (formData.get('section_id') as string) || null;
  const location_name = (formData.get('location_name') as string) || null;
  const latitude = (formData.get('latitude') as string) ? parseFloat(formData.get('latitude') as string) : null;
  const longitude = (formData.get('longitude') as string) ? parseFloat(formData.get('longitude') as string) : null;

  let location_id: string | null = null;
  if (location_name) {
    const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${location_name}, ${latitude}, ${longitude}) RETURNING id`;
    location_id = loc[0].id;
  }

  await sql`INSERT INTO destinations (name, start_date, journey_id, section_id, location_id, created_time) VALUES (${name}, ${start_date}, ${journey_id}, ${section_id}, ${location_id}, NOW())`;

  redirect(journey_id ? `/journeys/${journey_id}/destinations` : '/destinations');
}

export async function updateDestination(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const start_date = (formData.get('start_date') as string) || null;
  const previous_start_date = (formData.get('previous_start_date') as string) || null;
  const shift_dates = formData.get('shift_dates') === '1';
  const shift_following = formData.get('shift_following') === '1';
  const journey_id = formData.get('journey_id') as string;
  const section_id = (formData.get('section_id') as string) || null;
  const existing_location_id = (formData.get('location_id') as string) || null;
  const location_name = (formData.get('location_name') as string) || null;
  const latitude = (formData.get('latitude') as string) ? parseFloat(formData.get('latitude') as string) : null;
  const longitude = (formData.get('longitude') as string) ? parseFloat(formData.get('longitude') as string) : null;

  let location_id = existing_location_id;
  if (location_name) {
    if (existing_location_id) {
      await sql`UPDATE locations SET name = ${location_name}, latitude = ${latitude}, longitude = ${longitude} WHERE id = ${existing_location_id}`;
    } else {
      const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${location_name}, ${latitude}, ${longitude}) RETURNING id`;
      location_id = loc[0].id;
    }
  }

  await sql`UPDATE destinations SET name = ${name}, start_date = ${start_date}, section_id = ${section_id}, location_id = ${location_id} WHERE id = ${id}`;

  if ((shift_dates || shift_following) && start_date && previous_start_date) {
    const offsetDays = Math.round((new Date(start_date).getTime() - new Date(previous_start_date).getTime()) / 86400000);
    if (offsetDays !== 0) {
      if (shift_dates) {
        await sql`UPDATE events SET start_time = to_char(NULLIF(start_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI'), end_time = to_char(NULLIF(end_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI') WHERE destination_id = ${id}`;
        await sql`UPDATE transports SET start_time = to_char(NULLIF(start_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI'), end_time = to_char(NULLIF(end_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI') WHERE destination_id = ${id}`;
      }

      if (shift_following) {
        await sql`UPDATE events SET start_time = to_char(NULLIF(start_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI'), end_time = to_char(NULLIF(end_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI') WHERE destination_id IN (SELECT id FROM destinations WHERE journey_id = ${journey_id} AND id != ${id} AND start_date > ${previous_start_date})`;
        await sql`UPDATE transports SET start_time = to_char(NULLIF(start_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI'), end_time = to_char(NULLIF(end_time,'')::timestamp + (${offsetDays} * INTERVAL '1 day'), 'YYYY-MM-DD"T"HH24:MI') WHERE destination_id IN (SELECT id FROM destinations WHERE journey_id = ${journey_id} AND id != ${id} AND start_date > ${previous_start_date})`;
        await sql`UPDATE destinations SET start_date = start_date + ${offsetDays}::int WHERE journey_id = ${journey_id} AND id != ${id} AND start_date > ${previous_start_date}`;
      }
    }
  }

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
  const location_name = (formData.get('location_name') as string) || null;
  const latitude = (formData.get('latitude') as string) ? parseFloat(formData.get('latitude') as string) : null;
  const longitude = (formData.get('longitude') as string) ? parseFloat(formData.get('longitude') as string) : null;

  let location_id: string | null = null;
  if (location_name) {
    const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${location_name}, ${latitude}, ${longitude}) RETURNING id`;
    location_id = loc[0].id;
  }

  await sql`INSERT INTO events (destination_id, name, type, start_time, end_time, link, memo, location_id, created_time) VALUES (${destinationId}, ${name}, ${type}, ${start_time}, ${end_time}, ${link}, ${memo}, ${location_id}, NOW())`;

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
  const existing_location_id = (formData.get('location_id') as string) || null;
  const location_name = (formData.get('location_name') as string) || null;
  const latitude = (formData.get('latitude') as string) ? parseFloat(formData.get('latitude') as string) : null;
  const longitude = (formData.get('longitude') as string) ? parseFloat(formData.get('longitude') as string) : null;

  let location_id = existing_location_id;
  if (location_name) {
    if (existing_location_id) {
      await sql`UPDATE locations SET name = ${location_name}, latitude = ${latitude}, longitude = ${longitude} WHERE id = ${existing_location_id}`;
    } else {
      const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${location_name}, ${latitude}, ${longitude}) RETURNING id`;
      location_id = loc[0].id;
    }
  }

  await sql`UPDATE events SET name = ${name}, type = ${type}, start_time = ${start_time}, end_time = ${end_time}, link = ${link}, memo = ${memo}, location_id = ${location_id} WHERE id = ${eventId}`;

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
  const existing_location_id = (formData.get('location_id') as string) || null;
  const location_name = (formData.get('location_name') as string) || null;
  const latitude = (formData.get('latitude') as string) ? parseFloat(formData.get('latitude') as string) : null;
  const longitude = (formData.get('longitude') as string) ? parseFloat(formData.get('longitude') as string) : null;

  let location_id = existing_location_id;
  if (location_name) {
    if (existing_location_id) {
      await sql`UPDATE locations SET name = ${location_name}, latitude = ${latitude}, longitude = ${longitude} WHERE id = ${existing_location_id}`;
    } else {
      const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${location_name}, ${latitude}, ${longitude}) RETURNING id`;
      location_id = loc[0].id;
    }
  }

  await sql`
    INSERT INTO accommodations (destination_id, name, check_in, check_out, link, location_id)
    VALUES (${destinationId}, ${name}, ${check_in}, ${check_out}, ${link}, ${location_id})
    ON CONFLICT (destination_id) DO UPDATE SET name = ${name}, check_in = ${check_in}, check_out = ${check_out}, link = ${link}, location_id = ${location_id}
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
  const existing_start_location_id = (formData.get('start_location_id') as string) || null;
  const start_location_name = (formData.get('start_location_name') as string) || null;
  const start_latitude = (formData.get('start_latitude') as string) ? parseFloat(formData.get('start_latitude') as string) : null;
  const start_longitude = (formData.get('start_longitude') as string) ? parseFloat(formData.get('start_longitude') as string) : null;

  const existing_end_location_id = (formData.get('end_location_id') as string) || null;
  const end_location_name = (formData.get('end_location_name') as string) || null;
  const end_latitude = (formData.get('end_latitude') as string) ? parseFloat(formData.get('end_latitude') as string) : null;
  const end_longitude = (formData.get('end_longitude') as string) ? parseFloat(formData.get('end_longitude') as string) : null;

  let start_location_id = existing_start_location_id;
  if (start_location_name) {
    if (existing_start_location_id) {
      await sql`UPDATE locations SET name = ${start_location_name}, latitude = ${start_latitude}, longitude = ${start_longitude} WHERE id = ${existing_start_location_id}`;
    } else {
      const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${start_location_name}, ${start_latitude}, ${start_longitude}) RETURNING id`;
      start_location_id = loc[0].id;
    }
  }

  let end_location_id = existing_end_location_id;
  if (end_location_name) {
    if (existing_end_location_id) {
      await sql`UPDATE locations SET name = ${end_location_name}, latitude = ${end_latitude}, longitude = ${end_longitude} WHERE id = ${existing_end_location_id}`;
    } else {
      const loc = await sql<{ id: string }[]>`INSERT INTO locations (name, latitude, longitude) VALUES (${end_location_name}, ${end_latitude}, ${end_longitude}) RETURNING id`;
      end_location_id = loc[0].id;
    }
  }

  await sql`
    INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, link, start_location_id, end_location_id)
    VALUES (${destinationId}, ${type}, ${start_time}, ${end_time}, ${start_terminal}, ${end_terminal}, ${link}, ${start_location_id}, ${end_location_id})
    ON CONFLICT (destination_id) DO UPDATE SET type = ${type}, start_time = ${start_time}, end_time = ${end_time}, start_terminal = ${start_terminal}, end_terminal = ${end_terminal}, link = ${link}, start_location_id = ${start_location_id}, end_location_id = ${end_location_id}
  `;

  redirect(`/journeys/${journey_id}/destinations`);
}
