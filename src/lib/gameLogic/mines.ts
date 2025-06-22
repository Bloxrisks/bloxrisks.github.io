import { seedRandom, generateSeed } from '../games'

export interface MinesGameState {
  grid: boolean[]
  revealed: boolean[]
  gameOver: boolean
  won: boolean
  mines: number
  multiplier: number
}

export const createMinesGame = (mines: number = 3): MinesGameState => {
  const grid = Array(25).fill(false)
  const revealed = Array(25).fill(false)
  
  return {
    grid,
    revealed,
    gameOver: false,
    won: false,
    mines,
    multiplier: 1,
  }
}

export const placeMines = (state: MinesGameState, seed: string): MinesGameState => {
  const newGrid = Array(25).fill(false)
  const minePositions = new Set<number>()
  
  let nonce = 0
  while (minePositions.size < state.mines) {
    const random = seedRandom(seed, nonce)
    const position = Math.floor(random * 25)
    minePositions.add(position)
    nonce++
  }
  
  minePositions.forEach(pos => {
    newGrid[pos] = true
  })
  
  return { ...state, grid: newGrid }
}

export const revealTile = (state: MinesGameState, index: number): MinesGameState => {
  if (state.revealed[index] || state.gameOver) return state
  
  const newRevealed = [...state.revealed]
  newRevealed[index] = true
  
  if (state.grid[index]) {
    // Hit a mine
    return {
      ...state,
      revealed: newRevealed,
      gameOver: true,
      won: false,
    }
  }
  
  // Safe tile
  const revealedSafeTiles = newRevealed.filter((revealed, i) => revealed && !state.grid[i]).length
  const totalSafeTiles = 25 - state.mines
  const multiplier = calculateMinesMultiplier(revealedSafeTiles, state.mines)
  
  const won = revealedSafeTiles === totalSafeTiles
  
  return {
    ...state,
    revealed: newRevealed,
    multiplier,
    gameOver: won,
    won,
  }
}

const calculateMinesMultiplier = (revealedSafeTiles: number, mines: number): number => {
  if (revealedSafeTiles === 0) return 1
  
  const totalTiles = 25
  const safeTiles = totalTiles - mines
  
  // Progressive multiplier based on risk
  let multiplier = 1
  for (let i = 1; i <= revealedSafeTiles; i++) {
    const remainingSafeTiles = safeTiles - i + 1
    const remainingTiles = totalTiles - i + 1
    multiplier *= remainingTiles / remainingSafeTiles
  }
  
  return Number(multiplier.toFixed(2))
}

export const calculateMinesPayout = (betAmount: number, multiplier: number): number => {
  return betAmount * multiplier
}