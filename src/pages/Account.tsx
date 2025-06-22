import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getGameHistory, GameResult } from '../lib/games'
import { updateBalance } from '../lib/auth'
import { TrendingUp, TrendingDown, Clock, DollarSign, Plus, Minus } from 'lucide-react'

const Account: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState(100)
  const [withdrawAmount, setWithdrawAmount] = useState(50)

  useEffect(() => {
    const loadGameHistory = async () => {
      if (user) {
        try {
          const history = await getGameHistory(user.id, 50)
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

  const handleDeposit = async () => {
    if (!user || depositAmount <= 0) return
    
    try {
      await updateBalance(user.id, user.balance + depositAmount)
      await refreshUser()
      setDepositAmount(100)
    } catch (error) {
      console.error('Error depositing:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!user || withdrawAmount <= 0 || withdrawAmount > user.balance) return
    
    try {
      await updateBalance(user.id, user.balance - withdrawAmount)
      await refreshUser()
      setWithdrawAmount(50)
    } catch (error) {
      console.error('Error withdrawing:', error)
    }
  }

  const gameIcons = {
    mines: '💣',
    dice: '🎲',
    blackjack: '🃏',
    limbo: '🚀',
  }

  const totalWagered = gameHistory.reduce((sum, game) => sum + game.betAmount, 0)
  const totalPayout = gameHistory.reduce((sum, game) => sum + game.payout, 0)
  const netProfit = totalPayout - totalWagered
  const winRate = gameHistory.length > 0 ? (gameHistory.filter(game => game.payout > game.betAmount).length / gameHistory.length) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Account Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">Account Overview</h1>
        <p className="text-gray-400">Manage your Robux balance and view your gaming statistics</p>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Balance</p>
              <p className="text-2xl font-bold text-white">R$ {user?.balance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
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
              <TrendingUp className="w-6 h-6 text-blue-400" />
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
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Balance Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">💰 Deposit Robux</h3>
          <p className="text-gray-400 mb-4">Add Robux to your account to continue playing.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount to Deposit</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDepositAmount(amount)}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                >
                  R$ {amount}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleDeposit}
              disabled={depositAmount <= 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit R$ {depositAmount.toLocaleString()}</span>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              ℹ️ This is a mock deposit for demonstration purposes
            </p>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">💸 Withdraw Robux</h3>
          <p className="text-gray-400 mb-4">Withdraw your winnings to your account.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount to Withdraw</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                min="1"
                max={user?.balance || 0}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, user?.balance || 0].map((amount, index) => (
                <button
                  key={index}
                  onClick={() => setWithdrawAmount(Math.min(amount, user?.balance || 0))}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                >
                  {index === 3 ? 'All' : `R$ ${amount}`}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={withdrawAmount <= 0 || withdrawAmount > (user?.balance || 0)}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Minus className="w-4 h-4" />
              <span>Withdraw R$ {withdrawAmount.toLocaleString()}</span>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ This is a mock withdrawal for demonstration purposes
            </p>
          </div>
        </div>
      </div>

      {/* Game History */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">🎮 Game History</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700/50 h-16 rounded-lg"></div>
            ))}
          </div>
        ) : gameHistory.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {gameHistory.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{gameIcons[game.gameType as keyof typeof gameIcons]}</span>
                  <div>
                    <p className="font-medium text-white capitalize">{game.gameType}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(game.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">R$ {game.betAmount.toLocaleString()}</p>
                  <p className={`text-sm font-semibold ${game.payout > game.betAmount ? 'text-green-400' : 'text-red-400'}`}>
                    {game.payout > game.betAmount ? '+' : ''}{(game.payout - game.betAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No games played yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Account