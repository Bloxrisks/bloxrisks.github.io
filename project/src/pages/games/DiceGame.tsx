import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { playDice } from '../../lib/gameLogic/dice'
import { generateSeed, saveGameResult } from '../../lib/games'
import { updateBalance } from '../../lib/auth'
import { ArrowLeft, Dice1, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const DiceGame: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [betAmount, setBetAmount] = useState(10)
  const [target, setTarget] = useState(50)
  const [isOver, setIsOver] = useState(true)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const winChance = isOver ? (100 - target) : target
  const multiplier = winChance > 0 ? (99 / winChance) : 0

  const playGame = async () => {
    if (!user || betAmount > user.balance) return

    setLoading(true)
    try {
      const seed = generateSeed()
      const result = playDice(betAmount, target, isOver, seed)
      
      setLastResult(result)
      
      // Update balance
      const newBalance = user.balance - betAmount + result.payout
      await updateBalance(user.id, newBalance)
      await refreshUser()
      
      // Save game result
      await saveGameResult(
        user.id,
        'dice',
        betAmount,
        result.payout,
        result,
        seed
      )
    } catch (error) {
      console.error('Error playing dice:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-white">🎲 Dice</h1>
          <p className="text-gray-400">Roll over or under to win</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Area */}
        <div className="space-y-6">
          {/* Dice Display */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 text-center">
            <div className="mb-6">
              <Dice1 className="w-20 h-20 text-blue-400 mx-auto mb-4" />
              {lastResult ? (
                <div className="space-y-2">
                  <h3 className="text-4xl font-bold text-white">{lastResult.roll.toFixed(2)}</h3>
                  <p className={`text-lg font-semibold ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.won ? '🎉 You Won!' : '😔 You Lost'}
                  </p>
                  <p className="text-gray-400">
                    Target: {lastResult.isOver ? 'Over' : 'Under'} {lastResult.target}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-400">Ready to Roll</h3>
                  <p className="text-gray-500">Place your bet and roll the dice!</p>
                </div>
              )}
            </div>
          </div>

          {/* Last Result Details */}
          {lastResult && (
            <div className={`bg-gradient-to-r p-6 rounded-2xl border ${
              lastResult.won 
                ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' 
                : 'from-red-500/20 to-pink-500/20 border-red-500/30'
            }`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Multiplier</p>
                  <p className="text-xl font-bold text-white">{lastResult.multiplier.toFixed(2)}x</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payout</p>
                  <p className={`text-xl font-bold ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {lastResult.payout.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Bet Settings */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Bet Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bet Amount (Robux)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min="1"
                  max={user?.balance || 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Roll {isOver ? 'Over' : 'Under'} {target}
                </label>
                <div className="flex space-x-2 mb-2">
                  <button
                    onClick={() => setIsOver(true)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                      isOver 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Over</span>
                  </button>
                  <button
                    onClick={() => setIsOver(false)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                      !isOver 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Under</span>
                  </button>
                </div>
                <input
                  type="range"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  min={isOver ? "2" : "1"}
                  max={isOver ? "98" : "99"}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{isOver ? "2" : "1"}</span>
                  <span>{isOver ? "98" : "99"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Game Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Win Chance:</span>
                <span className="text-blue-400 font-semibold">{winChance.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Multiplier:</span>
                <span className="text-green-400 font-semibold">{multiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Payout:</span>
                <span className="text-green-400 font-semibold">
                  R$ {(betAmount * multiplier * 0.99).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Roll Button */}
          <button
            onClick={playGame}
            disabled={loading || !user || betAmount > user.balance || betAmount < 1}
            className="w-full bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-lg transition-all text-lg"
          >
            {loading ? 'Rolling...' : 'Roll Dice'}
          </button>

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

export default DiceGame