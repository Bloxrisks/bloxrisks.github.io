import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  balance: number
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth`
    }
  })
  
  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  if (!profile) return null
  
  return {
    id: profile.id,
    email: profile.email,
    balance: profile.balance,
  }
}

export const updateBalance = async (userId: string, newBalance: number) => {
  const { error } = await supabase
    .from('profiles')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId)
  
  if (error) throw error
}