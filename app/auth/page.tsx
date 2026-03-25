'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider, useAuth } from '../context/AuthContext'

function AuthPageInner() {
  const { login, signup, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/book'

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)

  // Sign Up state
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirm, setSignUpConfirm] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [signUpLoading, setSignUpLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect)
    }
  }, [user, loading, redirect, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-navy animate-spin" style={{ borderTopColor: '#1B2A4A' }} />
      </div>
    )
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError('')
    setSignInLoading(true)
    const result = login(signInEmail, signInPassword)
    setSignInLoading(false)
    if (!result.success) {
      setSignInError(result.error ?? 'Sign in failed.')
    }
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError('')
    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Passwords do not match.')
      return
    }
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters.')
      return
    }
    setSignUpLoading(true)
    const result = signup(signUpName, signUpEmail, signUpPassword)
    setSignUpLoading(false)
    if (!result.success) {
      setSignUpError(result.error ?? 'Sign up failed.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>
              Bulldog <span style={{ color: '#F5A623' }}>Storage</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Yale&apos;s most careful student storage</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setTab('signin'); setSignInError(''); setSignUpError('') }}
              className="flex-1 py-4 text-sm font-semibold transition-colors"
              style={{
                color: tab === 'signin' ? '#1B2A4A' : '#9ca3af',
                borderBottom: tab === 'signin' ? '2px solid #F5A623' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setSignInError(''); setSignUpError('') }}
              className="flex-1 py-4 text-sm font-semibold transition-colors"
              style={{
                color: tab === 'signup' ? '#1B2A4A' : '#9ca3af',
                borderBottom: tab === 'signup' ? '2px solid #F5A623' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              Create Account
            </button>
          </div>

          <div className="p-8">
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="your.name@yale.edu"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{ focusRingColor: '#1B2A4A' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                {signInError && (
                  <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{signInError}</p>
                )}
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#F5A623' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d4891a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5A623' }}
                >
                  {signInLoading ? 'Signing in…' : 'Sign In'}
                </button>
                <p className="text-xs text-center text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="underline font-medium"
                    style={{ color: '#1B2A4A' }}
                  >
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="your.name@yale.edu"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                {signUpError && (
                  <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{signUpError}</p>
                )}
                <button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#F5A623' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d4891a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5A623' }}
                >
                  {signUpLoading ? 'Creating account…' : 'Create Account'}
                </button>
                <p className="text-xs text-center text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className="underline font-medium"
                    style={{ color: '#1B2A4A' }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Continue without account */}
        <p className="text-center mt-6 text-sm text-gray-500">
          <Link
            href="/book"
            className="font-medium transition-colors hover:text-navy"
            style={{ color: '#1B2A4A' }}
          >
            Continue without an account →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: '#1B2A4A' }} />
        </div>
      }>
        <AuthPageInner />
      </Suspense>
    </AuthProvider>
  )
}
