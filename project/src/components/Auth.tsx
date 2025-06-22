import React, { useState } from 'react'
import { signIn, signUp } from '../lib/auth'
import { useNavigate } from 'react-router-dom'
import { Gamepad2, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react'

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailSent(false)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setEmailSent(true)
      } else {
        await signIn(email, password)
        navigate('/')
      }
    } catch (err: any) {
      if (err.message.includes('email_not_confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.')
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-green-500 rounded-2xl mb-4">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">BloxRisks</h1>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
              <p className="text-gray-300 mb-6">
                We've sent a confirmation link to <span className="text-blue-400 font-medium">{email}</span>
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-blue-400 font-medium text-sm mb-1">Next Steps:</p>
                    <ol className="text-gray-300 text-sm space-y-1">
                      <li>1. Check your email inbox</li>
                      <li>2. Click the confirmation link</li>
                      <li>3. Return here to sign in</li>
                    </ol>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setIsSignUp(false)
                  setEmail('')
                  setPassword('')
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-green-500 rounded-2xl mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BloxRisks</h1>
          <p className="text-gray-400 mt-2">Premium Roblox gaming platform</p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400">
              {isSignUp ? 'Start your gaming journey' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-gray-400 text-xs mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmailSent(false)
              }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {isSignUp && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm text-center">
                🎉 New players receive 1,000 Robux starting balance!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth