import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  startBlackjackGame, 
  hit, 
  stand, 
  calculateHandValue, 
  calculateBlackjackPayout,
  BlackjackGameState,
  Card
} from '../../lib/gameLogic/blackjack'
import { generateSeed, saveGameResult } from '../../lib/games'
import { updateBalance } from '../../lib/auth'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

const BlackjackGame: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [currentSeed, setCurrentSeed] = useState('')

  const startGame = async () => {
    if (!user || betAmount > user.balance) return

    setLoading(true)
    try {
      const seed = generateSeed()
      setCurrentSeed(seed)
      
      const newGame = startBlackjackGame(seed)
      setGameState(newGame)
      
      // Deduct bet amount
      await updateBalance(user.id, user.balance - betAmount)
      await refreshUser()
    } catch (error) {
      console.error('Error starting blackjack game:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHit = () => {
    if (!gameState) return
    const newGameState = hit(gameState)
    setGameState(newGameState)
    
    if (newGameState.gameOver) {
      handleGameEnd(newGameState)
    }
  }

  const handleStand = () => {
    if (!gameState) return
    const newGameState = stand(gameState)
    setGameState(newGameState)
    handleGameEnd(newGameState)
  }

  const handleGameEnd = async (finalGameState: BlackjackGameState) => {
    if (!user) return

    const payout = calculateBlackjackPayout(betAmount, finalGameState.result)
    
    try {
      if (payout > 0) {
        await updateBalance(user.id, user.balance + payout)
        await refreshUser()
      }
      
      await saveGameResult(
        user.id,
        'blackjack',
        betAmount,
        payout,
        {
          playerHand: finalGameState.playerHand,
          dealerHand: finalGameState.dealerHand,
          result: finalGameState.result,
          playerValue: calculateHandValue(finalGameState.playerHand),
          dealerValue: calculateHandValue(finalGameState.dealerHand),
        },
        currentSeed
      )
    } catch (error) {
      console.error('Error saving blackjack result:', error)
    }
  }

  const resetGame = () => {
    setGameState(null)
    setCurrentSeed('')
  }

  const renderCard = (card: Card, hidden = false) => (
    <div className="bg-white rounded-lg p-3 shadow-lg min-w-[60px] text-center border">
      {hidden ? (
        <div className="text-2xl">🂠</div>
      ) : (
        <div>
          <div className={`text-2xl ${['♥', '♦'].includes(card.suit) ? 'text-red-500' : 'text-black'}`}>
            {card.suit}
          </div>
          <div className="text-lg font-bold text-black">{card.rank}</div>
        </div>
      )}
    </div>
  )

  const playerValue = gameState ? calculateHandValue(gameState.playerHand) : 0
  const dealerValue = gameState ? calculateHandValue(gameState.dealerHand) : 0
  const showDealerCards = gameState?.playerStands || gameState?.gameOver

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/games"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Games</span>
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">🃏 Blackjack</h1>
          <p className="text-gray-400">Get as close to 21 as possible</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Table */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-xl rounded-2xl p-8 border border-green-700/50">
            {gameState ? (
              <div className="space-y-8">
                {/* Dealer's Hand */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Dealer's Hand {showDealerCards && `(${dealerValue})`}
                  </h3>
                  <div className="flex justify-center space-x-2 mb-4">
                    {gameState.dealerHand.map((card, i) => (
                      <div key={i}>
                        {renderCard(card, i === 1 && !showDealerCards)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player's Hand */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Your Hand ({playerValue})
                  </h3>
                  <div className="flex justify-center space-x-2 mb-4">
                    {gameState.playerHand.map((card, i) => (
                      <div key={i}>
                        {renderCard(card)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Result */}
                {gameState.gameOver && (
                  <div className={`text-center p-6 rounded-lg ${
                    gameState.result === 'win' 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : gameState.result === 'push'
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <h3 className={`text-2xl font-bold ${
                      gameState.result === 'win' 
                        ? 'text-green-400' 
                        : gameState.result === 'push'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {gameState.result === 'win' && '🎉 You Win!'}
                      {gameState.result === 'push' && '🤝 Push!'}
                      {gameState.result === 'lose' && '😔 You Lose!'}
                    </h3>
                    <p className="text-gray-300 mt-2">
                      Dealer: {dealerValue} | You: {playerValue}
                    </p>
                    <p className="text-gray-300">
                      Payout: R$ {calculateBlackjackPayout(betAmount, gameState.result).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🃏</div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Play Blackjack?</h3>
                <p className="text-gray-400">Place your bet to start the game</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Bet Controls */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Game Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bet Amount (Robux)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={!!gameState}
                  min="1"
                  max={user?.balance || 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!gameState ? (
              <button
                onClick={startGame}
                disabled={loading || !user || betAmount > user.balance || betAmount < 1}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                {loading ? 'Dealing...' : 'Deal Cards'}
              </button>
            ) : !gameState.gameOver && !gameState.playerStands ? (
              <>
                <button
                  onClick={handleHit}
                  disabled={playerValue >= 21}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  Hit
                </button>
                <button
                  onClick={handleStand}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  Stand
                </button>
              </>
            ) : (
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            )}
          </div>

          {/* Game Rules */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-2">Basic Rules</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Get as close to 21 as possible</li>
              <li>• Don't go over 21 (bust)</li>
              <li>• Aces count as 1 or 11</li>
              <li>• Face cards count as 10</li>
              <li>• Dealer stands on 17</li>
            </ul>
          </div>

          {/* Balance */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Balance:</span>
              <span className="text-white font-semibold">R$ {user?.balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlackjackGame