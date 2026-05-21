'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function AuthButton() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />}
        <span className="text-xs hidden sm:inline">{session.user.name}</span>
        <button onClick={() => signOut()} className="text-xs text-gray-400 hover:text-red-500 transition">Exit</button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn('github')} className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      Sign In
    </button>
  )
}
