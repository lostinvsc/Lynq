import { connectDB } from "@/lib/mongodb";
import Link from "@/models/Link";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { url } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
    });
  }

  await connectDB();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(url + Date.now(), salt);

  const slug = hash.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);

  const existing = await Link.findOne({ slug });
  if (existing) {
    return new Response(JSON.stringify({ error: "Slug collision, retry." }), {
      status: 500,
    });
  }

  const link = await Link.create({
    slug,
    originalUrl: url,
  });

  return new Response(JSON.stringify({ shortUrl: `${process.env.BASE_URL}/r/${slug}` }), {
    status: 201,
  });
}
