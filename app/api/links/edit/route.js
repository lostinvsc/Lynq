import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { slug, newUrl } = await req.json();
  if (!slug || !newUrl) {
    return new Response(JSON.stringify({ error: "Missing slug or new URL" }), { status: 400 });
  }

  try {
    const [userRows] = await pool.query("SELECT id FROM users WHERE email = ?", [session.user.email]);
    if (!userRows.length) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const userId = userRows[0].id;

    const [result] = await pool.query(
      "UPDATE link SET originalUrl = ? WHERE slug = ? AND user_id = ?",
      [newUrl, slug, userId]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Link not found or unauthorized" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Link updated successfully" }), { status: 200 });
  } catch (err) {
    console.error("Edit error:", err.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
