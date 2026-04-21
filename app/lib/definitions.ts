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
};

export type Destination = {
  id: string;
  name: string;
  start_date: string | null;
  journey_id: string | null;
  section_id: string | null;
  created_time: string | null;
};

export type Accommodation = {
  id: string;
  destination_id: string;
  name: string | null;
  check_in: string | null;
  check_out: string | null;
  link: string | null;
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
  transport: Pick<Transport, 'type' | 'start_time' | 'end_time' | 'start_terminal' | 'end_terminal' | 'link'> | null;
  accommodation: Pick<Accommodation, 'name' | 'check_in' | 'check_out' | 'link'> | null;
  events: Pick<Event, 'id' | 'name' | 'type' | 'start_time' | 'end_time' | 'link'>[];
  records: Pick<Record, 'id' | 'name' | 'type' | 'link' | 'memo'>[];
};
