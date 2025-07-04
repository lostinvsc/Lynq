import pool from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const { slug } = await params;

  if (!slug) {
    return redirect("/not-found");
  }

  // Fetch originalUrl + validity + maxCount from DB
  const [rows] = await pool.query(
    "SELECT originalUrl, validity, maxCount FROM link WHERE slug = ?",
    [slug]
  );

  if (rows.length === 0) {
    return redirect("/not-found");
  }

  const { originalUrl, validity, maxCount } = rows[0];

  // Check validity
  const now = new Date();
  if (validity && new Date(validity) <= now) {
    return redirect("/not-found"); // expired
  }

  // Check maxCount
  if (maxCount !== null && maxCount <= 0) {
    return redirect("/not-found"); // limit reached
  }

  // Decrement count if used
  if (maxCount !== null) {
    await pool.query(
      "UPDATE link SET maxCount = maxCount - 1 WHERE slug = ?",
      [slug]
    );
  }

  // Redirect
  return redirect(originalUrl);
}
