'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AuthStatus() {
    const { data: session, status } = useSession();
    const [isMobile, setIsMobile] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const checkWidth = () => setIsMobile(window.innerWidth < 1150);
        checkWidth();

        window.addEventListener("resize", checkWidth);
        return () => window.removeEventListener("resize", checkWidth);
    }, []);

    //   if (status === 'loading') return <p className="fixed top-0 left-1/2">Loading...</p>;

    if (session) {
        return (
            <>
                <div className="absolute top-5 right-5 z-200">
                    {isMobile ? (
                        <button
                            className="border border-white text-white px-3 py-1 rounded-lg"
                            onClick={() => setShowPopup(prev => !prev)}
                        >
                            ☰
                        </button>

                    ) : (
                        <div className="flex gap-2 items-center">
                            <p className="border border-white px-4 py-1 rounded-2xl cursor-pointer text-white">
                                {session.user.email}
                            </p>
                            <button
                                className="border border-white px-4 py-1 rounded-2xl cursor-pointer text-white"
                                onClick={() => signOut()}
                            >
                                Sign out
                            </button>
                        </div>
                    )}
                </div>

                {showPopup && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-100">
                        <div className="bg-transparent rounded-lg p-6 text-white shadow-lg w-[90%] max-w-sm text-center">
                            <p className="text-lg mb-4">{session.user.email}</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => signOut()}
                                    className="bg-transparent px-4 py-1 cursor-pointer border border-white rounded-full"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div>
            <button
                className="fixed top-5 right-5 border border-white px-4 py-1 rounded-2xl cursor-pointer text-white"
                onClick={() => signIn()}
            >
                Sign in
            </button>
        </div>
    );
}
