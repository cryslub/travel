import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email;
      if (!email) return false;
      const signInType = account?.provider === 'google' ? 'Google' : account?.provider ?? 'Unknown';

      const existing = await sql`
        SELECT id FROM users WHERE sign_in_type = ${signInType} AND email = ${email} LIMIT 1
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO users (sign_in_type, email) VALUES (${signInType}, ${email})
        `;
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.sign_in_type = account.provider === 'google' ? 'Google' : account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.sign_in_type = token.sign_in_type;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
