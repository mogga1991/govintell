import React, { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  onSubmit: (data: any) => void
  loading: boolean
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, loading }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...formData, isLogin })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', full_name: '' })
  }

  return (
    <div className="min-h-screen bg-[#202124] text-gray-100 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">RFQ Intelligence</h1>
          <p className="text-gray-300">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 bg-[#303134] border border-[#5f6368] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#303134] border border-[#5f6368] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-[#303134] border border-[#5f6368] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading 
              ? (isLogin ? 'Signing in...' : 'Creating account...') 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isLogin 
              ? "Don't have an account? Create one" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm