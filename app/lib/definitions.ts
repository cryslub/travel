// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type Section = {
  id: string;
  journey_id: string;
  name: string;
  created_time: string | null;
};

export type Journey = {
  id: string;
  name: string;
  start_date: string | null;
  created_time: string | null;
};

export type Transport = {
  id: string;
  destination_id: string;
  type: string | null;
  start_time: string | null;
  end_time: string | null;
  start_terminal: string | null;
  end_terminal: string | null;
  link: string | null;
  start_location_id: string | null;
  end_location_id: string | null;
};

export type Location = {
  id: string;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type Destination = {
  id: string;
  name: string;
  start_date: string | null;
  journey_id: string | null;
  section_id: string | null;
  location_id: string | null;
  created_time: string | null;
};

export type Accommodation = {
  id: string;
  destination_id: string;
  name: string | null;
  check_in: string | null;
  check_out: string | null;
  link: string | null;
  location_id: string | null;
};

export type Event = {
  id: string;
  destination_id: string;
  name: string | null;
  type: string | null;
  start_time: string | null;
  end_time: string | null;
  link: string | null;
  memo: string | null;
  created_time: string | null;
  location_id: string | null;
};

export type Record = {
  id: string;
  destination_id: string;
  name: string;
  type: string | null;
  link: string | null;
  memo: string | null;
  created_time: string | null;
};

export type DestinationWithTransport = Destination & {
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  transport: (Pick<Transport, 'type' | 'start_time' | 'end_time' | 'start_terminal' | 'end_terminal' | 'link'> & { start_latitude: number | null; start_longitude: number | null; end_latitude: number | null; end_longitude: number | null }) | null;
  accommodation: (Pick<Accommodation, 'name' | 'check_in' | 'check_out' | 'link'> & { latitude: number | null; longitude: number | null }) | null;
  events: (Pick<Event, 'id' | 'name' | 'type' | 'start_time' | 'end_time' | 'link'> & { latitude: number | null; longitude: number | null })[];
  records: Pick<Record, 'id' | 'name' | 'type' | 'link' | 'memo'>[];
  section_name: string | null;
};
