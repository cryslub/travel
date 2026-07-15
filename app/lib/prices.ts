'use server';

import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getExchangeRates(): Promise<Record<string, number>> {
  const cached = await sql<{ currency_b: string; rate: number }[]>`
    SELECT currency_b, rate FROM currencies
    WHERE currency_a = 'USD' AND update_date = CURRENT_DATE
  `;

  if (cached.length > 0) {
    const rates: Record<string, number> = { USD: 1 };
    for (const { currency_b, rate } of cached) {
      rates[currency_b] = rate;
    }
    return rates;
  }

  try {
    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${process.env.OPEN_EXCHANGE_RATES_APP_ID}`
    );
    if (!res.ok) return { USD: 1 };
    const body = await res.json() as { rates?: Record<string, number> };
    const rates = body.rates;
    if (!rates) return { USD: 1 };

    const today = new Date();
    const rows = Object.entries(rates).map(([currency_b, rate]) => ({
      currency_a: 'USD',
      currency_b,
      rate,
      update_date: today,
    }));

    await sql`DELETE FROM currencies WHERE currency_a = 'USD'`;
    if (rows.length > 0) {
      await sql`INSERT INTO currencies ${sql(rows)}`;
    }

    return rates;
  } catch {
    return { USD: 1 };
  }
}

export async function updateDestinationTotalPrice(destinationId: string): Promise<void> {
  const [dest] = await sql<{ price_id: string | null; journey_id: string | null }[]>`
    SELECT d.price_id, d.journey_id FROM destinations d WHERE d.id = ${destinationId}
  `;
  const existing_price_id = dest?.price_id ?? null;

  const journeyCurrency = dest?.journey_id
    ? await sql<{ currency: string | null }[]>`SELECT currency FROM journeys WHERE id = ${dest.journey_id} LIMIT 1`
        .then(rows => rows[0]?.currency ?? 'USD')
    : 'USD';

  const prices = await sql<{ value: number; currency: string }[]>`
    SELECT p.value, p.currency FROM (
      SELECT price_id FROM transports WHERE destination_id = ${destinationId}
      UNION ALL
      SELECT price_id FROM accommodations WHERE destination_id = ${destinationId}
      UNION ALL
      SELECT price_id FROM events WHERE destination_id = ${destinationId}
    ) sub
    JOIN prices p ON p.id = sub.price_id
    WHERE sub.price_id IS NOT NULL
  `;

  if (prices.length === 0) {
    await sql`UPDATE destinations SET price_id = NULL WHERE id = ${destinationId}`;
    return;
  }

  const rates = await getExchangeRates();

  let total = 0;
  for (const { value, currency } of prices) {
    const inUSD = value / (rates[currency] ?? 1);
    total += inUSD * (rates[journeyCurrency] ?? 1);
  }

  if (existing_price_id) {
    await sql`UPDATE prices SET value = ${total}, currency = ${journeyCurrency} WHERE id = ${existing_price_id}`;
  } else {
    const [row] = await sql<{ id: string }[]>`INSERT INTO prices (value, currency) VALUES (${total}, ${journeyCurrency}) RETURNING id`;
    await sql`UPDATE destinations SET price_id = ${row.id} WHERE id = ${destinationId}`;
  }
}
