import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
      });
    }

    // Get session to identify user
    const session = await getServerSession(authOptions);
    let userId = null;

    if (session?.user?.email) {
      const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [session.user.email]);
      if (users.length > 0) {
        userId = users[0].id;
      }
    }

    // Generate unique slug
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(url + Date.now(), salt);
    const slug = hash.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);

    // Check for slug collision
    const [existing] = await pool.query("SELECT * FROM link WHERE slug = ?", [slug]);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: "Slug collision, retry." }), {
        status: 500,
      });
    }

    // Insert new link with user_id (or NULL if not logged in)
    await pool.query(
      "INSERT INTO link (user_id, slug, originalUrl) VALUES (?, ?, ?)",
      [userId, slug, url]
    );

    return new Response(
      JSON.stringify({ shortUrl: `${process.env.BASE_URL}/r/${slug}` }),
      { status: 201 }
    );
  } catch (err) {
    console.error("MySQL POST error:", err.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
