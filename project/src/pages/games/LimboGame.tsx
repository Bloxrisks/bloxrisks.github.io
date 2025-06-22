import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { playLimbo } from '../../lib/gameLogic/limbo'
import { generateSeed, saveGameResult } from '../../lib/games'
import { updateBalance } from '../../lib/auth'
import { ArrowLeft, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

const LimboGame: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [betAmount, setBetAmount] = useState(10)
  const [targetMultiplier, setTargetMultiplier] = useState(2.0)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const playGame = async () => {
    if (!user || betAmount > user.balance) return

    setLoading(true)
    try {
      const seed = generateSeed()
      const result = playLimbo(betAmount, targetMultiplier, seed)
      
      setLastResult(result)
      
      // Update balance
      const newBalance = user.balance - betAmount + result.payout
      await updateBalance(user.id, newBalance)
      await refreshUser()
      
      // Save game result
      await saveGameResult(
        user.id,
        'limbo',
        betAmount,
        result.payout,
        result,
        seed
      )
    } catch (error) {
      console.error('Error playing limbo:', error)
    } finally {
      setLoading(false)
    }
  }

  const winChance = (1 / targetMultiplier) * 100
  const potentialPayout = betAmount * targetMultiplier * 0.99

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
          <h1 className="text-3xl font-bold text-white">🚀 Limbo</h1>
          <p className="text-gray-400">Reach for the stars</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Area */}
        <div className="space-y-6">
          {/* Rocket Display */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-700/50 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/5 to-transparent"></div>
            <div className="relative z-10">
              <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              {lastResult ? (
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-white">
                    {lastResult.actualMultiplier.toFixed(2)}x
                  </div>
                  <div className={`text-lg font-semibold ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.won ? '🎉 Rocket Reached Target!' : '💥 Rocket Crashed!'}
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Target</p>
                        <p className="text-white font-semibold">{lastResult.targetMultiplier.toFixed(2)}x</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Actual</p>
                        <p className="text-white font-semibold">{lastResult.actualMultiplier.toFixed(2)}x</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-gray-400">Ready to Launch</div>
                  <p className="text-gray-500">Set your target and launch the rocket!</p>
                </div>
              )}
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className={`bg-gradient-to-r p-6 rounded-2xl border ${
              lastResult.won 
                ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' 
                : 'from-red-500/20 to-pink-500/20 border-red-500/30'
            }`}>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Payout</p>
                <p className={`text-3xl font-bold ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                  R$ {lastResult.payout.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Bet Settings */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Launch Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bet Amount (Robux)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min="1"
                  max={user?.balance || 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Target Multiplier ({targetMultiplier.toFixed(2)}x)
                </label>
                <input
                  type="range"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(Number(e.target.value))}
                  min="1.01"
                  max="100"
                  step="0.01"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1.01x</span>
                  <span>100x</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Manual Input</label>
                <input
                  type="number"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(Number(e.target.value))}
                  min="1.01"
                  max="1000"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Mission Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Win Chance:</span>
                <span className="text-purple-400 font-semibold">{winChance.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Multiplier:</span>
                <span className="text-blue-400 font-semibold">{targetMultiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Payout:</span>
                <span className="text-green-400 font-semibold">
                  R$ {potentialPayout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={playGame}
            disabled={loading || !user || betAmount > user.balance || betAmount < 1}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-lg transition-all text-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Launching...' : '🚀 Launch Rocket'}
          </button>

          {/* Quick Multipliers */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-3">Quick Select</h4>
            <div className="grid grid-cols-4 gap-2">
              {[1.5, 2.0, 5.0, 10.0].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setTargetMultiplier(mult)}
                  className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                    targetMultiplier === mult
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>
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

export default LimboGame