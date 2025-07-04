// app/api/links/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const email = session.user.email;

  try {
    // 1. Get user ID
    const [userRows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) {
      return new Response(JSON.stringify([]));
    }

    const userId = userRows[0].id;

    // 2. Fetch links for that user
    const [links] = await pool.query(
      "SELECT slug, originalUrl,maxCount,validity FROM link WHERE user_id = ?",
      [userId]
    );

    return new Response(JSON.stringify(links), { status: 200 });
  } catch (err) {
    console.error("DB error:", err.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
