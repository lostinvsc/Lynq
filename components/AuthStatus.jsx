'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthStatus() {
    const { data: session, status } = useSession();

    if (status === 'loading') return <p className="fixed top-0 left-1/2">Loading...</p>;

    if (session) {
        return (
            <div className="fixed top-5 right-10 flex gap-2 justify-center items-center">
                <p className="border border-white px-4 py-1 rounded-2xl cursor-pointer">{session.user.email}</p>
                <button className="border border-white px-4 py-1 rounded-2xl cursor-pointer w-fit" onClick={() => signOut()}>Sign out</button>
            </div>
        );
    }

    return (
        <div>
            <button className="fixed top-5 right-10 border border-white px-4 py-1 rounded-2xl cursor-pointer" onClick={() => signIn()}>Sign in</button>
        </div>
    );
}
