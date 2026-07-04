import postgres from 'postgres';
import { unstable_noStore as noStore } from 'next/cache';
import {
  Accommodation,
  Event,
  Destination,
  DestinationWithTransport,
  Journey,
  Record,
  Section,
  Transport,
} from './definitions';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchDestinations(): Promise<DestinationWithTransport[]> {
  const rows = await sql<(Destination & {
    location_name: string | null; latitude: number | null; longitude: number | null;
    transport_type: string | null; transport_start_time: string | null; transport_end_time: string | null; transport_start_terminal: string | null; transport_end_terminal: string | null; transport_link: string | null; transport_start_latitude: number | null; transport_start_longitude: number | null; transport_end_latitude: number | null; transport_end_longitude: number | null;
    accommodation_name: string | null; accommodation_check_in: string | null; accommodation_check_out: string | null; accommodation_link: string | null; accommodation_latitude: number | null; accommodation_longitude: number | null;
    events: (Pick<Event, 'id' | 'name' | 'type' | 'start_time' | 'end_time' | 'link'> & { latitude: number | null; longitude: number | null })[] | null;
    records: Pick<Record, 'id' | 'name' | 'type' | 'link' | 'memo'>[] | null;
  })[]>`
    SELECT
      d.id, d.name, d.start_date, d.location_id,
      l.name AS location_name, l.latitude, l.longitude,
      t.type AS transport_type,
      t.start_time AS transport_start_time,
      t.end_time AS transport_end_time,
      t.start_terminal AS transport_start_terminal,
      t.end_terminal AS transport_end_terminal,
      t.link AS transport_link,
      sl.latitude AS transport_start_latitude,
      sl.longitude AS transport_start_longitude,
      tl.latitude AS transport_end_latitude,
      tl.longitude AS transport_end_longitude,
      a.name AS accommodation_name,
      a.check_in AS accommodation_check_in,
      a.check_out AS accommodation_check_out,
      a.link AS accommodation_link,
      al.latitude AS accommodation_latitude,
      al.longitude AS accommodation_longitude,
      (SELECT COALESCE(json_agg(json_build_object('id', ac.id, 'name', ac.name, 'type', ac.type, 'start_time', ac.start_time, 'end_time', ac.end_time, 'link', ac.link, 'latitude', el.latitude, 'longitude', el.longitude) ORDER BY ac.start_time ASC NULLS LAST, ac.created_time ASC NULLS LAST), '[]') FROM events ac LEFT JOIN locations el ON el.id = ac.location_id WHERE ac.destination_id = d.id) AS events,
      (SELECT COALESCE(json_agg(json_build_object('id', r.id, 'name', r.name, 'type', r.type, 'link', r.link, 'memo', r.memo) ORDER BY r.created_time ASC), '[]') FROM records r WHERE r.destination_id = d.id) AS records
    FROM destinations d
    LEFT JOIN locations l ON l.id = d.location_id
    LEFT JOIN transports t ON t.destination_id = d.id
    LEFT JOIN locations sl ON sl.id = t.start_location_id
    LEFT JOIN locations tl ON tl.id = t.end_location_id
    LEFT JOIN accommodations a ON a.destination_id = d.id
    LEFT JOIN locations al ON al.id = a.location_id
    GROUP BY d.id, d.name, d.start_date, d.location_id, d.created_time, l.name, l.latitude, l.longitude, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, sl.latitude, sl.longitude, tl.latitude, tl.longitude, a.name, a.check_in, a.check_out, a.link, al.latitude, al.longitude
    ORDER BY d.start_date ASC NULLS LAST, d.created_time ASC NULLS LAST, t.start_time ASC NULLS LAST
  `;
  return rows.map(({ transport_type, transport_start_time, transport_end_time, transport_start_terminal, transport_end_terminal, transport_link, transport_start_latitude, transport_start_longitude, transport_end_latitude, transport_end_longitude, accommodation_name, accommodation_check_in, accommodation_check_out, accommodation_link, accommodation_latitude, accommodation_longitude, events, records, ...d }) => ({
    ...d,
    section_name: null,
    transport: transport_type || transport_start_time || transport_end_time || transport_link
      ? { type: transport_type, start_time: transport_start_time, end_time: transport_end_time, start_terminal: transport_start_terminal, end_terminal: transport_end_terminal, link: transport_link, start_latitude: transport_start_latitude, start_longitude: transport_start_longitude, end_latitude: transport_end_latitude, end_longitude: transport_end_longitude }
      : null,
    accommodation: accommodation_name || accommodation_check_in || accommodation_check_out || accommodation_link
      ? { name: accommodation_name, check_in: accommodation_check_in, check_out: accommodation_check_out, link: accommodation_link, latitude: accommodation_latitude, longitude: accommodation_longitude }
      : null,
    events: events ?? [],
    records: records ?? [],
  }));
}

export async function fetchDestinationById(id: string): Promise<(Destination & { location_name: string | null; latitude: number | null; longitude: number | null }) | null> {
  const data = await sql<(Destination & { location_name: string | null; latitude: number | null; longitude: number | null })[]>`
    SELECT d.id, d.name, d.start_date, d.journey_id, d.section_id, d.location_id, d.image_url,
           l.name AS location_name, l.latitude, l.longitude
    FROM destinations d
    LEFT JOIN locations l ON l.id = d.location_id
    WHERE d.id = ${id}
  `;
  return data[0] ?? null;
}

export async function fetchAccommodationByDestinationId(destinationId: string): Promise<(Accommodation & { location_name: string | null; latitude: number | null; longitude: number | null }) | null> {
  const data = await sql<(Accommodation & { location_name: string | null; latitude: number | null; longitude: number | null })[]>`
    SELECT a.id, a.destination_id, a.name, a.check_in, a.check_out, a.link, a.image_url, a.location_id,
           l.name AS location_name, l.latitude, l.longitude
    FROM accommodations a
    LEFT JOIN locations l ON l.id = a.location_id
    WHERE a.destination_id = ${destinationId}
  `;
  return data[0] ?? null;
}

export async function fetchEventsByDestinationId(destinationId: string): Promise<(Event & { location_name: string | null; latitude: number | null; longitude: number | null })[]> {
  const data = await sql<(Event & { location_name: string | null; latitude: number | null; longitude: number | null })[]>`
    SELECT e.id, e.destination_id, e.name, e.type, e.start_time, e.end_time, e.link, e.memo, e.image_url, e.created_time, e.location_id,
           l.name AS location_name, l.latitude, l.longitude
    FROM events e
    LEFT JOIN locations l ON l.id = e.location_id
    WHERE e.destination_id = ${destinationId}
    ORDER BY e.start_time ASC NULLS LAST, e.created_time ASC NULLS LAST
  `;
  return data;
}

export async function fetchLatestEventEndTimeByDestinationId(destinationId: string): Promise<string | null> {
  const data = await sql<{ end_time: string | null }[]>`SELECT end_time FROM events WHERE destination_id = ${destinationId} AND end_time IS NOT NULL ORDER BY start_time DESC NULLS LAST, created_time DESC NULLS LAST LIMIT 1`;
  return data[0]?.end_time ?? null;
}

export async function fetchDestinationsByJourneyId(journeyId: string): Promise<DestinationWithTransport[]> {
  const rows = await sql<(Destination & {
    location_name: string | null; latitude: number | null; longitude: number | null;
    transport_type: string | null; transport_start_time: string | null; transport_end_time: string | null; transport_start_terminal: string | null; transport_end_terminal: string | null; transport_link: string | null; transport_start_latitude: number | null; transport_start_longitude: number | null; transport_end_latitude: number | null; transport_end_longitude: number | null;
    accommodation_name: string | null; accommodation_check_in: string | null; accommodation_check_out: string | null; accommodation_link: string | null; accommodation_image_url: string | null; accommodation_latitude: number | null; accommodation_longitude: number | null;
    events: (Pick<Event, 'id' | 'name' | 'type' | 'start_time' | 'end_time' | 'link' | 'image_url'> & { latitude: number | null; longitude: number | null })[] | null;
    records: Pick<Record, 'id' | 'name' | 'type' | 'link' | 'memo'>[] | null;
    section_name: string | null;
  })[]>`
    SELECT
      d.id, d.name, d.start_date, d.section_id, d.location_id, d.image_url,
      l.name AS location_name, l.latitude, l.longitude,
      s.name AS section_name,
      t.type AS transport_type,
      t.start_time AS transport_start_time,
      t.end_time AS transport_end_time,
      t.start_terminal AS transport_start_terminal,
      t.end_terminal AS transport_end_terminal,
      t.link AS transport_link,
      sl.latitude AS transport_start_latitude,
      sl.longitude AS transport_start_longitude,
      tl.latitude AS transport_end_latitude,
      tl.longitude AS transport_end_longitude,
      a.name AS accommodation_name,
      a.check_in AS accommodation_check_in,
      a.check_out AS accommodation_check_out,
      a.link AS accommodation_link,
      a.image_url AS accommodation_image_url,
      al.latitude AS accommodation_latitude,
      al.longitude AS accommodation_longitude,
      (SELECT COALESCE(json_agg(json_build_object('id', ac.id, 'name', ac.name, 'type', ac.type, 'start_time', ac.start_time, 'end_time', ac.end_time, 'link', ac.link, 'image_url', ac.image_url, 'latitude', el.latitude, 'longitude', el.longitude) ORDER BY ac.start_time ASC NULLS LAST, ac.created_time ASC NULLS LAST), '[]') FROM events ac LEFT JOIN locations el ON el.id = ac.location_id WHERE ac.destination_id = d.id) AS events,
      (SELECT COALESCE(json_agg(json_build_object('id', r.id, 'name', r.name, 'type', r.type, 'link', r.link, 'memo', r.memo) ORDER BY r.created_time ASC), '[]') FROM records r WHERE r.destination_id = d.id) AS records
    FROM destinations d
    LEFT JOIN transports t ON t.destination_id = d.id
    LEFT JOIN locations sl ON sl.id = t.start_location_id
    LEFT JOIN locations tl ON tl.id = t.end_location_id
    LEFT JOIN accommodations a ON a.destination_id = d.id
    LEFT JOIN locations al ON al.id = a.location_id
    LEFT JOIN locations l ON l.id = d.location_id
    LEFT JOIN sections s ON s.id = d.section_id
    WHERE d.journey_id = ${journeyId}
    GROUP BY d.id, d.name, d.start_date, d.section_id, d.location_id, d.image_url, d.created_time, l.name, l.latitude, l.longitude, s.name, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, sl.latitude, sl.longitude, tl.latitude, tl.longitude, a.name, a.check_in, a.check_out, a.link, a.image_url, al.latitude, al.longitude
    ORDER BY d.start_date ASC NULLS LAST, d.created_time ASC NULLS LAST, t.start_time ASC NULLS LAST
  `;
  return rows.map(({ transport_type, transport_start_time, transport_end_time, transport_start_terminal, transport_end_terminal, transport_link, transport_start_latitude, transport_start_longitude, transport_end_latitude, transport_end_longitude, accommodation_name, accommodation_check_in, accommodation_check_out, accommodation_link, accommodation_image_url, accommodation_latitude, accommodation_longitude, section_name, events, records, ...d }) => ({
    ...d,
    transport: transport_type || transport_start_time || transport_end_time || transport_link
      ? { type: transport_type, start_time: transport_start_time, end_time: transport_end_time, start_terminal: transport_start_terminal, end_terminal: transport_end_terminal, link: transport_link, start_latitude: transport_start_latitude, start_longitude: transport_start_longitude, end_latitude: transport_end_latitude, end_longitude: transport_end_longitude }
      : null,
    accommodation: accommodation_name || accommodation_check_in || accommodation_check_out || accommodation_link
      ? { name: accommodation_name, check_in: accommodation_check_in, check_out: accommodation_check_out, link: accommodation_link, image_url: accommodation_image_url, latitude: accommodation_latitude, longitude: accommodation_longitude }
      : null,
    section_name: section_name ?? null,
    events: events ?? [],
    records: records ?? [],
  }));
}

export async function fetchRecordsByDestinationId(destinationId: string): Promise<Record[]> {
  const data = await sql<Record[]>`SELECT id, destination_id, name, type, link, memo FROM records WHERE destination_id = ${destinationId}`;
  return data;
}

export async function fetchJourneys(): Promise<Journey[]> {
  noStore();
  const data = await sql<Journey[]>`SELECT id, name, start_date, end_date, image_url, created_time FROM journeys ORDER BY start_date DESC NULLS LAST, created_time DESC`;
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

export async function fetchTransportByDestinationId(destinationId: string): Promise<(Transport & { start_location_name: string | null; start_latitude: number | null; start_longitude: number | null; end_location_name: string | null; end_latitude: number | null; end_longitude: number | null }) | null> {
  const data = await sql<(Transport & { start_location_name: string | null; start_latitude: number | null; start_longitude: number | null; end_location_name: string | null; end_latitude: number | null; end_longitude: number | null })[]>`
    SELECT t.id, t.destination_id, t.type, t.start_time, t.end_time, t.start_terminal, t.end_terminal, t.link, t.start_location_id, t.end_location_id,
           ls.name AS start_location_name, ls.latitude AS start_latitude, ls.longitude AS start_longitude,
           le.name AS end_location_name, le.latitude AS end_latitude, le.longitude AS end_longitude
    FROM transports t
    LEFT JOIN locations ls ON ls.id = t.start_location_id
    LEFT JOIN locations le ON le.id = t.end_location_id
    WHERE t.destination_id = ${destinationId}
  `;
  return data[0] ?? null;
}

export async function fetchSectionsByJourneyId(journeyId: string): Promise<Section[]> {
  const data = await sql<Section[]>`SELECT id, journey_id, name, created_time FROM sections WHERE journey_id = ${journeyId} ORDER BY created_time ASC`;
  return data;
}