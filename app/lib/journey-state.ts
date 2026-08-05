'use server';

import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function markJourneyChanged(journeyId: string): Promise<void> {
  await sql`UPDATE journeys SET import_state = 'changed' WHERE id = ${journeyId} AND import_state = 'imported'`;
}

export async function markJourneyChangedByDestination(destinationId: string): Promise<void> {
  await sql`
    UPDATE journeys SET import_state = 'changed'
    WHERE import_state = 'imported'
      AND id = (SELECT journey_id FROM destinations WHERE id = ${destinationId})
  `;
}

export async function markJourneyChangedByEvent(eventId: string): Promise<void> {
  await sql`
    UPDATE journeys SET import_state = 'changed'
    WHERE import_state = 'imported'
      AND id = (SELECT d.journey_id FROM events e JOIN destinations d ON d.id = e.destination_id WHERE e.id = ${eventId})
  `;
}
