import { connectDB } from "@/lib/mongodb";
import Link from "@/models/Link";
import { redirect } from "next/navigation";

export default async function Page({ params }) {
  await connectDB();

  const link = await Link.findOne({ slug:params.slug });

  if (!link) {
    return redirect("/not-found");
  }

  return redirect(link.originalUrl);
}
