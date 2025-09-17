'use client'

import { SessionProvider } from 'next-auth/react'

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: SessionProviderProps) {
  return (
    <SessionProvider 
      session={null}
      refetchInterval={30 * 60} // Refetch every 30 minutes
      refetchOnWindowFocus={true}
      refetchOnReconnect={true}
    >
      {children}
    </SessionProvider>
  )
}