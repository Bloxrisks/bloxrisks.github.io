import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getGameHistory, GameResult } from '../lib/games'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGameHistory = async () => {
      if (user) {
        try {
          const history = await getGameHistory(user.id, 5)
          setGameHistory(history)
        } catch (error) {
          console.error('Error loading game history:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadGameHistory()
  }, [user])

  const gameIcons = {
    mines: '💣',
    dice: '🎲',
    blackjack: '🃏',
    limbo: '🚀',
  }

  const totalWagered = gameHistory.reduce((sum, game) => sum + game.betAmount, 0)
  const totalPayout = gameHistory.reduce((sum, game) => sum + game.payout, 0)
  const netProfit = totalPayout - totalWagered

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.email}!
        </h1>
        <p className="text-gray-400">Ready to test your luck today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Balance</p>
              <p className="text-2xl font-bold text-white">R$ {user?.balance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Wagered</p>
              <p className="text-2xl font-bold text-white">R$ {totalWagered.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {netProfit.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {netProfit >= 0 ? 
                <TrendingUp className="w-6 h-6 text-green-400" /> : 
                <TrendingDown className="w-6 h-6 text-red-400" />
              }
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Games Played</p>
              <p className="text-2xl font-bold text-white">{gameHistory.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Selection */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Quick Play</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/games/mines"
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg p-4 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💣</div>
                <h3 className="font-semibold text-white">Mines</h3>
                <p className="text-sm text-gray-400">Risk vs Reward</p>
              </div>
            </Link>

            <Link
              to="/games/dice"
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-lg p-4 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎲</div>
                <h3 className="font-semibold text-white">Dice</h3>
                <p className="text-sm text-gray-400">Roll to Win</p>
              </div>
            </Link>

            <Link
              to="/games/blackjack"
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-lg p-4 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🃏</div>
                <h3 className="font-semibold text-white">Blackjack</h3>
                <p className="text-sm text-gray-400">Beat the Dealer</p>
              </div>
            </Link>

            <Link
              to="/games/limbo"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg p-4 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-semibold text-white">Limbo</h3>
                <p className="text-sm text-gray-400">Sky High Wins</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Games */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Games</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : gameHistory.length > 0 ? (
            <div className="space-y-3">
              {gameHistory.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{gameIcons[game.gameType as keyof typeof gameIcons]}</span>
                    <div>
                      <p className="font-medium text-white capitalize">{game.gameType}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(game.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">R$ {game.betAmount.toLocaleString()}</p>
                    <p className={`text-sm ${game.payout > game.betAmount ? 'text-green-400' : 'text-red-400'}`}>
                      {game.payout > game.betAmount ? '+' : ''}{(game.payout - game.betAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No games played yet</p>
              <Link
                to="/games"
                className="inline-block mt-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                Start Playing →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard