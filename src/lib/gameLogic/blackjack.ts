import { seedRandom } from '../games'

export interface Card {
  suit: string
  rank: string
  value: number
}

export interface BlackjackGameState {
  playerHand: Card[]
  dealerHand: Card[]
  deck: Card[]
  gameOver: boolean
  playerStands: boolean
  result: 'win' | 'lose' | 'push' | null
}

const suits = ['♠', '♥', '♦', '♣']
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const createDeck = (): Card[] => {
  const deck: Card[] = []
  suits.forEach(suit => {
    ranks.forEach(rank => {
      let value = parseInt(rank)
      if (rank === 'A') value = 11
      if (['J', 'Q', 'K'].includes(rank)) value = 10
      
      deck.push({ suit, rank, value })
    })
  })
  return deck
}

export const shuffleDeck = (deck: Card[], seed: string): Card[] => {
  const shuffled = [...deck]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seedRandom(seed, i) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export const calculateHandValue = (hand: Card[]): number => {
  let value = 0
  let aces = 0
  
  hand.forEach(card => {
    if (card.rank === 'A') {
      aces++
      value += 11
    } else {
      value += card.value
    }
  })
  
  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  
  return value
}

export const startBlackjackGame = (seed: string): BlackjackGameState => {
  const deck = shuffleDeck(createDeck(), seed)
  const playerHand = [deck[0], deck[2]]
  const dealerHand = [deck[1], deck[3]]
  
  return {
    playerHand,
    dealerHand,
    deck: deck.slice(4),
    gameOver: false,
    playerStands: false,
    result: null,
  }
}

export const hit = (state: BlackjackGameState): BlackjackGameState => {
  if (state.gameOver || state.playerStands) return state
  
  const newCard = state.deck[0]
  const newPlayerHand = [...state.playerHand, newCard]
  const newDeck = state.deck.slice(1)
  
  const playerValue = calculateHandValue(newPlayerHand)
  const gameOver = playerValue > 21
  
  return {
    ...state,
    playerHand: newPlayerHand,
    deck: newDeck,
    gameOver,
    result: gameOver ? 'lose' : null,
  }
}

export const stand = (state: BlackjackGameState): BlackjackGameState => {
  let newState = { ...state, playerStands: true }
  let dealerHand = [...newState.dealerHand]
  let deck = [...newState.deck]
  
  // Dealer hits on 16, stands on 17
  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(deck[0])
    deck = deck.slice(1)
  }
  
  const playerValue = calculateHandValue(newState.playerHand)
  const dealerValue = calculateHandValue(dealerHand)
  
  let result: 'win' | 'lose' | 'push'
  if (dealerValue > 21 || playerValue > dealerValue) {
    result = 'win'
  } else if (playerValue === dealerValue) {
    result = 'push'
  } else {
    result = 'lose'
  }
  
  return {
    ...newState,
    dealerHand,
    deck,
    gameOver: true,
    result,
  }
}

export const calculateBlackjackPayout = (betAmount: number, result: 'win' | 'lose' | 'push' | null): number => {
  if (result === 'win') return betAmount * 2
  if (result === 'push') return betAmount
  return 0
}