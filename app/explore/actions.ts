'use server';

import postgres from 'postgres';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function toggleJourneyLike(journeyId: string, currentlyLiked: boolean) {
  const session = await getServerSession();
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
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  const signInType = (session.user as any)?.sign_in_type ?? 'Google';
  const [user] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${session.user.email} AND sign_in_type = ${signInType}`;
  if (!user) return null;

  let newJourneyId: string | null = null;
  await sql.begin(async (sql) => {
    // Journey
    const [newJourney] = await sql<{ id: string }[]>`
      INSERT INTO journeys (user_id, name, start_date, end_date, image_url, currency)
      SELECT ${user.id}, name, start_date, end_date, image_url, currency
      FROM journeys WHERE id = ${sourceJourneyId}
      RETURNING id
    `;
    newJourneyId = newJourney.id;

    // Countries
    await sql`INSERT INTO journey_countries (journey_id, country_code) SELECT ${newJourneyId}, country_code FROM journey_countries WHERE journey_id = ${sourceJourneyId}`;

    // Sections
    const allSections = await sql<{ id: string; name: string }[]>`SELECT id, name FROM sections WHERE journey_id = ${sourceJourneyId} ORDER BY created_time`;
    const sectionsToImport = selectedSectionIds
      ? allSections.filter((s) => selectedSectionIds.includes(s.id))
      : allSections;
    const sectionMap = new Map<string, string>();
    for (const s of sectionsToImport) {
      const [ns] = await sql<{ id: string }[]>`INSERT INTO sections (journey_id, name) VALUES (${newJourneyId}, ${s.name}) RETURNING id`;
      sectionMap.set(s.id, ns.id);
    }

    // Destinations — bulk copy with price duplication using a single CTE
    const includeNone = !selectedSectionIds || selectedSectionIds.includes('__none__');
    const realSectionIds = selectedSectionIds
      ? selectedSectionIds.filter((id) => id !== '__none__')
      : allSections.map((s) => s.id);
    const oldSectionIds = [...sectionMap.keys()];
    const newSectionIds = [...sectionMap.values()];
    const fallbackUuid = '00000000-0000-0000-0000-000000000000';

    await sql`
      WITH
      section_map(old_id, new_id) AS (
        SELECT unnest(${oldSectionIds.length > 0 ? oldSectionIds : [fallbackUuid]}::uuid[]),
               unnest(${newSectionIds.length > 0 ? newSectionIds : [fallbackUuid]}::uuid[])
      ),
      mapped_dests AS MATERIALIZED (
        SELECT
          d.id                                                          AS old_dest_id,
          uuid_generate_v4()                                            AS new_dest_id,
          sm.new_id                                                     AS new_section_id,
          d.location_id, d.name, d.start_date, d.image_url,
          CASE WHEN d.price_id IS NOT NULL THEN uuid_generate_v4() END AS new_price_id,
          p.value AS price_value, p.currency AS price_currency
        FROM destinations d
        LEFT JOIN prices p ON p.id = d.price_id
        LEFT JOIN section_map sm ON sm.old_id = d.section_id
        WHERE d.journey_id = ${sourceJourneyId}
          AND (
            (${includeNone} AND d.section_id IS NULL)
            OR (${realSectionIds.length > 0} AND d.section_id = ANY(${realSectionIds.length > 0 ? realSectionIds : [fallbackUuid]}::uuid[]))
          )
      ),
      mapped_transports AS MATERIALIZED (
        SELECT
          md.new_dest_id,
          t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal,
          t.start_location_id, t.end_location_id, t.link, t.memo,
          CASE WHEN t.price_id IS NOT NULL THEN uuid_generate_v4() END AS new_price_id,
          p.value AS price_value, p.currency AS price_currency
        FROM mapped_dests md
        JOIN transports t ON t.destination_id = md.old_dest_id
        LEFT JOIN prices p ON p.id = t.price_id
      ),
      mapped_accommodations AS MATERIALIZED (
        SELECT
          md.new_dest_id,
          a.name, a.location_id, a.check_in, a.check_out, a.link, a.memo, a.image_url,
          CASE WHEN a.price_id IS NOT NULL THEN uuid_generate_v4() END AS new_price_id,
          p.value AS price_value, p.currency AS price_currency
        FROM mapped_dests md
        JOIN accommodations a ON a.destination_id = md.old_dest_id
        LEFT JOIN prices p ON p.id = a.price_id
      ),
      mapped_events AS MATERIALIZED (
        SELECT
          md.new_dest_id,
          e.type, e.name, e.location_id, e.start_time, e.end_time, e.memo, e.link, e.image_url,
          CASE WHEN e.price_id IS NOT NULL THEN uuid_generate_v4() END AS new_price_id,
          p.value AS price_value, p.currency AS price_currency
        FROM mapped_dests md
        JOIN events e ON e.destination_id = md.old_dest_id
        LEFT JOIN prices p ON p.id = e.price_id
      ),
      ins_prices AS (
        INSERT INTO prices (id, value, currency)
          SELECT new_price_id, price_value, price_currency FROM mapped_dests        WHERE new_price_id IS NOT NULL
          UNION ALL
          SELECT new_price_id, price_value, price_currency FROM mapped_transports   WHERE new_price_id IS NOT NULL
          UNION ALL
          SELECT new_price_id, price_value, price_currency FROM mapped_accommodations WHERE new_price_id IS NOT NULL
          UNION ALL
          SELECT new_price_id, price_value, price_currency FROM mapped_events       WHERE new_price_id IS NOT NULL
      ),
      ins_dests AS (
        INSERT INTO destinations (id, journey_id, section_id, location_id, name, start_date, image_url, price_id)
        SELECT new_dest_id, ${newJourneyId}, new_section_id, location_id, name, start_date, image_url, new_price_id
        FROM mapped_dests
      ),
      ins_transports AS (
        INSERT INTO transports (destination_id, type, start_time, end_time, start_terminal, end_terminal, start_location_id, end_location_id, link, memo, price_id)
        SELECT new_dest_id, type, start_time, end_time, start_terminal, end_terminal, start_location_id, end_location_id, link, memo, new_price_id
        FROM mapped_transports
      ),
      ins_accommodations AS (
        INSERT INTO accommodations (destination_id, name, location_id, check_in, check_out, link, memo, image_url, price_id)
        SELECT new_dest_id, name, location_id, check_in, check_out, link, memo, image_url, new_price_id
        FROM mapped_accommodations
      ),
      ins_events AS (
        INSERT INTO events (destination_id, type, name, location_id, start_time, end_time, memo, link, image_url, price_id)
        SELECT new_dest_id, type, name, location_id, start_time, end_time, memo, link, image_url, new_price_id
        FROM mapped_events
      ),
      ins_records AS (
        INSERT INTO records (destination_id, type, name, link, memo)
        SELECT md.new_dest_id, r.type, r.name, r.link, r.memo
        FROM mapped_dests md
        JOIN records r ON r.destination_id = md.old_dest_id
      )
      SELECT 1
    `;
  });

  revalidatePath('/journeys');
  return newJourneyId;
}
