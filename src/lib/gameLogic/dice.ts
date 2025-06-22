import { seedRandom } from '../games'

export interface DiceGameResult {
  roll: number
  target: number
  isOver: boolean
  won: boolean
  multiplier: number
  payout: number
}

export const playDice = (
  betAmount: number,
  target: number,
  isOver: boolean,
  seed: string
): DiceGameResult => {
  const roll = seedRandom(seed) * 100
  
  let won = false
  if (isOver) {
    won = roll > target
  } else {
    won = roll < target
  }
  
  const winChance = isOver ? (100 - target) / 100 : target / 100
  const multiplier = won ? (0.99 / winChance) : 0 // 1% house edge
  const payout = won ? betAmount * multiplier : 0
  
  return {
    roll: Number(roll.toFixed(2)),
    target,
    isOver,
    won,
    multiplier: Number(multiplier.toFixed(2)),
    payout: Number(payout.toFixed(2)),
  }
}