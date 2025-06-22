import { supabase } from './supabase'

export interface GameResult {
  id: string
  gameType: string
  betAmount: number
  payout: number
  result: any
  seed: string
  createdAt: string
}

export const generateSeed = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const seedRandom = (seed: string, nonce: number = 0): number => {
  // Simple seeded random number generator for provably fair games
  let hash = 0
  const str = seed + nonce.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647
}

export const saveGameResult = async (
  userId: string,
  gameType: string,
  betAmount: number,
  payout: number,
  result: any,
  seed: string
) => {
  const { error } = await supabase
    .from('games')
    .insert([
      {
        user_id: userId,
        game_type: gameType,
        bet_amount: betAmount,
        payout,
        result,
        seed,
      }
    ])
  
  if (error) throw error
}

export const getGameHistory = async (userId: string, limit: number = 10): Promise<GameResult[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  
  return data.map(game => ({
    id: game.id,
    gameType: game.game_type,
    betAmount: game.bet_amount,
    payout: game.payout,
    result: game.result,
    seed: game.seed,
    createdAt: game.created_at,
  }))
}