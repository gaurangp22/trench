import { api } from './client'
import type {
    Job,
    CreateJobRequest,
    JobSearchParams,
    Proposal,
    CreateProposalRequest
} from './types'

/**
 * Transform raw backend job data to frontend Job type
 */
function transformJob(rawJob: Record<string, unknown>): Job {
    return {
        id: rawJob.id as string,
        title: rawJob.title as string,
        description: (rawJob.description as string) || '',
        budget: (rawJob.budget_min_sol as number) || (rawJob.budget as number) || 0,
        budget_type: rawJob.payment_type === 'hourly' ? 'hourly' : 'fixed',
        difficulty: (rawJob.complexity as string) || 'intermediate',
        status: (rawJob.status as Job['status']) || 'open',
        created_at: rawJob.created_at as string,
        client_id: rawJob.client_id as string,
        skills: (rawJob.skills as string[]) || [],
        category_id: rawJob.category_id as number | undefined,
        proposal_count: (rawJob.proposal_count as number) || 0,
        escrow_funded: (rawJob.escrow_funded as boolean) || false,
        client: rawJob.client as Job['client'],
    }
}

export const JobAPI = {
    search: async (params?: JobSearchParams): Promise<{ jobs: Job[]; total: number }> => {
        const res = await api.get('/jobs', { params })
        const rawJobs = res.data.jobs || []
        const jobs = rawJobs.map(transformJob)
        return { jobs, total: res.data.total || jobs.length }
    },

    getById: async (id: string): Promise<Job> => {
        const res = await api.get(`/jobs/${id}`)
        // Backend returns {job: {...}, skills: [...]}
        const rawJob = res.data.job || res.data
        const job = transformJob(rawJob)
        // Handle skills from response
        if (res.data.skills) {
            job.skills = res.data.skills.map((s: { name?: string } | string) =>
                typeof s === 'string' ? s : s.name || s
            )
        }
        return job
    },

    getMyJobs: async (): Promise<Job[]> => {
        const res = await api.get('/jobs/mine')
        // Ensure we always return an array
        const rawJobs = Array.isArray(res.data) ? res.data : (res.data?.jobs || [])
        return rawJobs.map(transformJob)
    },

    create: async (data: CreateJobRequest): Promise<Job> => {
        // Transform frontend fields to backend fields
        const backendData = {
            title: data.title,
            description: data.description,
            payment_type: data.budget_type === 'hourly' ? 'hourly' : 'fixed',
            budget_min_sol: data.budget,
            budget_max_sol: data.budget,
            complexity: data.difficulty,
            visibility: 'public',
            category_id: data.category_id,
            skills: data.skills,
        }
        const res = await api.post('/jobs', backendData)
        return res.data?.job || res.data
    },

    update: async (id: string, data: Partial<CreateJobRequest>): Promise<Job> => {
        const res = await api.put(`/jobs/${id}`, data)
        return res.data
    },

    publish: async (id: string): Promise<Job> => {
        const res = await api.post(`/jobs/${id}/publish`)
        return res.data
    },

    close: async (id: string) => {
        const res = await api.post(`/jobs/${id}/close`)
        return res.data
    },

    delete: async (id: string) => {
        const res = await api.delete(`/jobs/${id}`)
        return res.data
    },

    // Proposals for a job
    getProposals: async (jobId: string): Promise<{ proposals: Proposal[]; total: number }> => {
        const res = await api.get(`/jobs/${jobId}/proposals`)
        const rawProposals = res.data.proposals || []
        // Map backend fields to frontend fields
        const proposals = rawProposals.map((p: Record<string, unknown>) => ({
            ...p,
            proposed_rate: (p.proposed_rate_sol as number) || (p.proposed_rate as number) || 0,
            estimated_duration: (p.estimated_duration as string) || 'Not specified',
            created_at: (p.submitted_at as string) || (p.created_at as string) || new Date().toISOString(),
            status: p.status === 'submitted' ? 'pending' : p.status,
        }))
        return { proposals, total: res.data.total || proposals.length }
    },

    submitProposal: async (jobId: string, data: CreateProposalRequest): Promise<Proposal> => {
        // Transform frontend fields to backend fields
        const backendData = {
            cover_letter: data.cover_letter,
            proposed_rate_sol: data.proposed_rate,
            proposed_amount_sol: data.proposed_rate,
            estimated_duration: data.estimated_duration,
        }
        const res = await api.post(`/jobs/${jobId}/proposals`, backendData)
        return res.data?.proposal || res.data
    }
}

// Legacy export for backward compatibility
export const fetchJobs = async (query?: string, _filter?: string) => {
    const params: JobSearchParams = {}
    if (query) params.q = query
    const result = await JobAPI.search(params)
    return { jobs: result.jobs }
}
