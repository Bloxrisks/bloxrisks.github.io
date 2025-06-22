import { seedRandom } from '../games'

export interface LimboGameResult {
  actualMultiplier: number
  targetMultiplier: number
  won: boolean
  payout: number
}

export const playLimbo = (
  betAmount: number,
  targetMultiplier: number,
  seed: string
): LimboGameResult => {
  // Generate actual multiplier using exponential distribution for realistic crash game feel
  const random = seedRandom(seed)
  const actualMultiplier = Math.max(1, Math.pow(1 / (1 - random), 0.5))
  
  const won = actualMultiplier >= targetMultiplier
  const payout = won ? betAmount * targetMultiplier * 0.99 : 0 // 1% house edge
  
  return {
    actualMultiplier: Number(actualMultiplier.toFixed(2)),
    targetMultiplier,
    won,
    payout: Number(payout.toFixed(2)),
  }
}