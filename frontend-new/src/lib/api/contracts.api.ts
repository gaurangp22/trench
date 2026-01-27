import { api } from './client'
import type {
    Contract,
    ContractSearchParams,
    Milestone,
    CreateMilestoneRequest
} from './types'

export const ContractAPI = {
    list: async (params?: ContractSearchParams): Promise<{ contracts: Contract[]; total: number }> => {
        const res = await api.get('/contracts', { params })
        return res.data
    },

    getById: async (id: string): Promise<Contract> => {
        const res = await api.get(`/contracts/${id}`)
        return res.data
    },

    hire: async (proposalId: string, milestones?: CreateMilestoneRequest[]): Promise<Contract> => {
        // Backend expects POST /proposals/{id}/hire
        const res = await api.post(`/proposals/${proposalId}/hire`, { milestones })
        return res.data?.contract || res.data
    },

    complete: async (id: string) => {
        const res = await api.post(`/contracts/${id}/complete`)
        return res.data
    },

    // Milestones
    addMilestone: async (contractId: string, data: CreateMilestoneRequest): Promise<Milestone> => {
        const res = await api.post(`/contracts/${contractId}/milestones`, data)
        return res.data
    },

    submitMilestone: async (milestoneId: string, submissionNotes?: string): Promise<Milestone> => {
        const res = await api.post(`/milestones/${milestoneId}/submit`, {
            submission_notes: submissionNotes
        })
        return res.data
    },

    approveMilestone: async (milestoneId: string): Promise<Milestone> => {
        const res = await api.post(`/milestones/${milestoneId}/approve`)
        return res.data
    },

    requestRevision: async (milestoneId: string, feedback: string): Promise<Milestone> => {
        const res = await api.post(`/milestones/${milestoneId}/revision`, { feedback })
        return res.data
    }
}
