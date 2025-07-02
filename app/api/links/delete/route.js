import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { slug } = await req.json();
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  try {
    const [userRows] = await pool.query("SELECT id FROM users WHERE email = ?", [session.user.email]);
    if (!userRows.length) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const userId = userRows[0].id;

    const [result] = await pool.query(
      "DELETE FROM link WHERE slug = ? AND user_id = ?",
      [slug, userId]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Link not found or unauthorized" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Link deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error("Delete error:", err.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
