'use client';
import { useState } from 'react';
import axios from 'axios';
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import AuthStatus from '@/components/AuthStatus';
import MyLinks from '@/components/MyLinks';
export default function ShortenPage() {
    const [url, setUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');

    const placeholders = [
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "https://docs.python.org/3/tutorial/index.html",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    ];

    const [copied, setCopied] = useState(false);
    const [date, setDate] = useState('');
    const [maxCount, setMaxCount] = useState('');

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

        // Validate URL
        try {
            new URL(url);
        } catch {
            alert("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        // Validate maxCount
        const parsedMaxCount = maxCount === '' ? null : parseInt(maxCount);
        if (parsedMaxCount !== null && parsedMaxCount <= 0) {
            alert("Max count must be greater than 0 or empty.");
            return;
        }

        // Validate date
        const now = new Date();
        const parsedDate = date === '' ? null : new Date(date);
        if (parsedDate !== null && parsedDate <= now) {
            alert("Please select a future date or leave it empty.");
            return;
        }

        try {
            const res = await axios.post('/api/shorten', {
                url,
                maxCount: parsedMaxCount,
                expiresAt: parsedDate ? parsedDate.toISOString() : null
            });
            setShortUrl(res.data.shortUrl);

        } catch (err) {
            console.error(err);
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    };


    return (
        <BackgroundBeamsWithCollision>
            <div className="h-fit flex flex-col justify-center  items-center px-4">
                <AuthStatus />
                <div className=' w-screen'>
                    <h2
                        className=" mb-5 sm:mb-10 text-xl text-center sm:text-5xl dark:text-white text-black w-full">
                        Short any URL
                    </h2>
                    <div className='flex items-centre w-fit mx-auto gap-10 justify-center flex-wrap'>
                        <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} value={url} />
                        <input className='bg-[#27272A]  text-white rounded-full pl-2 w-[200px] py-1' type="datetime-local" value={date}
                            onChange={(e) => setDate(e.target.value)} alt='date validity'/>
                        <input placeholder='Max Clicks' type="number" className=' text-white bg-[#27272A] rounded-full w-[110px] pl-3.5' value={maxCount}
                            onChange={(e) => setMaxCount(e.target.value)} alt='count' />
                    </div>

                {shortUrl && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <p className="text-white">

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
            </div>
                <MyLinks />
        </BackgroundBeamsWithCollision>
    );
}
