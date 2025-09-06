const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://govintell.onrender.com/api/v1' 
  : 'http://localhost:8002/api/v1'

export interface AuthData {
  email: string
  password: string
  full_name?: string
  isLogin: boolean
}

export interface User {
  email: string
  full_name: string
}

export class AuthService {
  static getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  static setToken(token: string): void {
    localStorage.setItem('access_token', token)
  }

  static removeToken(): void {
    localStorage.removeItem('access_token')
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }

    const data = await response.json()
    this.setToken(data.access_token)
    return data.access_token
  }

  static async register(email: string, password: string, full_name: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, full_name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
  }

  static async getCurrentUser(): Promise<User> {
    const token = this.getToken()
    if (!token) {
      throw new Error('No authentication token')
    }

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken()
      }
      throw new Error('Failed to get user data')
    }

    return await response.json()
  }

  static logout(): void {
    this.removeToken()
  }
}