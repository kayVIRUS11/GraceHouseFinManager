import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabase.js'
import { AuthContext } from './auth-context.js'

const ADMIN_ROLES = new Set(['admin', 'owner'])
const FINANCE_ROLES = new Set(['admin', 'owner', 'bursar', 'finance'])

const getRoleFromSession = (session) => {
  const appRole = session?.user?.app_metadata?.role
  const userRole = session?.user?.user_metadata?.role
  const role = appRole || userRole
  if (typeof role === 'string' && role.trim().length > 0) {
    return role.trim().toLowerCase()
  }
  return 'viewer'
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (signInError) {
      setError(signInError.message)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }
  const role = useMemo(() => getRoleFromSession(session), [session])
  const isAdmin = ADMIN_ROLES.has(role)
  const isFinanceStaff = FINANCE_ROLES.has(role)

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      isOnline,
      role,
      isAdmin,
      isFinanceStaff,
      signIn,
      signOut
    }),
    [session, loading, error, isOnline, role, isAdmin, isFinanceStaff]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
