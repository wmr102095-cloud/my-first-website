import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (authId, retry = 0) => {
    const { data } = await supabase
      .from('sns_users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (!data && retry < 3) {
      // 트리거가 아직 실행 중일 수 있으므로 최대 3회 재시도
      setTimeout(() => fetchProfile(authId, retry + 1), 600)
      return
    }
    setProfile(data || null)
    setLoading(false)
  }

  const refreshProfile = () => {
    if (session) fetchProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
