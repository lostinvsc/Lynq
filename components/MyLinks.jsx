'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MyLinks() {
  const { data: session, status } = useSession();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingLink, setEditingLink] = useState(null); // link object being edited
  const [editUrl, setEditUrl] = useState('');
  const [editMaxCount, setEditMaxCount] = useState('');
  const [editValidity, setEditValidity] = useState('');

  const formatForDateTimeLocal = (dateString) => {
  const date = new Date(dateString);

  const offsetDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const yyyy = offsetDate.getFullYear();
  const mm = String(offsetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(offsetDate.getDate()).padStart(2, "0");
  const hh = String(offsetDate.getHours()).padStart(2, "0");
  const min = String(offsetDate.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};


  const openEditModal = (link) => {
    setEditingLink(link);
    setEditUrl(link.originalUrl || '');
    setEditMaxCount(link.maxCount ?? '');
    setEditValidity(link.validity ? formatForDateTimeLocal(link.validity) : '');
  };

  const saveEdit = async () => {
    if (!editingLink) return;

    const changes = {};
    if (editUrl !== editingLink.originalUrl) {
      try {
        new URL(editUrl);
        changes.originalUrl = editUrl;
      } catch {
        alert("Invalid URL");
        return;
      }
    }

    if (
      editMaxCount !== '' &&
      (editingLink.maxCount === null || parseInt(editMaxCount) !== editingLink.maxCount)
    ) {
      const parsed = parseInt(editMaxCount);
      if (isNaN(parsed) || parsed <= 0) {
        alert("Invalid max count");
        return;
      }
      changes.maxCount = parsed;
    }

    if (
      editValidity !== '' &&
      (!editingLink.validity || new Date(editValidity).toISOString() !== new Date(editingLink.validity).toISOString())
    ) {
      const parsedDate = new Date(editValidity);
      if (parsedDate <= new Date()) {
        alert("Date must be in the future");
        return;
      }
      changes.validity = parsedDate.toISOString();
    }

    if (Object.keys(changes).length === 0) {
      alert("Nothing changed.");
      return;
    }

    try {
      await axios.patch("/api/links/edit", {
        slug: editingLink.slug,
        ...changes,
      });

      // Update local state
      setLinks(
        links.map(link =>
          link.slug === editingLink.slug
            ? { ...link, ...changes }
            : link
        )
      );

      setEditingLink(null); // Close modal
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Edit failed");
    }
  };

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

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return <p className="text-red-500">Sign in to see your history.</p>;
  }

  return (
    <div className=" w-screen overflow-y-scroll pt-3 h-[450px] bg-transparent">
      <h2 className="text-xl mx-auto w-fit font-bold mb-4 ">Your Shortened URLs</h2>
      {links.length === 0 ? (
        <p className="w-fit mx-auto text-red-700">No links found</p>
      ) : (
        <ul className="space-y-4 flex flex-wrap justify-center gap-5">
          {links.map((link, index) => (
            <li key={link.slug} className="p-3 rounded border border-gray-500 h-fit max-w-[350px] w-screen mx-2">
              <p>
                <strong>{index + 1}.</strong> <strong>Original:</strong> {link.originalUrl}
              </p>
              <p>
                <strong>Short:</strong>{" "}
                <a
                  onClick={() => { if (link.maxCount > 0) { link.maxCount-- } }}
                  href={`/r/${link.slug}`}
                  className="text-blue-600 underline"
                  target="_blank"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${link.slug}`}
                </a>
              </p>

              <p>
                Validity:{" "}
                {link.validity
                  ? new Date(link.validity).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "Unlimited"}
              </p>

              <p>
                Max Count: {link.maxCount?link.maxCount:'Unlimited'}
              </p>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => openEditModal(link)}
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

      {editingLink && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm rounded-xl">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit</h2>

            <div className="mb-4">
              <label className="block mb-1">Original URL:</label>
              <input
                className="w-full border px-3 py-1 rounded dark:bg-zinc-800"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Max Count:</label>
              <input
                className="w-full border px-3 py-1 rounded dark:bg-zinc-800"
                type="number"
                value={editMaxCount}
                onChange={(e) => setEditMaxCount(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Validity:</label>
              <input
                className="w-full border px-3 py-1 rounded dark:bg-zinc-800"
                type="datetime-local"
                value={editValidity}
                onChange={(e) => setEditValidity(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setEditingLink(null)} className="bg-gray-500 text-white px-4 py-1 rounded">
                Cancel
              </button>
              <button onClick={saveEdit} className="bg-blue-600 text-white px-4 py-1 rounded">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
