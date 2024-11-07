'use client'

import { createContext, useEffect, useState } from 'react'
import { User } from '../lib/types'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/user', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.errors) {
          setUser(data.user)
        }
      })
      .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
} 