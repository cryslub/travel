'use server'

import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { del } from '@vercel/blob';
import { markJourneyChanged } from '@/app/lib/journey-state';
import { duplicateBlob } from '@/app/lib/blob';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type SourceDestination = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  location_id: string | null;
  image_url: string | null;
};

// Duplicates every image into a brand-new blob so the imported copy never shares
// storage with the source — deleting either side must not break the other.
async function importDestinationsIntoSection(targetJourneyId: string, newSectionId: string, sourceDestinations: SourceDestination[]) {
  if (sourceDestinations.length === 0) return;
  const oldDestIds = sourceDestinations.map((d) => d.id);

  const [transports, accommodations, events, records] = await Promise.all([
    sql<{ destination_id: string; type: string | null; start_time: string | null; end_time: string | null; start_terminal: string | null; end_terminal: string | null; link: string | null; start_location_id: string | null; end_location_id: string | null }[]>`
      SELECT destination_id, type, start_time, end_time, start_terminal, end_terminal, link, start_location_id, end_location_id
      FROM transports WHERE destination_id = ANY(${oldDestIds}::uuid[])
    `,
    sql<{ destination_id: string; name: string | null; check_in: string | null; check_out: string | null; link: string | null; location_id: string | null; image_url: string | null }[]>`
      SELECT destination_id, name, check_in, check_out, link, location_id, image_url
      FROM accommodations WHERE destination_id = ANY(${oldDestIds}::uuid[])
    `,
    sql<{ destination_id: string; name: string | null; type: string | null; start_time: string | null; end_time: string | null; link: string | null; memo: string | null; location_id: string | null; image_url: string | null }[]>`
      SELECT destination_id, name, type, start_time, end_time, link, memo, location_id, image_url
      FROM events WHERE destination_id = ANY(${oldDestIds}::uuid[])
    `,
    sql<{ destination_id: string; name: string; type: string | null; link: string | null; memo: string | null }[]>`
      SELECT destination_id, name, type, link, memo
      FROM records WHERE destination_id = ANY(${oldDestIds}::uuid[])
    `,
  ]);

  const [destImageUrls, accImageUrls, eventImageUrls] = await Promise.all([
    Promise.all(sourceDestinations.map((d) => duplicateBlob(d.image_url, 'destinations'))),
    Promise.all(accommodations.map((a) => duplicateBlob(a.image_url, 'accommodations'))),
    Promise.all(events.map((e) => duplicateBlob(e.image_url, 'events'))),
  ]);

  const destIdMap = new Map<string, string>();
  for (let i = 0; i < sourceDestinations.length; i++) {
    const d = sourceDestinations[i];
    const [newDest] = await sql<{ id: string }[]>`
      INSERT INTO destinations (name, description, start_date, journey_id, section_id, location_id, image_url, created_time)
      VALUES (${d.name}, ${d.description}, ${d.start_date}, ${targetJourneyId}, ${newSectionId}, ${d.location_id}, ${destImageUrls[i]}, NOW())
      RETURNING id
    `;
    destIdMap.set(d.id, newDest.id);
  }

  for (const t of transports) {
    await sql`
      INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, link, start_location_id, end_location_id)
      VALUES (${destIdMap.get(t.destination_id) ?? null}, ${t.type}, ${t.start_time}, ${t.end_time}, ${t.start_terminal}, ${t.end_terminal}, ${t.link}, ${t.start_location_id}, ${t.end_location_id})
    `;
  }

  for (let i = 0; i < accommodations.length; i++) {
    const a = accommodations[i];
    await sql`
      INSERT INTO accommodations (destination_id, name, check_in, check_out, link, location_id, image_url)
      VALUES (${destIdMap.get(a.destination_id) ?? null}, ${a.name}, ${a.check_in}, ${a.check_out}, ${a.link}, ${a.location_id}, ${accImageUrls[i]})
    `;
  }

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    await sql`
      INSERT INTO events (destination_id, name, type, start_time, end_time, link, memo, location_id, image_url, created_time)
      VALUES (${destIdMap.get(e.destination_id) ?? null}, ${e.name}, ${e.type}, ${e.start_time}, ${e.end_time}, ${e.link}, ${e.memo}, ${e.location_id}, ${eventImageUrls[i]}, NOW())
    `;
  }

  for (const r of records) {
    await sql`
      INSERT INTO records (destination_id, name, type, link, memo, created_time)
      VALUES (${destIdMap.get(r.destination_id) ?? null}, ${r.name}, ${r.type}, ${r.link}, ${r.memo}, NOW())
    `;
  }
}

export async function createSection(journeyId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const redirectTo = formData.get('redirect_to') as string | null;

  await sql`INSERT INTO sections (journey_id, name, created_time) VALUES (${journeyId}, ${name}, NOW())`;
  await markJourneyChanged(journeyId);

  redirect(redirectTo || `/journeys/${journeyId}/sections`);
}

export async function updateSection(sectionId: string, journeyId: string, formData: FormData) {
  const name = formData.get('name') as string;

  await sql`UPDATE sections SET name = ${name} WHERE id = ${sectionId}`;
  await markJourneyChanged(journeyId);

  redirect(`/journeys/${journeyId}/sections`);
}

export async function deleteSection(sectionId: string, journeyId: string) {
  await sql`UPDATE destinations SET section_id = NULL WHERE section_id = ${sectionId}`;
  await sql`DELETE FROM sections WHERE id = ${sectionId}`;
  await markJourneyChanged(journeyId);

  redirect(`/journeys/${journeyId}/sections`);
}

export async function deleteSectionAndDestinations(sectionId: string, journeyId: string) {
  const [destImgs, eventImgs, accImgs] = await Promise.all([
    sql<{ image_url: string }[]>`SELECT image_url FROM destinations WHERE section_id = ${sectionId} AND image_url IS NOT NULL`,
    sql<{ image_url: string }[]>`SELECT e.image_url FROM events e JOIN destinations d ON d.id = e.destination_id WHERE d.section_id = ${sectionId} AND e.image_url IS NOT NULL`,
    sql<{ image_url: string }[]>`SELECT a.image_url FROM accommodations a JOIN destinations d ON d.id = a.destination_id WHERE d.section_id = ${sectionId} AND a.image_url IS NOT NULL`,
  ]);
  await sql`DELETE FROM destinations WHERE section_id = ${sectionId}`;
  await sql`DELETE FROM sections WHERE id = ${sectionId}`;
  await markJourneyChanged(journeyId);
  const urls = [...destImgs, ...eventImgs, ...accImgs].map((r) => r.image_url);
  if (urls.length > 0) await del(urls);
  redirect(`/journeys/${journeyId}/sections`);
}

export async function moveDestination(destinationId: string, targetSectionId: string | null, journeyId: string) {
  await sql`UPDATE destinations SET section_id = ${targetSectionId} WHERE id = ${destinationId}`;
  await markJourneyChanged(journeyId);
  revalidatePath(`/journeys/${journeyId}/sections/overview`);
}

export async function importSections(targetJourneyId: string, formData: FormData) {
  const sourceSectionIds = formData.getAll('section_id') as string[];
  const sourceJourneyId = (formData.get('source_journey_id') as string) || null;

  for (const sourceSectionId of sourceSectionIds) {
    if (sourceSectionId === '__none__') {
      if (!sourceJourneyId) continue;
      const [sourceJourney] = await sql<{ name: string }[]>`SELECT name FROM journeys WHERE id = ${sourceJourneyId}`;
      if (!sourceJourney) continue;
      const [newSec] = await sql<{ id: string }[]>`INSERT INTO sections (journey_id, name, created_time) VALUES (${targetJourneyId}, ${sourceJourney.name}, NOW()) RETURNING id`;
      const srcDests = await sql<SourceDestination[]>`
        SELECT id, name, description, start_date, location_id, image_url
        FROM destinations WHERE journey_id = ${sourceJourneyId} AND section_id IS NULL
        ORDER BY start_date ASC NULLS LAST, created_time ASC NULLS LAST
      `;
      await importDestinationsIntoSection(targetJourneyId, newSec.id, srcDests);
    } else {
      const [sourceSection] = await sql<{ name: string }[]>`SELECT name FROM sections WHERE id = ${sourceSectionId}`;
      if (!sourceSection) continue;
      const [newSec] = await sql<{ id: string }[]>`INSERT INTO sections (journey_id, name, created_time) VALUES (${targetJourneyId}, ${sourceSection.name}, NOW()) RETURNING id`;
      const srcDests = await sql<SourceDestination[]>`
        SELECT id, name, description, start_date, location_id, image_url
        FROM destinations WHERE section_id = ${sourceSectionId}
        ORDER BY start_date ASC NULLS LAST, created_time ASC NULLS LAST
      `;
      await importDestinationsIntoSection(targetJourneyId, newSec.id, srcDests);
    }
  }

  await markJourneyChanged(targetJourneyId);
  redirect(`/journeys/${targetJourneyId}/sections`);
}
