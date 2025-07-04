import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { slug, originalUrl, maxCount, validity } = await req.json();

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  try {
    // Get user ID
    const [userRows] = await pool.query("SELECT id FROM users WHERE email = ?", [session.user.email]);
    if (!userRows.length) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const userId = userRows[0].id;

    // Build dynamic SET clause based on provided fields
    const fields = [];
    const values = [];

    if (originalUrl) {
      fields.push("originalUrl = ?");
      values.push(originalUrl);
    }

    if (maxCount !== undefined) {
      fields.push("maxCount = ?");
      values.push(maxCount);
    }


    let formattedDate = null;

    if (validity) {
      const date = new Date(validity); // Comes from frontend (IST already)

      if (!isNaN(date.getTime())) {
        // Convert to IST (Asia/Kolkata) and format to MySQL DATETIME
        const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

        const yyyy = istDate.getFullYear();
        const mm = String(istDate.getMonth() + 1).padStart(2, "0");
        const dd = String(istDate.getDate()).padStart(2, "0");
        const hh = String(istDate.getHours()).padStart(2, "0");
        const mi = String(istDate.getMinutes()).padStart(2, "0");
        const ss = "00";

        formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`; // MySQL DATETIME format
        fields.push("validity = ?");
        values.push(formattedDate);
      }
    }

    if (fields.length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), { status: 400 });
    }

    values.push(slug, userId);

    const [result] = await pool.query(
      `UPDATE link SET ${fields.join(", ")} WHERE slug = ? AND user_id = ?`,
      values
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
