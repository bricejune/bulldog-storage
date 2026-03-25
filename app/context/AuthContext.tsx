'use client'

// TODO: Replace with Supabase Auth before launch

import { createContext, useContext, useEffect, useState } from 'react'

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

type User = {
  id: string
  name: string
  email: string
  createdAt: string
}

type StoredUser = User & {
  passwordHash: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const USERS_KEY = 'BULLDOG_USERS'
const SESSION_KEY = 'BULLDOG_SESSION'

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return []
  }
}

function saveStoredUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY)
      if (sessionId) {
        const users = getStoredUsers()
        const found = users.find((u) => u.id === sessionId)
        if (found) {
          const { passwordHash: _pw, ...userWithoutHash } = found
          void _pw
          setUser(userWithoutHash)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = getStoredUsers()
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!found) {
      return { success: false, error: 'No account found with that email.' }
    }
    if (found.passwordHash !== btoa(password)) {
      return { success: false, error: 'Incorrect password.' }
    }
    localStorage.setItem(SESSION_KEY, found.id)
    const { passwordHash: _pw, ...userWithoutHash } = found
    void _pw
    setUser(userWithoutHash)
    return { success: true }
  }

  const signup = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const users = getStoredUsers()
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return { success: false, error: 'An account with that email already exists.' }
    }
    const newUser: StoredUser = {
      id: uuidv4(),
      name,
      email,
      passwordHash: btoa(password),
      createdAt: new Date().toISOString(),
    }
    const updatedUsers = [...users, newUser]
    saveStoredUsers(updatedUsers)
    localStorage.setItem(SESSION_KEY, newUser.id)
    const { passwordHash: _pw, ...userWithoutHash } = newUser
    void _pw
    setUser(userWithoutHash)
    return { success: true }
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
