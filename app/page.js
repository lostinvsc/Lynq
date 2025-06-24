'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/shorten')
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center bg-black">
      <p className="text-white">Redirecting to /shorten...</p>
    </main>
  )
}
