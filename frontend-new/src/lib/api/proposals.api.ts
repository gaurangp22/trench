import { api } from './client'
import type { Proposal } from './types'

export const ProposalAPI = {
    getMyProposals: async (): Promise<{ proposals: Proposal[]; total: number }> => {
        const res = await api.get('/proposals/mine')
        const rawProposals = res.data.proposals || []
        // Map backend fields to frontend fields
        const proposals = rawProposals.map((p: Record<string, unknown>) => ({
            ...p,
            proposed_rate: (p.proposed_rate_sol as number) || (p.proposed_rate as number) || 0,
            estimated_duration: (p.estimated_duration as string) || 'Not specified',
            created_at: (p.submitted_at as string) || (p.created_at as string) || new Date().toISOString(),
            status: p.status === 'submitted' ? 'pending' : p.status,
            // Map job data from backend
            job: p.job ? {
                id: (p.job as Record<string, unknown>).id,
                title: (p.job as Record<string, unknown>).title,
                status: (p.job as Record<string, unknown>).status,
                budget: (p.job as Record<string, unknown>).budget_min_sol || 0,
                payment_type: (p.job as Record<string, unknown>).payment_type,
                client: (p.job as Record<string, unknown>).client ? {
                    id: ((p.job as Record<string, unknown>).client as Record<string, unknown>).id,
                    display_name: ((p.job as Record<string, unknown>).client as Record<string, unknown>).display_name ||
                        ((p.job as Record<string, unknown>).client as Record<string, unknown>).username,
                    avatar_url: ((p.job as Record<string, unknown>).client as Record<string, unknown>).avatar_url,
                } : undefined
            } : undefined
        }))
        return { proposals, total: res.data.total || proposals.length }
    },

    getById: async (id: string): Promise<Proposal> => {
        const res = await api.get(`/proposals/${id}`)
        return res.data
    },

    withdraw: async (id: string) => {
        const res = await api.delete(`/proposals/${id}`)
        return res.data
    },

    shortlist: async (id: string) => {
        const res = await api.post(`/proposals/${id}/shortlist`)
        return res.data
    },

    reject: async (id: string) => {
        const res = await api.post(`/proposals/${id}/reject`)
        return res.data
    },

    hire: async (id: string) => {
        const res = await api.post(`/proposals/${id}/hire`)
        return res.data
    }
}
