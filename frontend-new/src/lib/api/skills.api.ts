import { api } from './client'

export interface Skill {
    id: number
    name: string
    category?: string
}

export const SkillsAPI = {
    list: async (category?: string, query?: string): Promise<{ skills: Skill[] }> => {
        const res = await api.get('/skills', { params: { category, q: query } })
        return { skills: res.data.skills || res.data || [] }
    },

    getById: async (id: string) => {
        const res = await api.get(`/skills/${id}`)
        return res.data
    }
}

// Legacy export for backward compatibility
export const getSkills = async (category?: string, query?: string) => {
    const res = await api.get('/skills', { params: { category, q: query } })
    return res.data.skills
}
