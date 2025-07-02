import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db";

export const authOptions = {
  providers: [
    GitHubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }),
    GoogleProvider({ clientId: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

   callbacks: {
  async signIn({ user }) {
    const { email } = user;
    console.log("signIn:", email);

    try {
      await pool.query(
        'INSERT IGNORE INTO users (email) VALUES (?)',
        [email || null]
      );
    } catch (err) {
      console.error("Forced insert failed:", err.message);
    }

    return true;
  }
}

};



const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
