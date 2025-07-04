import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { url, maxCount, expiresAt } = await req.json();

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

    let formattedDate = null;

    if (expiresAt) {
      const date = new Date(expiresAt); // Comes from frontend (IST already)

      if (!isNaN(date.getTime())) {
        // Convert to IST (Asia/Kolkata) and format to MySQL DATETIME
        const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

        const yyyy = istDate.getFullYear();
        const mm = String(istDate.getMonth() + 1).padStart(2, "0");
        const dd = String(istDate.getDate()).padStart(2, "0");
        const hh = String(istDate.getHours()).padStart(2, "0");
        const mi = String(istDate.getMinutes()).padStart(2, "0");
        const ss = "00";

        formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`; // ✅ MySQL DATETIME format
      }
    }


    // Insert new link with user_id (or NULL if not logged in)
    await pool.query(
      "INSERT INTO link (user_id, slug, originalUrl, maxCount, validity) VALUES (?, ?, ?, ?, ?)",
      [userId, slug, url, maxCount ?? null, formattedDate ?? null]
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
