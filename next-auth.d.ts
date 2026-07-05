import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      sign_in_type?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sign_in_type?: string | null;
  }
}
