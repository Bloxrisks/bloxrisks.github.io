import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Target, Brain, TrendingUp } from 'lucide-react'

const Games: React.FC = () => {
  const games = [
    {
      id: 'mines',
      name: 'Mines',
      icon: '💣',
      description: 'Navigate through a minefield and multiply your Robux with each safe step',
      features: ['Adjustable mine count', 'Progressive multipliers', 'Cash out anytime'],
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      difficulty: 'Medium',
      rtp: '97%',
    },
    {
      id: 'dice',
      name: 'Dice',
      icon: '🎲',
      description: 'Roll over or under your target number for instant Robux wins',
      features: ['Customizable win chance', 'Instant results', 'High/Low betting'],
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      difficulty: 'Easy',
      rtp: '98%',
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      icon: '🃏',
      description: 'Classic card game - get as close to 21 as possible without going over',
      features: ['Traditional rules', 'Hit or stand', 'Dealer stands on 17'],
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      difficulty: 'Medium',
      rtp: '99%',
    },
    {
      id: 'limbo',
      name: 'Limbo',
      icon: '🚀',
      description: 'Predict where the rocket will crash and win big Robux multipliers',
      features: ['Sky-high multipliers', 'Instant gameplay', 'Risk management'],
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      difficulty: 'Hard',
      rtp: '96%',
    },
  ]

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return <Target className="w-4 h-4" />
      case 'Medium': return <Brain className="w-4 h-4" />
      case 'Hard': return <Zap className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'Hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">BloxRisks Games</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Choose your game and test your luck with Robux. All games feature provably fair mechanics 
          and competitive RTPs for the best gaming experience.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {games.map((game) => (
          <div
            key={game.id}
            className={`bg-gradient-to-br ${game.bgGradient} backdrop-blur-xl rounded-2xl p-8 border ${game.borderColor} hover:border-opacity-50 transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{game.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                    {game.name}
                  </h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className={`flex items-center space-x-1 ${getDifficultyColor(game.difficulty)}`}>
                      {getDifficultyIcon(game.difficulty)}
                      <span className="text-sm font-medium">{game.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{game.rtp} RTP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {game.description}
            </p>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Features
              </h3>
              <ul className="space-y-2">
                {game.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to={`/games/${game.id}`}
              className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${game.gradient} hover:shadow-lg hover:shadow-${game.gradient.split(' ')[1]}/25 text-white font-semibold rounded-xl transition-all duration-200 transform group-hover:scale-[1.02] active:scale-[0.98]`}
            >
              Play {game.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Game Rules */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">How to Play</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Getting Started</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Choose your preferred game from the selection above</li>
              <li>• Set your Robux bet amount based on your balance</li>
              <li>• Follow the specific rules for each game</li>
              <li>• Enjoy provably fair gaming with transparent results</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Fair Gaming</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• All games use cryptographic seeds for fairness</li>
              <li>• Results are generated using provably fair algorithms</li>
              <li>• Game outcomes are verifiable and transparent</li>
              <li>• House edge is clearly displayed for each game</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Games