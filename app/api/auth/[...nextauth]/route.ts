import NextAuth from "next-auth";
import StravaProvider from "next-auth/providers/strava";

const handler = NextAuth({
  // Paksa menggunakan sesi berbasis Cookie (JWT)
  session: {
    strategy: "jwt",
  },
  // @ts-ignore
  httpOptions: {
    timeout: 10000,
  },
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read,activity:read_all",
        },
      },
    }),
  ],
  callbacks: {
    // 1. Saat login berhasil, simpan token ke dalam Cookie JWT
    async jwt({ token, account }) {
      if (account) {
        console.log("✅ [JWT Callback] Token baru diterima dari Strava!"); // Cek Terminal
        token.accessToken = account.access_token;
        token.id = account.providerAccountId;
      }
      return token;
    },
    // 2. Saat frontend minta data, ambil token dari Cookie JWT -> Masukkan ke Session
    async session({ session, token }: any) {
      console.log("🔄 [Session Callback] Memindahkan token ke Session..."); // Cek Terminal
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      return session;
    },
  },
  // Tambahan rahasia biar enkripsi aman
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
