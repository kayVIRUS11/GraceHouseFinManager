import { useState } from 'react'
import { useAuth } from '../context/auth-context.js'

function AuthGate({ children }) {
  const { session, loading, error, isOnline, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] text-[#1f1b17]">
        <div className="mx-auto flex min-h-screen max-w-[720px] items-center justify-center px-6">
          <div className="rounded-3xl border border-[#e6ded4] bg-white/80 px-6 py-4 text-sm text-[#7c6f63]">
            Checking session...
          </div>
        </div>
      </div>
    )
  }

  if (!session && !isOnline) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] text-[#1f1b17]">
        <div className="mx-auto flex min-h-screen max-w-[720px] items-center justify-center px-6">
          <div className="rounded-3xl border border-[#e6ded4] bg-white/80 px-6 py-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">Offline</p>
            <h2 className="mt-2 text-xl font-semibold text-[#1f1b17]">No cached session</h2>
            <p className="mt-2 text-sm text-[#7c6f63]">
              Connect to the internet to sign in on this device.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] text-[#1f1b17]">
        <div className="mx-auto flex min-h-screen max-w-[720px] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-[#e6ded4] bg-white/90 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">Grace House</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f1b17]">Sign in</h2>
            <p className="mt-2 text-sm text-[#7c6f63]">Use your school account.</p>
            <div className="mt-4 grid gap-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3"
              />
              {error ? <p className="text-xs text-[#9a3d2a]">{error}</p> : null}
              <button
                type="button"
                onClick={() => signIn(email, password)}
                className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default AuthGate
