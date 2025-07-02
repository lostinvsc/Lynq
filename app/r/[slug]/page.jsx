import pool from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const {slug} =await params;
  if(!slug){
    return redirect("/not-found");
  }
  // Fetch original URL from DB
  const [rows] = await pool.query(
    "SELECT originalUrl FROM link WHERE slug = ?",
    [slug]
  );

  if (rows.length === 0) {
    // If slug not found, redirect to not-found
    return redirect("/not-found");
  }

  const originalUrl = rows[0].originalUrl;
  // Redirect to the original URL
  return redirect(originalUrl);
}
