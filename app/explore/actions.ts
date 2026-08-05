'use server';

import postgres from 'postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { duplicateBlob } from '@/app/lib/blob';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function toggleJourneyLike(journeyId: string, currentlyLiked: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;
  const signInType = (session.user as any)?.sign_in_type ?? 'Google';

  const [user] = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE email = ${session.user.email} AND sign_in_type = ${signInType}
  `;
  if (!user) return;

  if (currentlyLiked) {
    await sql`DELETE FROM likes WHERE user_id = ${user.id} AND journey_id = ${journeyId}`;
  } else {
    await sql`
      INSERT INTO likes (user_id, journey_id)
      SELECT ${user.id}, ${journeyId}
      WHERE NOT EXISTS (
        SELECT 1 FROM likes WHERE user_id = ${user.id} AND journey_id = ${journeyId}
      )
    `;
  }
  await sql`
    UPDATE journeys SET likes = (
      SELECT COUNT(*) FROM likes WHERE journey_id = ${journeyId}
    ) WHERE id = ${journeyId}
  `;
  revalidatePath('/explore');
}

export async function importJourney(sourceJourneyId: string, selectedSectionIds?: string[]): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const signInType = (session.user as any)?.sign_in_type ?? 'Google';
  const [user] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email} AND sign_in_type = ${signInType}`;
  if (!user) return null;

  const [sourceJourney] = await sql<{
    name: string; description: string | null; start_date: string | null; end_date: string | null; image_url: string | null; currency: string | null;
  }[]>`SELECT name, description, start_date, end_date, image_url, currency FROM journeys WHERE id = ${sourceJourneyId}`;
  if (!sourceJourney) return null;

  const allSections = await sql<{ id: string; name: string }[]>`SELECT id, name FROM sections WHERE journey_id = ${sourceJourneyId} ORDER BY created_time`;
  const sectionsToImport = selectedSectionIds
    ? allSections.filter((s) => selectedSectionIds.includes(s.id))
    : allSections;

  const includeNone = !selectedSectionIds || selectedSectionIds.includes('__none__');
  const realSectionIds = selectedSectionIds
    ? selectedSectionIds.filter((id) => id !== '__none__')
    : allSections.map((s) => s.id);
  const fallbackUuid = '00000000-0000-0000-0000-000000000000';

  const sourceDestinations = await sql<{
    id: string; section_id: string | null; location_id: string | null; name: string; description: string | null; start_date: string | null; image_url: string | null;
    price_value: number | null; price_currency: string | null;
  }[]>`
    SELECT d.id, d.section_id, d.location_id, d.name, d.description, d.start_date, d.image_url, p.value AS price_value, p.currency AS price_currency
    FROM destinations d
    LEFT JOIN prices p ON p.id = d.price_id
    WHERE d.journey_id = ${sourceJourneyId}
      AND (
        (${includeNone} AND d.section_id IS NULL)
        OR (${realSectionIds.length > 0} AND d.section_id = ANY(${realSectionIds.length > 0 ? realSectionIds : [fallbackUuid]}::uuid[]))
      )
  `;
  const oldDestIds = sourceDestinations.map((d) => d.id);

  const [transports, accommodations, events, records] = await Promise.all([
    oldDestIds.length > 0
      ? sql<{ destination_id: string; type: string | null; start_time: string | null; end_time: string | null; start_terminal: string | null; end_terminal: string | null; start_location_id: string | null; end_location_id: string | null; link: string | null; memo: string | null; price_value: number | null; price_currency: string | null }[]>`
          SELECT t.destination_id, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.start_location_id, t.end_location_id, t.link, t.memo, p.value AS price_value, p.currency AS price_currency
          FROM transports t
          LEFT JOIN prices p ON p.id = t.price_id
          WHERE t.destination_id = ANY(${oldDestIds}::uuid[])
        `
      : Promise.resolve([]),
    oldDestIds.length > 0
      ? sql<{ destination_id: string; name: string | null; location_id: string | null; check_in: string | null; check_out: string | null; link: string | null; memo: string | null; image_url: string | null; price_value: number | null; price_currency: string | null }[]>`
          SELECT a.destination_id, a.name, a.location_id, a.check_in, a.check_out, a.link, a.memo, a.image_url, p.value AS price_value, p.currency AS price_currency
          FROM accommodations a
          LEFT JOIN prices p ON p.id = a.price_id
          WHERE a.destination_id = ANY(${oldDestIds}::uuid[])
        `
      : Promise.resolve([]),
    oldDestIds.length > 0
      ? sql<{ destination_id: string; type: string | null; name: string | null; location_id: string | null; start_time: string | null; end_time: string | null; memo: string | null; link: string | null; image_url: string | null; price_value: number | null; price_currency: string | null }[]>`
          SELECT e.destination_id, e.type, e.name, e.location_id, e.start_time, e.end_time, e.memo, e.link, e.image_url, p.value AS price_value, p.currency AS price_currency
          FROM events e
          LEFT JOIN prices p ON p.id = e.price_id
          WHERE e.destination_id = ANY(${oldDestIds}::uuid[])
        `
      : Promise.resolve([]),
    oldDestIds.length > 0
      ? sql<{ destination_id: string; type: string | null; name: string; link: string | null; memo: string | null }[]>`
          SELECT destination_id, type, name, link, memo FROM records WHERE destination_id = ANY(${oldDestIds}::uuid[])
        `
      : Promise.resolve([]),
  ]);

  // Duplicate every referenced image as a brand-new blob so the copy never shares
  // storage with the source — deleting either side must not break the other.
  const [newJourneyImageUrl, destImageUrls, accImageUrls, eventImageUrls] = await Promise.all([
    duplicateBlob(sourceJourney.image_url, 'journeys'),
    Promise.all(sourceDestinations.map((d) => duplicateBlob(d.image_url, 'destinations'))),
    Promise.all(accommodations.map((a) => duplicateBlob(a.image_url, 'accommodations'))),
    Promise.all(events.map((e) => duplicateBlob(e.image_url, 'events'))),
  ]);

  let newJourneyId: string | null = null;
  await sql.begin(async (sql) => {
    const [newJourney] = await sql<{ id: string }[]>`
      INSERT INTO journeys (user_id, name, description, start_date, end_date, image_url, currency, import_state, original_id)
      VALUES (${user.id}, ${sourceJourney.name}, ${sourceJourney.description}, ${sourceJourney.start_date}, ${sourceJourney.end_date}, ${newJourneyImageUrl}, ${sourceJourney.currency}, 'imported', ${sourceJourneyId})
      RETURNING id
    `;
    newJourneyId = newJourney.id;

    await sql`INSERT INTO journey_countries (journey_id, country_code) SELECT ${newJourneyId}, country_code FROM journey_countries WHERE journey_id = ${sourceJourneyId}`;

    const sectionMap = new Map<string, string>();
    for (const s of sectionsToImport) {
      const [ns] = await sql<{ id: string }[]>`INSERT INTO sections (journey_id, name) VALUES (${newJourneyId}, ${s.name}) RETURNING id`;
      sectionMap.set(s.id, ns.id);
    }

    const destIdMap = new Map<string, string>();
    for (let i = 0; i < sourceDestinations.length; i++) {
      const d = sourceDestinations[i];
      let newPriceId: string | null = null;
      if (d.price_value != null) {
        const [row] = await sql<{ id: string }[]>`INSERT INTO prices (value, currency) VALUES (${d.price_value}, ${d.price_currency}) RETURNING id`;
        newPriceId = row.id;
      }
      const newSectionId = d.section_id ? sectionMap.get(d.section_id) ?? null : null;
      const [newDest] = await sql<{ id: string }[]>`
        INSERT INTO destinations (journey_id, section_id, location_id, name, description, start_date, image_url, price_id)
        VALUES (${newJourneyId}, ${newSectionId}, ${d.location_id}, ${d.name}, ${d.description}, ${d.start_date}, ${destImageUrls[i]}, ${newPriceId})
        RETURNING id
      `;
      destIdMap.set(d.id, newDest.id);
    }

    for (const t of transports) {
      let newPriceId: string | null = null;
      if (t.price_value != null) {
        const [row] = await sql<{ id: string }[]>`INSERT INTO prices (value, currency) VALUES (${t.price_value}, ${t.price_currency}) RETURNING id`;
        newPriceId = row.id;
      }
      await sql`
        INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, start_location_id, end_location_id, link, memo, price_id)
        VALUES (${destIdMap.get(t.destination_id) ?? null}, ${t.type}, ${t.start_time}, ${t.end_time}, ${t.start_terminal}, ${t.end_terminal}, ${t.start_location_id}, ${t.end_location_id}, ${t.link}, ${t.memo}, ${newPriceId})
      `;
    }

    for (let i = 0; i < accommodations.length; i++) {
      const a = accommodations[i];
      let newPriceId: string | null = null;
      if (a.price_value != null) {
        const [row] = await sql<{ id: string }[]>`INSERT INTO prices (value, currency) VALUES (${a.price_value}, ${a.price_currency}) RETURNING id`;
        newPriceId = row.id;
      }
      await sql`
        INSERT INTO accommodations (destination_id, name, location_id, check_in, check_out, link, memo, image_url, price_id)
        VALUES (${destIdMap.get(a.destination_id) ?? null}, ${a.name}, ${a.location_id}, ${a.check_in}, ${a.check_out}, ${a.link}, ${a.memo}, ${accImageUrls[i]}, ${newPriceId})
      `;
    }

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      let newPriceId: string | null = null;
      if (e.price_value != null) {
        const [row] = await sql<{ id: string }[]>`INSERT INTO prices (value, currency) VALUES (${e.price_value}, ${e.price_currency}) RETURNING id`;
        newPriceId = row.id;
      }
      await sql`
        INSERT INTO events (destination_id, type, name, location_id, start_time, end_time, memo, link, image_url, price_id)
        VALUES (${destIdMap.get(e.destination_id) ?? null}, ${e.type}, ${e.name}, ${e.location_id}, ${e.start_time}, ${e.end_time}, ${e.memo}, ${e.link}, ${eventImageUrls[i]}, ${newPriceId})
      `;
    }

    for (const r of records) {
      await sql`INSERT INTO records (destination_id, type, name, link, memo) VALUES (${destIdMap.get(r.destination_id) ?? null}, ${r.type}, ${r.name}, ${r.link}, ${r.memo})`;
    }
  });

  revalidatePath('/journeys');
  return newJourneyId;
}
