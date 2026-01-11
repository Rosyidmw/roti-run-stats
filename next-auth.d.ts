import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Di sini kita update tipe data Session
   * Kita tambahkan accessToken dan user id
   */
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}
