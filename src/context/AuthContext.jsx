import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabase.js'

const AuthContext = createContext()

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

  const value = useMemo(
    () => ({ session, loading, error, isOnline, signIn, signOut }),
    [session, loading, error, isOnline]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
