'use server';

import { getServerSession } from 'next-auth';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function updateDestinationsView(view: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET destinations_view = ${view}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
}

export async function updateDisplayName(name: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET name = ${name}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
}

export async function updateCurrency(currency: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return;
  const signInType = (session.user as any).sign_in_type ?? 'Google';

  await sql`
    UPDATE preferences p
    SET currency = ${currency}
    FROM users u
    WHERE u.id = p.user_id
      AND u.email = ${session.user.email}
      AND u.sign_in_type = ${signInType}
  `;

  revalidatePath('/preferences');
}
