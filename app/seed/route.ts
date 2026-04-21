import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function ensureExtension() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
}

async function createJourneys() {

  await sql`
    DROP TABLE IF EXISTS journeys CASCADE ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS journeys (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      start_date DATE,
      created_time TIMESTAMP DEFAULT NOW()
    );
  `;

}


async function createSections() {

  await sql`
    DROP TABLE IF EXISTS sections CASCADE ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS sections (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      created_time TIMESTAMP DEFAULT NOW()
    );
  `;

}

async function createDestinations() {

  await sql`
    DROP TABLE IF EXISTS destinations CASCADE ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS destinations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
      section_id UUID REFERENCES sections(id),
      name VARCHAR(255) NOT NULL,
      start_date DATE,
      created_time TIMESTAMP DEFAULT NOW()
    );
  `;

}

async function createTransports() {

  await sql`
    DROP TABLE IF EXISTS transports ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS transports (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
     type VARCHAR(50) NOT NULL,
     start_time VARCHAR(50),
     end_time VARCHAR(50),
     start_terminal TEXT,
     end_terminal TEXT,
     link TEXT
    );
  `;

  await sql`
    ALTER TABLE transports ADD CONSTRAINT transports_destination_id_unique UNIQUE (destination_id);
  `;

}

async function createAccommodations() {

  await sql`
    DROP TABLE IF EXISTS accommodations ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS accommodations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
      name TEXT,
      check_in TIME,
  check_out TIME,
     link TEXT
    );
  `;

  await sql`
    ALTER TABLE accommodations ADD CONSTRAINT accommodations_destination_id_unique UNIQUE (destination_id);
  `;

}


async function createEvents() {

  await sql`
    DROP TABLE IF EXISTS events ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
      type VARCHAR(50),
      name TEXT NOT NULL,
      start_time VARCHAR(50),
      end_time VARCHAR(50),
     memo TEXT,
     link TEXT,
      created_time TIMESTAMP DEFAULT NOW()
    );
  `;


}



async function createRecords() {

  await sql`
    DROP TABLE IF EXISTS records ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS records (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
      type VARCHAR(50),
      name TEXT NOT NULL,
      link TEXT,
      memo TEXT,
      created_time TIMESTAMP DEFAULT NOW()
    );
  `;


}

export async function GET() {
  try {
    await ensureExtension();

   const result = await sql.begin(async (sql) => {
      await createJourneys();
      await createSections();
      await createDestinations();
      await createTransports();
      await createAccommodations();
      await createEvents();
      await createRecords();
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
