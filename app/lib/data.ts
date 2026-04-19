import postgres from 'postgres';
import {
  Accommodation,
  Event,
  Destination,
  DestinationWithTransport,
  Journey,
  Record,
  Transport,
} from './definitions';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchDestinations(): Promise<DestinationWithTransport[]> {
  const rows = await sql<(Destination & {
    transport_type: string | null; transport_start_time: string | null; transport_end_time: string | null; transport_start_terminal: string | null; transport_end_terminal: string | null; transport_link: string | null;
    accommodation_name: string | null; accommodation_check_in: string | null; accommodation_check_out: string | null; accommodation_link: string | null;
    events: Pick<Event, 'id' | 'name' | 'type' | 'start_time' | 'end_time' | 'link'>[] | null;
    records: Pick<Record, 'id' | 'name' | 'type' | 'link' | 'memo'>[] | null;
  })[]>`
    SELECT
      d.id, d.name, d.start_date,
      t.type AS transport_type,
      t.start_time AS transport_start_time,
      t.end_time AS transport_end_time,
      t.start_terminal AS transport_start_terminal,
      t.end_terminal AS transport_end_terminal,
      t.link AS transport_link,
      a.name AS accommodation_name,
      a.check_in AS accommodation_check_in,
      a.check_out AS accommodation_check_out,
      a.link AS accommodation_link,
      (SELECT COALESCE(json_agg(json_build_object('id', ac.id, 'name', ac.name, 'type', ac.type, 'start_time', ac.start_time, 'end_time', ac.end_time, 'link', ac.link) ORDER BY ac.start_time ASC NULLS LAST, ac.created_time ASC NULLS LAST), '[]') FROM events ac WHERE ac.destination_id = d.id) AS events,
      (SELECT COALESCE(json_agg(json_build_object('id', r.id, 'name', r.name, 'type', r.type, 'link', r.link, 'memo', r.memo) ORDER BY r.created_time ASC), '[]') FROM records r WHERE r.destination_id = d.id) AS records
    FROM destinations d
    LEFT JOIN transports t ON t.destination_id = d.id
    LEFT JOIN accommodations a ON a.destination_id = d.id
    GROUP BY d.id, d.name, d.start_date, d.created_time, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, a.name, a.check_in, a.check_out, a.link
    ORDER BY d.start_date ASC NULLS LAST, d.created_time ASC NULLS LAST, t.start_time ASC NULLS LAST
  `;
  return rows.map(({ transport_type, transport_start_time, transport_end_time, transport_start_terminal, transport_end_terminal, transport_link, accommodation_name, accommodation_check_in, accommodation_check_out, accommodation_link, events, records, ...d }) => ({
    ...d,
    transport: transport_type || transport_start_time || transport_end_time || transport_link
      ? { type: transport_type, start_time: transport_start_time, end_time: transport_end_time, start_terminal: transport_start_terminal, end_terminal: transport_end_terminal, link: transport_link }
      : null,
    accommodation: accommodation_name || accommodation_check_in || accommodation_check_out || accommodation_link
      ? { name: accommodation_name, check_in: accommodation_check_in, check_out: accommodation_check_out, link: accommodation_link }
      : null,
    events: events ?? [],
    records: records ?? [],
  }));
}

export async function fetchDestinationById(id: string): Promise<Destination | null> {
  const data = await sql<Destination[]>`SELECT id, name, start_date FROM destinations WHERE id = ${id}`;
  return data[0] ?? null;
}

export async function fetchAccommodationByDestinationId(destinationId: string): Promise<Accommodation | null> {
  const data = await sql<Accommodation[]>`SELECT id, destination_id, name, check_in, check_out, link FROM accommodations WHERE destination_id = ${destinationId}`;
  return data[0] ?? null;
}

export async function fetchEventsByDestinationId(destinationId: string): Promise<Event[]> {
  const data = await sql<Event[]>`SELECT id, destination_id, name, type, start_time, end_time, link, memo FROM events WHERE destination_id = ${destinationId} ORDER BY start_time ASC NULLS LAST, created_time ASC NULLS LAST`;
  return data;
}

export async function fetchDestinationsByJourneyId(journeyId: string): Promise<DestinationWithTransport[]> {
  const rows = await sql<(Destination & {
    transport_type: string | null; transport_start_time: string | null; transport_end_time: string | null; transport_start_terminal: string | null; transport_end_terminal: string | null; transport_link: string | null;
    accommodation_name: string | null; accommodation_check_in: string | null; accommodation_check_out: string | null; accommodation_link: string | null;
    events: Pick<Event, 'id' | 'name' | 'type' | 'start_time' | 'end_time' | 'link'>[] | null;
    records: Pick<Record, 'id' | 'name' | 'type' | 'link' | 'memo'>[] | null;
  })[]>`
    SELECT
      d.id, d.name, d.start_date,
      t.type AS transport_type,
      t.start_time AS transport_start_time,
      t.end_time AS transport_end_time,
      t.start_terminal AS transport_start_terminal,
      t.end_terminal AS transport_end_terminal,
      t.link AS transport_link,
      a.name AS accommodation_name,
      a.check_in AS accommodation_check_in,
      a.check_out AS accommodation_check_out,
      a.link AS accommodation_link,
      (SELECT COALESCE(json_agg(json_build_object('id', ac.id, 'name', ac.name, 'type', ac.type, 'start_time', ac.start_time, 'end_time', ac.end_time, 'link', ac.link) ORDER BY ac.start_time ASC NULLS LAST, ac.created_time ASC NULLS LAST), '[]') FROM events ac WHERE ac.destination_id = d.id) AS events,
      (SELECT COALESCE(json_agg(json_build_object('id', r.id, 'name', r.name, 'type', r.type, 'link', r.link, 'memo', r.memo) ORDER BY r.created_time ASC), '[]') FROM records r WHERE r.destination_id = d.id) AS records
    FROM destinations d
    LEFT JOIN transports t ON t.destination_id = d.id
    LEFT JOIN accommodations a ON a.destination_id = d.id
    WHERE d.journey_id = ${journeyId}
    GROUP BY d.id, d.name, d.start_date, d.created_time, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, a.name, a.check_in, a.check_out, a.link
    ORDER BY d.start_date ASC NULLS LAST, d.created_time ASC NULLS LAST, t.start_time ASC NULLS LAST
  `;
  return rows.map(({ transport_type, transport_start_time, transport_end_time, transport_start_terminal, transport_end_terminal, transport_link, accommodation_name, accommodation_check_in, accommodation_check_out, accommodation_link, events, records, ...d }) => ({
    ...d,
    transport: transport_type || transport_start_time || transport_end_time || transport_link
      ? { type: transport_type, start_time: transport_start_time, end_time: transport_end_time, start_terminal: transport_start_terminal, end_terminal: transport_end_terminal, link: transport_link }
      : null,
    accommodation: accommodation_name || accommodation_check_in || accommodation_check_out || accommodation_link
      ? { name: accommodation_name, check_in: accommodation_check_in, check_out: accommodation_check_out, link: accommodation_link }
      : null,
    events: events ?? [],
    records: records ?? [],
  }));
}

export async function fetchRecordsByDestinationId(destinationId: string): Promise<Record[]> {
  const data = await sql<Record[]>`SELECT id, destination_id, name, type, link, memo FROM records WHERE destination_id = ${destinationId}`;
  return data;
}

export async function fetchJourneys(): Promise<Journey[]> {
  const data = await sql<Journey[]>`SELECT id, name, start_date, created_time FROM journeys ORDER BY start_date DESC NULLS LAST, created_time DESC`;
  return data;
}

export async function fetchLatestDestinationStartDate(): Promise<string | null> {
  const data = await sql<{ latest: string | null }[]>`SELECT MAX(start_date) AS latest FROM destinations`;
  return data[0]?.latest ?? null;
}

export async function fetchEarliestJourneyStartDate(): Promise<string | null> {
  const data = await sql<{ earliest: string | null }[]>`SELECT MIN(start_date) AS earliest FROM journeys`;
  return data[0]?.earliest ?? null;
}

export async function fetchJourneyById(id: string): Promise<Journey | null> {
  const data = await sql<Journey[]>`SELECT id, name, start_date FROM journeys WHERE id = ${id}`;
  return data[0] ?? null;
}

export async function fetchLatestDestinationStartDateByJourneyId(journeyId: string): Promise<string | null> {
  const data = await sql<{ latest: string | null }[]>`SELECT MAX(start_date) AS latest FROM destinations WHERE journey_id = ${journeyId}`;
  return data[0]?.latest ?? null;
}

export async function fetchTransportByDestinationId(destinationId: string): Promise<Transport | null> {
  const data = await sql<Transport[]>`SELECT id, destination_id, type, start_time, end_time, start_terminal, end_terminal, link FROM transports WHERE destination_id = ${destinationId}`;
  return data[0] ?? null;
}