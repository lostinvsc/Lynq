'use client';
import { useState } from 'react';
import axios from 'axios';
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
export default function ShortenPage() {
    const [url, setUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');

    const placeholders = [
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "https://docs.python.org/3/tutorial/index.html",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    ];

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    const handleChange = (e) => {
        setUrl(e.target.value)
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            new URL(url);
        } catch {
            alert("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        try {
            const res = await axios.post('/api/shorten', { url });
            setShortUrl(res.data.shortUrl);
        } catch (err) {
            console.error(err);
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    };


    return (
        <BackgroundBeamsWithCollision>
            <div className="h-[40rem] flex flex-col justify-center  items-center px-4">
                <h2
                    className="mb-10 sm:mb-15 text-xl text-center sm:text-5xl dark:text-white text-black w-screen">
                    Short any URL
                </h2>
                <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} value={url} />

                {shortUrl && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <p className="text-green-600">

                            <a href={shortUrl} target="_blank" className="underline">
                                {shortUrl}
                            </a>
                        </p>

                        <button
                            onClick={handleCopy}
                            className="px-4 py-1 rounded-2xl bg-black text-white border transition cursor-pointer"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>

                    </div>
                )}
            </div>
        </BackgroundBeamsWithCollision>
    );
}
