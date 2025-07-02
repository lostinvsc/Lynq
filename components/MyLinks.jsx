'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MyLinks() {
  const { data: session, status } = useSession();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get("/api/links");
        setLinks(res.data);
      } catch (err) {
        console.error("Axios fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchLinks();
    } else {
      setLoading(false);
    }
  }, [status]);

  // Delete link
  const handleDelete = async (slug) => {
    try {
      const confirmed = confirm("Are you sure to delete?")
      if (!confirmed) return;
      const res = await axios.delete("/api/links/delete", {
        data: { slug },
      });
      console.log("Deleted:", res.data);
      setLinks(links.filter(link => link.slug !== slug));
    } catch (err) {
      console.error("Axios delete error:", err);
    }
  };

  // Edit original URL
  const handleEdit = async (slug) => {
    const newUrl = prompt("Enter new original URL:");
    if (!newUrl) return;

    const confirmed = confirm("Are you sure to update?")
    if (!confirmed) return;
    try {
      const res = await axios.patch("/api/links/edit", { slug, newUrl });
      console.log("Edited:", res.data);

      setLinks(
        links.map(link =>
          link.slug === slug ? { ...link, originalUrl: newUrl } : link
        )
      );
    } catch (err) {
      console.error("Axios edit error:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return <p className="text-red-500">Sign in to see your history.</p>;
  }

  return (
    <div className="-translate-y-28 w-screen">
      <h2 className="text-xl mx-auto w-fit font-bold mb-4 ">Your Shortened URLs</h2>
      {links.length === 0 ? (
        <p className="w-fit mx-auto text-red-700">No links found</p>
      ) : (
        <ul className="space-y-4 flex flex-wrap justify-center gap-5">
          {links.map((link, index) => (
            <li key={link.slug} className="p-3 rounded border border-gray-300 h-fit">
              <p>
                <strong>{index + 1}.</strong> <strong>Original:</strong> {link.originalUrl}
              </p>
              <p>
                <strong>Short:</strong>{" "}
                <a
                  href={`/r/${link.slug}`}
                  className="text-blue-600 underline"
                  target="_blank"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${link.slug}`}
                </a>
              </p>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => handleEdit(link.slug)}
                  className="px-3 py-1 bg-white text-black rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(link.slug)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
