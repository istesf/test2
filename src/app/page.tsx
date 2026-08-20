'use client'

import { useEffect } from 'react'
import MessengerApp from '@/components/messenger/MessengerApp'
import { useMessengerStore } from '@/store/messenger'
import { SessionProvider } from "next-auth/react"

function MessengerContent() {
  const { setAuthenticated, setCurrentUser, setAuthModal } = useMessengerStore()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const res = await fetch('/api/users')
        if (res.ok) {
          const data = await res.json()
          setCurrentUser(data.user)
          setAuthenticated(true)
          setAuthModal(false)
        } else {
          setAuthModal(true, 'login')
        }
      } catch (error) {
        console.error('Session check error:', error)
        setAuthModal(true, 'login')
      }
    }

    checkSession()
  }, [])

  return <MessengerApp />
}

export default function Home() {
  return (
    <SessionProvider>
      <MessengerContent />
    </SessionProvider>
  )
}
