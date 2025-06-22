import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createMinesGame, placeMines, revealTile, calculateMinesPayout, MinesGameState } from '../../lib/gameLogic/mines'
import { generateSeed, saveGameResult } from '../../lib/games'
import { updateBalance } from '../../lib/auth'
import { ArrowLeft, Bomb, Gem, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

const MinesGame: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [gameState, setGameState] = useState<MinesGameState>(createMinesGame())
  const [betAmount, setBetAmount] = useState(10)
  const [mines, setMines] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentSeed, setCurrentSeed] = useState('')
  const [loading, setLoading] = useState(false)

  const startGame = async () => {
    if (!user || betAmount > user.balance) return

    setLoading(true)
    try {
      const seed = generateSeed()
      setCurrentSeed(seed)
      
      let newGame = createMinesGame(mines)
      newGame = placeMines(newGame, seed)
      
      setGameState(newGame)
      setGameStarted(true)
      
      // Deduct bet amount
      await updateBalance(user.id, user.balance - betAmount)
      await refreshUser()
    } catch (error) {
      console.error('Error starting game:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTileClick = async (index: number) => {
    if (!gameStarted || gameState.gameOver || gameState.revealed[index]) return

    const newGameState = revealTile(gameState, index)
    setGameState(newGameState)

    if (newGameState.gameOver) {
      const payout = newGameState.won ? calculateMinesPayout(betAmount, newGameState.multiplier) : 0
      
      try {
        if (payout > 0) {
          await updateBalance(user!.id, user!.balance + payout)
          await refreshUser()
        }
        
        await saveGameResult(
          user!.id,
          'mines',
          betAmount,
          payout,
          {
            mines: newGameState.mines,
            revealedTiles: newGameState.revealed.reduce((acc, revealed, i) => revealed ? [...acc, i] : acc, [] as number[]),
            won: newGameState.won,
            multiplier: newGameState.multiplier,
          },
          currentSeed
        )
      } catch (error) {
        console.error('Error saving game result:', error)
      }
    }
  }

  const cashOut = async () => {
    if (!gameStarted || gameState.gameOver) return

    const payout = calculateMinesPayout(betAmount, gameState.multiplier)
    
    try {
      await updateBalance(user!.id, user!.balance + payout)
      await refreshUser()
      
      await saveGameResult(
        user!.id,
        'mines',
        betAmount,
        payout,
        {
          mines: gameState.mines,
          revealedTiles: gameState.revealed.reduce((acc, revealed, i) => revealed ? [...acc, i] : acc, [] as number[]),
          won: true,
          multiplier: gameState.multiplier,
        },
        currentSeed
      )
      
      setGameState({ ...gameState, gameOver: true, won: true })
    } catch (error) {
      console.error('Error cashing out:', error)
    }
  }

  const resetGame = () => {
    setGameState(createMinesGame(mines))
    setGameStarted(false)
    setCurrentSeed('')
  }

  const canCashOut = gameStarted && !gameState.gameOver && gameState.multiplier > 1

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
          <h1 className="text-3xl font-bold text-white">💣 Mines</h1>
          <p className="text-gray-400">Find the gems, avoid the mines</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: 25 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleTileClick(i)}
                  disabled={!gameStarted || gameState.gameOver}
                  className={`aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-2xl font-bold ${
                    gameState.revealed[i]
                      ? gameState.grid[i]
                        ? 'bg-red-500 border-red-400 text-white'
                        : 'bg-green-500 border-green-400 text-white'
                      : gameStarted
                      ? 'bg-gray-700 border-gray-600 hover:border-blue-400 hover:bg-gray-600 cursor-pointer'
                      : 'bg-gray-800 border-gray-700 cursor-not-allowed'
                  }`}
                >
                  {gameState.revealed[i] ? (
                    gameState.grid[i] ? (
                      <Bomb className="w-6 h-6" />
                    ) : (
                      <Gem className="w-6 h-6" />
                    )
                  ) : (
                    ''
                  )}
                </button>
              ))}
            </div>

            {/* Game Status */}
            {gameState.gameOver && (
              <div className={`text-center p-4 rounded-lg ${gameState.won ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <h3 className={`text-xl font-bold ${gameState.won ? 'text-green-400' : 'text-red-400'}`}>
                  {gameState.won ? '🎉 You Won!' : '💥 Game Over!'}
                </h3>
                <p className="text-gray-300 mt-2">
                  {gameState.won 
                    ? `Multiplier: ${gameState.multiplier}x | Payout: R$ ${calculateMinesPayout(betAmount, gameState.multiplier).toLocaleString()}`
                    : 'You hit a mine! Better luck next time.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
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
                  disabled={gameStarted}
                  min="1"
                  max={user?.balance || 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mines ({mines})</label>
                <input
                  type="range"
                  value={mines}
                  onChange={(e) => setMines(Number(e.target.value))}
                  disabled={gameStarted}
                  min="1"
                  max="20"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              {gameStarted && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Multiplier:</span>
                    <span className="text-blue-400 font-semibold">{gameState.multiplier}x</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Potential Payout:</span>
                    <span className="text-green-400 font-semibold">
                      R$ {calculateMinesPayout(betAmount, gameState.multiplier).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!gameStarted ? (
              <button
                onClick={startGame}
                disabled={loading || !user || betAmount > user.balance || betAmount < 1}
                className="w-full bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            ) : (
              <>
                {canCashOut && (
                  <button
                    onClick={cashOut}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                  >
                    Cash Out (R$ {calculateMinesPayout(betAmount, gameState.multiplier).toLocaleString()})
                  </button>
                )}
                
                {gameState.gameOver && (
                  <button
                    onClick={resetGame}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                )}
              </>
            )}
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

export default MinesGame