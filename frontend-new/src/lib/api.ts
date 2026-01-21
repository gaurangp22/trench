import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optionally redirect to login
        }
        return Promise.reject(error);
    }
);

// ============================================
// Types from Backend
// ============================================

export interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    budget_type: 'fixed' | 'hourly';
    difficulty: string;
    status: 'draft' | 'open' | 'active' | 'completed' | 'cancelled';
    created_at: string;
    client_id: string;
    skills: string[];
    category_id?: number;
    proposal_count?: number;
    escrow_funded?: boolean;
    client?: {
        id: string;
        display_name: string;
        avatar_url?: string;
        rating?: number;
        jobs_posted?: number;
        verified?: boolean;
    };
}

export interface CreateJobRequest {
    title: string;
    description: string;
    budget: number;
    budget_type: 'fixed' | 'hourly';
    difficulty: string;
    category_id?: number;
    skills?: string[];
}

export interface User {
    id: string;
    email: string;
    role: 'client' | 'freelancer';
}

export interface Profile {
    id: string;
    user_id: string;
    display_name: string;
    professional_title?: string;
    bio?: string;
    hourly_rate_sol?: number;
    country?: string;
    avatar_url?: string;
    available_for_hire: boolean;
    created_at: string;
}

export interface ProfileResponse {
    profile: Profile;
    skills?: { id: string; name: string }[];
    portfolio?: PortfolioItem[];
    stats?: {
        total_earnings?: number;
        jobs_completed?: number;
        rating?: number;
        review_count?: number;
    };
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    url?: string;
    image_url?: string;
    created_at: string;
}

export interface Proposal {
    id: string;
    job_id: string;
    freelancer_id: string;
    cover_letter: string;
    proposed_rate: number;
    estimated_duration: string;
    status: 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
    created_at: string;
    job?: Job;
    freelancer?: Profile;
}

export interface CreateProposalRequest {
    cover_letter: string;
    proposed_rate: number;
    estimated_duration: string;
}

export interface Contract {
    id: string;
    job_id: string;
    client_id: string;
    freelancer_id: string;
    proposal_id: string;
    title: string;
    description?: string;
    total_amount: number;
    status: 'active' | 'completed' | 'cancelled' | 'disputed';
    escrow_address?: string;
    created_at: string;
    milestones?: Milestone[];
    job?: Job;
    client?: Profile;
    freelancer?: Profile;
}

export interface Milestone {
    id: string;
    contract_id: string;
    title: string;
    description?: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested';
    due_date?: string;
    submitted_at?: string;
    approved_at?: string;
    order_index: number;
}

export interface CreateMilestoneRequest {
    title: string;
    description?: string;
    amount: number;
    due_date?: string;
}

// ============================================
// Auth API
// ============================================

export const AuthAPI = {
    login: async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    },

    signup: async (email: string, password: string, role: 'client' | 'freelancer') => {
        const res = await api.post('/auth/signup', { email, password, role });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    },

    getNonce: async (walletAddress: string) => {
        const res = await api.get(`/auth/nonce?wallet_address=${walletAddress}`);
        return res.data;
    },

    walletLogin: async (walletAddress: string, signature: string) => {
        const res = await api.post('/auth/login/wallet', { wallet_address: walletAddress, signature });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    },

    connectWallet: async (walletAddress: string, walletType: string = 'phantom') => {
        const res = await api.post('/wallet/connect', { wallet_address: walletAddress, wallet_type: walletType });
        return res.data;
    },

    getWallets: async () => {
        const res = await api.get('/wallet');
        return res.data.wallets;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

// ============================================
// Jobs API
// ============================================

export interface JobSearchParams {
    q?: string;
    category_id?: number;
    skills?: string[];
    status?: string;
    min_budget?: number;
    max_budget?: number;
    difficulty?: string;
    limit?: number;
    offset?: number;
}

export const JobAPI = {
    search: async (params?: JobSearchParams): Promise<{ jobs: Job[]; total: number }> => {
        const res = await api.get('/jobs', { params });
        return res.data;
    },

    getById: async (id: string): Promise<Job> => {
        const res = await api.get(`/jobs/${id}`);
        return res.data;
    },

    getMyJobs: async (): Promise<Job[]> => {
        const res = await api.get('/jobs/mine');
        return res.data.jobs || res.data;
    },

    create: async (data: CreateJobRequest): Promise<Job> => {
        const res = await api.post('/jobs', data);
        return res.data;
    },

    update: async (id: string, data: Partial<CreateJobRequest>): Promise<Job> => {
        const res = await api.put(`/jobs/${id}`, data);
        return res.data;
    },

    publish: async (id: string): Promise<Job> => {
        const res = await api.post(`/jobs/${id}/publish`);
        return res.data;
    },

    close: async (id: string) => {
        const res = await api.post(`/jobs/${id}/close`);
        return res.data;
    },

    delete: async (id: string) => {
        const res = await api.delete(`/jobs/${id}`);
        return res.data;
    },

    // Proposals for a job
    getProposals: async (jobId: string): Promise<{ proposals: Proposal[]; total: number }> => {
        const res = await api.get(`/jobs/${jobId}/proposals`);
        return res.data;
    },

    submitProposal: async (jobId: string, data: CreateProposalRequest): Promise<Proposal> => {
        const res = await api.post(`/jobs/${jobId}/proposals`, data);
        return res.data;
    }
};

// ============================================
// Proposals API
// ============================================

export const ProposalAPI = {
    getMyProposals: async (): Promise<{ proposals: Proposal[]; total: number }> => {
        const res = await api.get('/proposals/mine');
        return res.data;
    },

    getById: async (id: string): Promise<Proposal> => {
        const res = await api.get(`/proposals/${id}`);
        return res.data;
    },

    withdraw: async (id: string) => {
        const res = await api.delete(`/proposals/${id}`);
        return res.data;
    },

    shortlist: async (id: string) => {
        const res = await api.post(`/proposals/${id}/shortlist`);
        return res.data;
    },

    reject: async (id: string) => {
        const res = await api.post(`/proposals/${id}/reject`);
        return res.data;
    },

    hire: async (id: string) => {
        const res = await api.post(`/proposals/${id}/hire`);
        return res.data;
    }
};

// ============================================
// Profiles API
// ============================================

export interface ProfileSearchParams {
    q?: string;
    skills?: string[];
    min_rate?: number;
    max_rate?: number;
    available_only?: boolean;
    limit?: number;
    offset?: number;
}

export const ProfileAPI = {
    getMyProfile: async (): Promise<ProfileResponse> => {
        const res = await api.get('/profile');
        return res.data;
    },

    getById: async (id: string): Promise<ProfileResponse> => {
        const res = await api.get(`/profiles/${id}`);
        return res.data;
    },

    update: async (data: Partial<Profile>): Promise<Profile> => {
        const res = await api.put('/profile', data);
        return res.data;
    },

    search: async (params?: ProfileSearchParams): Promise<{ profiles: ProfileResponse[]; total: number }> => {
        const res = await api.get('/profiles', { params });
        return res.data;
    },

    // Skills
    setSkills: async (skillIds: string[]) => {
        const res = await api.put('/profile/skills', { skill_ids: skillIds });
        return res.data;
    },

    addSkill: async (skillName: string) => {
        const res = await api.post('/profile/skills', { name: skillName });
        return res.data;
    },

    removeSkill: async (skillId: string) => {
        const res = await api.delete(`/profile/skills/${skillId}`);
        return res.data;
    },

    // Portfolio
    addPortfolioItem: async (data: Omit<PortfolioItem, 'id' | 'created_at'>): Promise<PortfolioItem> => {
        const res = await api.post('/profile/portfolio', data);
        return res.data;
    },

    updatePortfolioItem: async (id: string, data: Partial<PortfolioItem>): Promise<PortfolioItem> => {
        const res = await api.put(`/profile/portfolio/${id}`, data);
        return res.data;
    },

    deletePortfolioItem: async (id: string) => {
        const res = await api.delete(`/profile/portfolio/${id}`);
        return res.data;
    }
};

// Get all available skills
export const getSkills = async (category?: string, query?: string) => {
    const res = await api.get('/skills', { params: { category, q: query } });
    return res.data.skills;
};

// ============================================
// Contracts API
// ============================================

export interface ContractSearchParams {
    status?: string;
    role?: 'client' | 'freelancer';
    limit?: number;
    offset?: number;
}

export const ContractAPI = {
    list: async (params?: ContractSearchParams): Promise<{ contracts: Contract[]; total: number }> => {
        const res = await api.get('/contracts', { params });
        return res.data;
    },

    getById: async (id: string): Promise<Contract> => {
        const res = await api.get(`/contracts/${id}`);
        return res.data;
    },

    hire: async (proposalId: string, milestones?: CreateMilestoneRequest[]): Promise<Contract> => {
        const res = await api.post('/contracts', { proposal_id: proposalId, milestones });
        return res.data;
    },

    complete: async (id: string) => {
        const res = await api.post(`/contracts/${id}/complete`);
        return res.data;
    },

    // Milestones
    addMilestone: async (contractId: string, data: CreateMilestoneRequest): Promise<Milestone> => {
        const res = await api.post(`/contracts/${contractId}/milestones`, data);
        return res.data;
    },

    submitMilestone: async (milestoneId: string, submissionNotes?: string): Promise<Milestone> => {
        const res = await api.post(`/milestones/${milestoneId}/submit`, { submission_notes: submissionNotes });
        return res.data;
    },

    approveMilestone: async (milestoneId: string): Promise<Milestone> => {
        const res = await api.post(`/milestones/${milestoneId}/approve`);
        return res.data;
    },

    requestRevision: async (milestoneId: string, feedback: string): Promise<Milestone> => {
        const res = await api.post(`/milestones/${milestoneId}/revision`, { feedback });
        return res.data;
    }
};

// ============================================
// Legacy exports for backward compatibility
// ============================================

export const login = AuthAPI.login;
export const signup = AuthAPI.signup;

export const fetchJobs = async (query?: string, _filter?: string) => {
    const params: JobSearchParams = {};
    if (query) params.q = query;
    const result = await JobAPI.search(params);
    return { jobs: result.jobs };
};

export const fetchTalent = async (query?: string) => {
    const params: ProfileSearchParams = {};
    if (query) params.q = query;
    const result = await ProfileAPI.search(params);
    return { profiles: result.profiles };
};
