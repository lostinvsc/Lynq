'use client';
import { useState } from 'react';
import axios from 'axios';

export default function ShortenPage() {
  const [url, setUrl] = useState('');
//   const [maxClicks, setMaxClicks] = useState(10);
//   const [expiryDate, setExpiryDate] = useState('');
  const [shortUrl, setShortUrl] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/shorten', {
        url,
      });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      alert('Error: ' + err.response?.data || err.message);
    }
  };


  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shorten a URL</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="url"
          required
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border rounded p-2"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Shorten
        </button>
      </form>
      {shortUrl && (
        <div className="mt-4">
          <p className="text-green-600">Short URL: <a href={shortUrl} className="underline">{shortUrl}</a></p>
        </div>
      )}
    </div>
  );
}