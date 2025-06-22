import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          balance?: number
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          user_id: string
          game_type: string
          bet_amount: number
          payout: number
          result: any
          seed: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          bet_amount: number
          payout: number
          result: any
          seed: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          bet_amount?: number
          payout?: number
          result?: any
          seed?: string
        }
      }
    }
  }
}