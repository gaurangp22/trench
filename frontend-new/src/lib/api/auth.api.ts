import { api } from './client'
import type { User, Profile } from './types'

export const AuthAPI = {
    login: async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        if (res.data.token) {
            localStorage.setItem('token', res.data.token)
        }
        return res.data
    },

    signup: async (
        email: string,
        password: string,
        username: string,
        role: 'client' | 'freelancer',
        walletAddress?: string
    ) => {
        const res = await api.post('/auth/signup', {
            email,
            password,
            username,
            is_client: role === 'client',
            is_freelancer: role === 'freelancer',
            ...(walletAddress && { wallet_address: walletAddress })
        })
        if (res.data.token) {
            localStorage.setItem('token', res.data.token)
        }
        return res.data
    },

    getNonce: async (walletAddress: string) => {
        const res = await api.get(`/auth/nonce?wallet_address=${walletAddress}`)
        return res.data
    },

    walletLogin: async (walletAddress: string, signature: string) => {
        const res = await api.post('/auth/login/wallet', {
            wallet_address: walletAddress,
            signature
        })
        if (res.data.token) {
            localStorage.setItem('token', res.data.token)
        }
        return res.data
    },

    connectWallet: async (walletAddress: string, walletType = 'phantom') => {
        const res = await api.post('/wallet/connect', {
            wallet_address: walletAddress,
            wallet_type: walletType
        })
        return res.data
    },

    getWallets: async () => {
        const res = await api.get('/wallet')
        return res.data.wallets
    },

    logout: () => {
        localStorage.removeItem('token')
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token')
    },

    me: async (): Promise<{ user: User; profile: Profile } | null> => {
        const token = localStorage.getItem('token')
        if (!token) return null
        try {
            const res = await api.get('/profile')
            // Map profile response to user + profile
            return {
                user: {
                    id: res.data.user?.id || res.data.profile?.user_id,
                    email: res.data.user?.email || '',
                    role: res.data.profile?.professional_title ? 'freelancer' : 'client'
                },
                profile: res.data.profile
            }
        } catch {
            return null
        }
    }
}

// Legacy exports for backward compatibility
export const login = AuthAPI.login
export const signup = AuthAPI.signup
