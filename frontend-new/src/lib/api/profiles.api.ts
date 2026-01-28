import { api } from './client'
import type {
    Profile,
    ProfileResponse,
    ProfileSearchParams,
    PortfolioItem,
    ProfileSocial,
    TokenWorkItem
} from './types'

export const ProfileAPI = {
    getMyProfile: async (): Promise<ProfileResponse> => {
        const res = await api.get('/profile')
        return res.data
    },

    getById: async (id: string): Promise<ProfileResponse> => {
        const res = await api.get(`/profiles/${id}`)
        return res.data
    },

    update: async (data: Partial<Profile>): Promise<Profile> => {
        const res = await api.put('/profile', data)
        return res.data
    },

    create: async (data: Partial<Profile>): Promise<Profile> => {
        const res = await api.post('/profile', data)
        return res.data
    },

    search: async (params?: ProfileSearchParams): Promise<{ profiles: ProfileResponse[]; total: number }> => {
        const res = await api.get('/profiles', { params })
        return res.data
    },

    // Skills
    setSkills: async (skillIds: string[]) => {
        const res = await api.put('/profile/skills', { skill_ids: skillIds })
        return res.data
    },

    addSkill: async (skillName: string) => {
        const res = await api.post('/profile/skills', { name: skillName })
        return res.data
    },

    removeSkill: async (skillId: string) => {
        const res = await api.delete(`/profile/skills/${skillId}`)
        return res.data
    },

    // Portfolio
    addPortfolioItem: async (data: Omit<PortfolioItem, 'id' | 'created_at'>): Promise<PortfolioItem> => {
        const res = await api.post('/profile/portfolio', data)
        return res.data
    },

    updatePortfolioItem: async (id: string, data: Partial<PortfolioItem>): Promise<PortfolioItem> => {
        const res = await api.put(`/profile/portfolio/${id}`, data)
        return res.data
    },

    deletePortfolioItem: async (id: string) => {
        const res = await api.delete(`/profile/portfolio/${id}`)
        return res.data
    },

    // Socials
    getSocials: async (): Promise<{ socials: ProfileSocial[] }> => {
        const res = await api.get('/profile/socials')
        return res.data
    },

    setSocials: async (socials: Omit<ProfileSocial, 'id' | 'created_at'>[]): Promise<void> => {
        await api.put('/profile/socials', { socials })
    },

    // Token Work
    getTokenWork: async (): Promise<{ token_work: TokenWorkItem[] }> => {
        const res = await api.get('/profile/token-work')
        return res.data
    },

    addTokenWork: async (data: {
        contract_address: string
        chain?: string
        token_name?: string
        token_symbol?: string
        token_image_url?: string
        ath_market_cap?: number
        sort_order?: number
    }): Promise<{ item: TokenWorkItem }> => {
        const res = await api.post('/profile/token-work', data)
        return res.data
    },

    updateTokenWork: async (id: string, data: Partial<TokenWorkItem>): Promise<void> => {
        await api.put(`/profile/token-work/${id}`, data)
    },

    deleteTokenWork: async (id: string): Promise<void> => {
        await api.delete(`/profile/token-work/${id}`)
    }
}

// Legacy export for backward compatibility
export const fetchTalent = async (query?: string) => {
    const params: ProfileSearchParams = {}
    if (query) params.q = query
    const result = await ProfileAPI.search(params)
    return { profiles: result.profiles }
}
