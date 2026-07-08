import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function ensureExtension() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
}

async function createLocations() {

  await sql`
    DROP TABLE IF EXISTS locations CASCADE ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS locations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT,
      latitude NUMERIC,
      longitude NUMERIC
    );
  `;

}

async function createJourneys() {

  await sql`
    DROP TABLE IF EXISTS journeys CASCADE ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS journeys (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
      location_id UUID REFERENCES locations(id),
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
    start_location_id UUID REFERENCES locations(id),
    end_location_id UUID REFERENCES locations(id),
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
      location_id UUID REFERENCES locations(id),
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
      location_id UUID REFERENCES locations(id),
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

async function createJourneyCoutnries() {

  await sql`
    DROP TABLE IF EXISTS journey_countries ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS journey_countries (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
      country_code VARCHAR(6)
    );
  `;


}

async function createUsers() {

  await sql`
    DROP TABLE IF EXISTS users ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      sign_in_type TEXT,
      email TEXT
    );
  `;


}


async function createPreferences() {

  await sql`
    DROP TABLE IF EXISTS preferences ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS preferences (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      destinations_view VARCHAR(10) DEFAULT  'Summary',
      currency VARCHAR(10) DEFAULT  'USD'
    );
  `;

}


async function createPrices() {

  await sql`
    DROP TABLE IF EXISTS prices ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS prices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      value DOUBLE PRECISION,
      currency VARCHAR(10)
    );
  `;

}



async function createCurrencies() {

  await sql`
    DROP TABLE IF EXISTS currencies ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS currencies (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      currency_a VARCHAR(10),
      currency_b VARCHAR(10),
      rate DOUBLE PRECISION,
      update_date DATE
    );
  `;

}


async function createLikes() {

  await sql`
    DROP TABLE IF EXISTS likes ;
  `;

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS likes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE
    );
  `;

}



export async function GET() {
  try {
    await ensureExtension();

   const result = await sql.begin(async (sql) => {
      // await createJourneys();
      // await createLocations(); 
      // await createSections();
      // await createDestinations();
      // await createTransports();
      // await createAccommodations();
      // await createEvents();
      // await createRecords();
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
