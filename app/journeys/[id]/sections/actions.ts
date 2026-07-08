'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createSection(journeyId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const redirectTo = formData.get('redirect_to') as string | null;

  await sql`INSERT INTO sections (journey_id, name, created_time) VALUES (${journeyId}, ${name}, NOW())`;

  redirect(redirectTo || `/journeys/${journeyId}/sections`);
}

export async function updateSection(sectionId: string, journeyId: string, formData: FormData) {
  const name = formData.get('name') as string;

  await sql`UPDATE sections SET name = ${name} WHERE id = ${sectionId}`;

  redirect(`/journeys/${journeyId}/sections`);
}

export async function deleteSection(sectionId: string, journeyId: string) {
  await sql`UPDATE destinations SET section_id = NULL WHERE section_id = ${sectionId}`;
  await sql`DELETE FROM sections WHERE id = ${sectionId}`;

  redirect(`/journeys/${journeyId}/sections`);
}

export async function deleteSectionAndDestinations(sectionId: string, journeyId: string) {
  await sql`DELETE FROM destinations WHERE section_id = ${sectionId}`;
  await sql`DELETE FROM sections WHERE id = ${sectionId}`;

  redirect(`/journeys/${journeyId}/sections`);
}

export async function moveDestination(destinationId: string, targetSectionId: string | null, journeyId: string) {
  await sql`UPDATE destinations SET section_id = ${targetSectionId} WHERE id = ${destinationId}`;
  revalidatePath(`/journeys/${journeyId}/sections/overview`);
}

export async function importSections(targetJourneyId: string, formData: FormData) {
  const sourceSectionIds = formData.getAll('section_id') as string[];
  const sourceJourneyId = (formData.get('source_journey_id') as string) || null;

  for (const sourceSectionId of sourceSectionIds) {
    if (sourceSectionId === '__none__') {
      if (!sourceJourneyId) continue;
      await sql`
        WITH
        new_sec AS (
          INSERT INTO sections (journey_id, name, created_time)
          SELECT ${targetJourneyId}, name, NOW() FROM journeys WHERE id = ${sourceJourneyId}
          RETURNING id
        ),
        src_dests AS (
          SELECT id, name, start_date, location_id, image_url,
                 ROW_NUMBER() OVER (ORDER BY start_date ASC NULLS LAST, created_time ASC NULLS LAST) AS rn
          FROM destinations WHERE journey_id = ${sourceJourneyId} AND section_id IS NULL
        ),
        ins_dests AS (
          INSERT INTO destinations (name, start_date, journey_id, section_id, location_id, image_url, created_time)
          SELECT d.name, d.start_date, ${targetJourneyId}, (SELECT id FROM new_sec), d.location_id, d.image_url, NOW()
          FROM src_dests d ORDER BY d.rn
          RETURNING id
        ),
        ins_dests_rn AS (
          SELECT id AS new_dest_id, ROW_NUMBER() OVER () AS rn FROM ins_dests
        ),
        dest_map AS (
          SELECT s.id AS old_id, n.new_dest_id AS new_id
          FROM src_dests s JOIN ins_dests_rn n ON s.rn = n.rn
        ),
        ins_transports AS (
          INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, link, start_location_id, end_location_id)
          SELECT m.new_id, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, t.start_location_id, t.end_location_id
          FROM transports t JOIN dest_map m ON m.old_id = t.destination_id
        ),
        ins_accs AS (
          INSERT INTO accommodations (destination_id, name, check_in, check_out, link, location_id, image_url)
          SELECT m.new_id, a.name, a.check_in, a.check_out, a.link, a.location_id, a.image_url
          FROM accommodations a JOIN dest_map m ON m.old_id = a.destination_id
        ),
        ins_events AS (
          INSERT INTO events (destination_id, name, type, start_time, end_time, link, memo, location_id, image_url, created_time)
          SELECT m.new_id, e.name, e.type, e.start_time, e.end_time, e.link, e.memo, e.location_id, e.image_url, NOW()
          FROM events e JOIN dest_map m ON m.old_id = e.destination_id
        ),
        ins_records AS (
          INSERT INTO records (destination_id, name, type, link, memo, created_time)
          SELECT m.new_id, r.name, r.type, r.link, r.memo, NOW()
          FROM records r JOIN dest_map m ON m.old_id = r.destination_id
        )
        SELECT 1
      `;
    } else {
      await sql`
        WITH
        new_sec AS (
          INSERT INTO sections (journey_id, name, created_time)
          SELECT ${targetJourneyId}, name, NOW()
          FROM sections WHERE id = ${sourceSectionId}
          RETURNING id
        ),
        src_dests AS (
          SELECT id, name, start_date, location_id, image_url,
                 ROW_NUMBER() OVER (ORDER BY start_date ASC NULLS LAST, created_time ASC NULLS LAST) AS rn
          FROM destinations WHERE section_id = ${sourceSectionId}
        ),
        ins_dests AS (
          INSERT INTO destinations (name, start_date, journey_id, section_id, location_id, image_url, created_time)
          SELECT d.name, d.start_date, ${targetJourneyId}, (SELECT id FROM new_sec), d.location_id, d.image_url, NOW()
          FROM src_dests d ORDER BY d.rn
          RETURNING id
        ),
        ins_dests_rn AS (
          SELECT id AS new_dest_id, ROW_NUMBER() OVER () AS rn FROM ins_dests
        ),
        dest_map AS (
          SELECT s.id AS old_id, n.new_dest_id AS new_id
          FROM src_dests s JOIN ins_dests_rn n ON s.rn = n.rn
        ),
        ins_transports AS (
          INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, link, start_location_id, end_location_id)
          SELECT m.new_id, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, t.start_location_id, t.end_location_id
          FROM transports t JOIN dest_map m ON m.old_id = t.destination_id
        ),
        ins_accs AS (
          INSERT INTO accommodations (destination_id, name, check_in, check_out, link, location_id, image_url)
          SELECT m.new_id, a.name, a.check_in, a.check_out, a.link, a.location_id, a.image_url
          FROM accommodations a JOIN dest_map m ON m.old_id = a.destination_id
        ),
        ins_events AS (
          INSERT INTO events (destination_id, name, type, start_time, end_time, link, memo, location_id, image_url, created_time)
          SELECT m.new_id, e.name, e.type, e.start_time, e.end_time, e.link, e.memo, e.location_id, e.image_url, NOW()
          FROM events e JOIN dest_map m ON m.old_id = e.destination_id
        ),
        ins_records AS (
          INSERT INTO records (destination_id, name, type, link, memo, created_time)
          SELECT m.new_id, r.name, r.type, r.link, r.memo, NOW()
          FROM records r JOIN dest_map m ON m.old_id = r.destination_id
        )
        SELECT 1
      `;
    }
  }

  redirect(`/journeys/${targetJourneyId}/sections`);
}
