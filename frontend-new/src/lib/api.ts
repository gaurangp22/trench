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
    overview?: string;
    hourly_rate_sol?: number;
    country?: string;
    avatar_url?: string;
    available_for_hire: boolean;
    availability_status?: 'available' | 'busy' | 'unavailable';
    created_at: string;
    // Stats fields from backend
    total_jobs_completed?: number;
    total_earnings_sol?: number;
    average_rating?: number;
    total_reviews?: number;
    // Related data (populated in some responses)
    skills?: { id: string; name: string }[];
    socials?: ProfileSocial[];
    portfolio?: PortfolioItem[];
    token_work?: TokenWorkItem[];
}

export interface ProfileResponse {
    profile: Profile;
    skills?: { id: string; name: string }[];
    portfolio?: PortfolioItem[];
    socials?: ProfileSocial[];
    token_work?: TokenWorkItem[];
    user?: {
        id: string;
        username: string;
        wallet_address?: string;
    };
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
    project_url?: string;
    image_url?: string;
    image_urls?: string[];
    sort_order?: number;
    created_at: string;
}

export interface ProfileSocial {
    id?: string;
    platform: 'website' | 'twitter' | 'telegram' | 'discord';
    url: string;
    created_at?: string;
}

export interface TokenWorkItem {
    id: string;
    contract_address: string;
    chain: string;
    token_name?: string;
    token_symbol?: string;
    token_image_url?: string;
    ath_market_cap?: number;
    last_fetched_at?: string;
    sort_order: number;
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
    proposed_rate: number;  // Frontend field - will be mapped to proposed_rate_sol
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
    status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
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

    signup: async (email: string, password: string, username: string, role: 'client' | 'freelancer', walletAddress?: string) => {
        const res = await api.post('/auth/signup', {
            email,
            password,
            username,
            is_client: role === 'client',
            is_freelancer: role === 'freelancer',
            ...(walletAddress && { wallet_address: walletAddress })
        });
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
    },

    me: async (): Promise<{ user: User; profile: Profile } | null> => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const res = await api.get('/profile');
            // Map profile response to user + profile
            return {
                user: {
                    id: res.data.user?.id || res.data.profile?.user_id,
                    email: res.data.user?.email || '',
                    role: res.data.profile?.professional_title ? 'freelancer' : 'client'
                },
                profile: res.data.profile
            };
        } catch {
            return null;
        }
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
        const rawJobs = res.data.jobs || [];
        // Map backend fields to frontend fields
        const jobs = rawJobs.map((rawJob: any) => ({
            id: rawJob.id,
            title: rawJob.title,
            description: rawJob.description || '',
            budget: rawJob.budget_min_sol || rawJob.budget || 0,
            budget_type: rawJob.payment_type === 'hourly' ? 'hourly' : 'fixed',
            difficulty: rawJob.complexity || 'intermediate',
            status: rawJob.status || 'open',
            created_at: rawJob.created_at,
            client_id: rawJob.client_id,
            skills: rawJob.skills || [],
            category_id: rawJob.category_id,
            proposal_count: rawJob.proposal_count || 0,
            escrow_funded: rawJob.escrow_funded || false,
        }));
        return { jobs, total: res.data.total || jobs.length };
    },

    getById: async (id: string): Promise<Job> => {
        const res = await api.get(`/jobs/${id}`);
        // Backend returns {job: {...}, skills: [...]}
        const rawJob = res.data.job || res.data;
        // Map backend fields to frontend fields
        const job: Job = {
            id: rawJob.id,
            title: rawJob.title,
            description: rawJob.description || '',
            budget: rawJob.budget_min_sol || rawJob.budget || 0,
            budget_type: rawJob.payment_type === 'hourly' ? 'hourly' : 'fixed',
            difficulty: rawJob.complexity || 'intermediate',
            status: rawJob.status || 'open',
            created_at: rawJob.created_at,
            client_id: rawJob.client_id,
            skills: res.data.skills?.map((s: any) => s.name || s) || rawJob.skills || [],
            category_id: rawJob.category_id,
            proposal_count: rawJob.proposal_count || 0,
            escrow_funded: rawJob.escrow_funded || false,
            client: rawJob.client,
        };
        return job;
    },

    getMyJobs: async (): Promise<Job[]> => {
        const res = await api.get('/jobs/mine');
        // Ensure we always return an array
        const rawJobs = Array.isArray(res.data) ? res.data : (res.data?.jobs || []);
        // Map backend fields to frontend fields
        return rawJobs.map((rawJob: any) => ({
            id: rawJob.id,
            title: rawJob.title,
            description: rawJob.description || '',
            budget: rawJob.budget_min_sol || rawJob.budget || 0,
            budget_type: rawJob.payment_type === 'hourly' ? 'hourly' : 'fixed',
            difficulty: rawJob.complexity || 'intermediate',
            status: rawJob.status || 'open',
            created_at: rawJob.created_at,
            client_id: rawJob.client_id,
            skills: rawJob.skills || [],
            category_id: rawJob.category_id,
            proposal_count: rawJob.proposal_count || 0,
            escrow_funded: rawJob.escrow_funded || false,
        }));
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
        };
        const res = await api.post('/jobs', backendData);
        return res.data?.job || res.data;
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
        const rawProposals = res.data.proposals || [];
        // Map backend fields to frontend fields
        const proposals = rawProposals.map((p: any) => ({
            ...p,
            proposed_rate: p.proposed_rate_sol || p.proposed_rate || 0,
            estimated_duration: p.estimated_duration || 'Not specified',
            created_at: p.submitted_at || p.created_at || new Date().toISOString(),
            status: p.status === 'submitted' ? 'pending' : p.status,
        }));
        return { proposals, total: res.data.total || proposals.length };
    },

    submitProposal: async (jobId: string, data: CreateProposalRequest): Promise<Proposal> => {
        // Transform frontend fields to backend fields
        const backendData = {
            cover_letter: data.cover_letter,
            proposed_rate_sol: data.proposed_rate,
            proposed_amount_sol: data.proposed_rate,
            estimated_duration: data.estimated_duration,
        };
        const res = await api.post(`/jobs/${jobId}/proposals`, backendData);
        return res.data?.proposal || res.data;
    }
};

// ============================================
// Proposals API
// ============================================

export const ProposalAPI = {
    getMyProposals: async (): Promise<{ proposals: Proposal[]; total: number }> => {
        const res = await api.get('/proposals/mine');
        const rawProposals = res.data.proposals || [];
        // Map backend fields to frontend fields
        const proposals = rawProposals.map((p: any) => ({
            ...p,
            proposed_rate: p.proposed_rate_sol || p.proposed_rate || 0,
            estimated_duration: p.estimated_duration || 'Not specified',
            created_at: p.submitted_at || p.created_at || new Date().toISOString(),
            status: p.status === 'submitted' ? 'pending' : p.status,
            // Map job data from backend
            job: p.job ? {
                id: p.job.id,
                title: p.job.title,
                status: p.job.status,
                budget: p.job.budget_min_sol || 0,
                payment_type: p.job.payment_type,
                client: p.job.client ? {
                    id: p.job.client.id,
                    display_name: p.job.client.display_name || p.job.client.username,
                    avatar_url: p.job.client.avatar_url,
                } : undefined
            } : undefined
        }));
        return { proposals, total: res.data.total || proposals.length };
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

    create: async (data: Partial<Profile>): Promise<Profile> => {
        const res = await api.post('/profile', data);
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
    },

    // Socials
    getSocials: async (): Promise<{ socials: ProfileSocial[] }> => {
        const res = await api.get('/profile/socials');
        return res.data;
    },

    setSocials: async (socials: Omit<ProfileSocial, 'id' | 'created_at'>[]): Promise<void> => {
        await api.put('/profile/socials', { socials });
    },

    // Token Work
    getTokenWork: async (): Promise<{ token_work: TokenWorkItem[] }> => {
        const res = await api.get('/profile/token-work');
        return res.data;
    },

    addTokenWork: async (data: {
        contract_address: string;
        chain?: string;
        token_name?: string;
        token_symbol?: string;
        token_image_url?: string;
        ath_market_cap?: number;
        sort_order?: number;
    }): Promise<{ item: TokenWorkItem }> => {
        const res = await api.post('/profile/token-work', data);
        return res.data;
    },

    updateTokenWork: async (id: string, data: Partial<TokenWorkItem>): Promise<void> => {
        await api.put(`/profile/token-work/${id}`, data);
    },

    deleteTokenWork: async (id: string): Promise<void> => {
        await api.delete(`/profile/token-work/${id}`);
    }
};

// Get all available skills
export const getSkills = async (category?: string, query?: string) => {
    const res = await api.get('/skills', { params: { category, q: query } });
    return res.data.skills;
};

// ============================================
// Skills API
// ============================================

export const SkillsAPI = {
    list: async (category?: string, query?: string): Promise<{ skills: { id: number; name: string; category?: string }[] }> => {
        const res = await api.get('/skills', { params: { category, q: query } });
        return { skills: res.data.skills || res.data || [] };
    },

    getById: async (id: string) => {
        const res = await api.get(`/skills/${id}`);
        return res.data;
    }
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
        // Backend expects POST /proposals/{id}/hire
        const res = await api.post(`/proposals/${proposalId}/hire`, { milestones });
        return res.data?.contract || res.data;
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

// ============================================
// Messages/Conversations API
// ============================================

export interface Conversation {
    id: string;
    participants: Participant[];
    last_message?: Message;
    unread_count: number;
    context?: ConversationContext;
    updated_at: string;
    created_at: string;
}

export interface Participant {
    user_id: string;
    username: string;
    avatar_url?: string;
    is_online: boolean;
}

export interface ConversationContext {
    type: 'contract' | 'job' | 'proposal';
    id: string;
    title: string;
    status?: string;
    amount_sol?: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender_username?: string;
    sender_avatar?: string;
    message_text: string;
    message_type: 'text' | 'system' | 'milestone_update';
    is_edited: boolean;
    created_at: string;
}

export interface SendMessageRequest {
    message_text: string;
    message_type?: string;
}

export interface CreateConversationRequest {
    participant_id: string;
    contract_id?: string;
    job_id?: string;
    initial_message?: string;
}

// ============================================
// Reviews API
// ============================================

export interface Review {
    id: string;
    contract_id: string;
    reviewer_id: string;
    reviewee_id: string;
    overall_rating: number;
    communication_rating?: number;
    quality_rating?: number;
    expertise_rating?: number;
    professionalism_rating?: number;
    would_recommend?: boolean;
    review_text?: string;
    is_public: boolean;
    created_at: string;
    reviewer_username?: string;
}

export interface CreateReviewRequest {
    contract_id: string;
    overall_rating: number;
    communication_rating?: number;
    quality_rating?: number;
    expertise_rating?: number;
    professionalism_rating?: number;
    would_recommend?: boolean;
    review_text?: string;
    is_public?: boolean;
}

export const ReviewAPI = {
    create: async (data: CreateReviewRequest): Promise<Review> => {
        const res = await api.post('/reviews', data);
        return res.data;
    },

    getById: async (id: string): Promise<Review> => {
        const res = await api.get(`/reviews/${id}`);
        return res.data;
    },

    getByContract: async (contractId: string): Promise<{ reviews: Review[] }> => {
        const res = await api.get(`/contracts/${contractId}/reviews`);
        return res.data;
    },

    getByUser: async (userId: string, limit = 20, offset = 0): Promise<{ reviews: Review[]; total: number }> => {
        const res = await api.get(`/users/${userId}/reviews`, { params: { limit, offset } });
        return res.data;
    }
};

export const MessageAPI = {
    // Get all conversations for current user
    getConversations: async (limit = 20, offset = 0): Promise<{ conversations: Conversation[]; total: number }> => {
        const res = await api.get('/conversations', { params: { limit, offset } });
        return res.data;
    },

    // Get a single conversation
    getConversation: async (id: string): Promise<Conversation> => {
        const res = await api.get(`/conversations/${id}`);
        return res.data;
    },

    // Get messages for a conversation
    getMessages: async (conversationId: string, limit = 50, offset = 0): Promise<{ messages: Message[]; total: number }> => {
        const res = await api.get(`/conversations/${conversationId}/messages`, { params: { limit, offset } });
        return res.data;
    },

    // Send a message
    sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
        const res = await api.post(`/conversations/${conversationId}/messages`, data);
        return res.data;
    },

    // Create a new conversation
    createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
        const res = await api.post('/conversations', data);
        return res.data;
    },

    // Get or create conversation for a contract
    getContractConversation: async (contractId: string): Promise<Conversation> => {
        const res = await api.get(`/contracts/${contractId}/conversation`);
        return res.data;
    },

    // Mark conversation as read
    markAsRead: async (conversationId: string): Promise<void> => {
        await api.post(`/conversations/${conversationId}/read`);
    },

    // Get total unread count
    getUnreadCount: async (): Promise<number> => {
        const res = await api.get('/messages/unread-count');
        return res.data.unread_count;
    }
};

// ============================================
// Upload API
// ============================================

export const UploadAPI = {
    // Upload a file (profile picture, portfolio image, etc.)
    uploadFile: async (file: File): Promise<{ url: string; filename: string; original_name?: string; file_type?: string; file_size?: number }> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    }
};

// ============================================
// Services (Gigs) API
// ============================================

export type PackageTier = 'basic' | 'standard' | 'premium';

export interface ServiceFAQ {
    id?: string;
    question: string;
    answer: string;
}

export interface ServiceReview {
    id: string;
    service_id: string;
    reviewer_id: string;
    rating: number;
    comment?: string;
    created_at: string;
    reviewer?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
}

export interface Service {
    id: string;
    freelancer_id: string;
    title: string;
    description: string;
    category?: { id: number; name: string; slug: string };
    thumbnail_url?: string;
    gallery_urls?: string[];
    basic_price_sol?: number;
    standard_price_sol?: number;
    premium_price_sol?: number;
    basic_delivery_days?: number;
    standard_delivery_days?: number;
    premium_delivery_days?: number;
    basic_description?: string;
    standard_description?: string;
    premium_description?: string;
    basic_revisions?: number;
    standard_revisions?: number;
    premium_revisions?: number;
    tags?: string[];
    skills?: { id: number; name: string }[];
    status: 'draft' | 'active' | 'paused' | 'deleted';
    average_rating?: number;
    total_reviews?: number;
    total_orders?: number;
    created_at: string;
    updated_at?: string;
    profile?: {
        id: string;
        display_name: string;
        avatar_url?: string;
        professional_title?: string;
    };
    faqs?: ServiceFAQ[];
    reviews?: ServiceReview[];
}

export interface CreateServiceRequest {
    title: string;
    description: string;
    category_id?: number;
    thumbnail_url?: string;
    gallery_urls?: string[];
    basic_price_sol?: number;
    standard_price_sol?: number;
    premium_price_sol?: number;
    basic_delivery_days?: number;
    standard_delivery_days?: number;
    premium_delivery_days?: number;
    basic_description?: string;
    standard_description?: string;
    premium_description?: string;
    basic_revisions?: number;
    standard_revisions?: number;
    premium_revisions?: number;
    tags?: string[];
    skills?: number[];
    faqs?: ServiceFAQ[];
}

export interface ServiceOrder {
    id: string;
    service_id: string;
    client_id: string;
    freelancer_id: string;
    package_tier: PackageTier;
    price_sol: number;
    status: 'pending' | 'active' | 'delivered' | 'revision' | 'completed' | 'cancelled' | 'disputed';
    requirements?: string;
    delivery_deadline?: string;
    created_at: string;
    updated_at?: string;
    service?: Service;
    client?: Profile;
    freelancer?: Profile;
}

export interface ServiceOrderMessage {
    id: string;
    order_id: string;
    sender_id: string;
    message: string;
    attachments?: string[];
    created_at: string;
    sender?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
}

export interface Skill {
    id: number;
    name: string;
    category?: string;
}

export const ServiceAPI = {
    // List services with filters
    list: async (params?: {
        category?: string;
        q?: string;
        min_price?: number;
        max_price?: number;
        sort_by?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ services: Service[]; total: number }> => {
        const res = await api.get('/services', { params });
        return { services: res.data.services || [], total: res.data.total || 0 };
    },

    // Get a single service by ID
    getById: async (id: string): Promise<Service> => {
        const res = await api.get(`/services/${id}`);
        return res.data.service || res.data;
    },

    // Get services by freelancer
    getByFreelancer: async (freelancerId: string): Promise<{ services: Service[] }> => {
        const res = await api.get(`/profiles/${freelancerId}/services`);
        return { services: res.data.services || [] };
    },

    // Get my services (current user)
    getMyServices: async (): Promise<{ services: Service[] }> => {
        const res = await api.get('/services/mine');
        return { services: res.data.services || [] };
    },

    // Create a new service
    create: async (data: CreateServiceRequest): Promise<Service> => {
        const res = await api.post('/services', data);
        return res.data.service || res.data;
    },

    // Update a service
    update: async (id: string, data: Partial<CreateServiceRequest>): Promise<Service> => {
        const res = await api.put(`/services/${id}`, data);
        return res.data.service || res.data;
    },

    // Delete a service
    delete: async (id: string): Promise<void> => {
        await api.delete(`/services/${id}`);
    },

    // Publish a service
    publish: async (id: string): Promise<Service> => {
        const res = await api.post(`/services/${id}/publish`);
        return res.data.service || res.data;
    },

    // Pause a service
    pause: async (id: string): Promise<Service> => {
        const res = await api.post(`/services/${id}/pause`);
        return res.data.service || res.data;
    },

    // Get reviews for a service
    getReviews: async (serviceId: string, limit = 20, offset = 0): Promise<{ reviews: ServiceReview[]; total: number }> => {
        const res = await api.get(`/services/${serviceId}/reviews`, { params: { limit, offset } });
        return { reviews: res.data.reviews || [], total: res.data.total || 0 };
    },

    // Featured services
    getFeatured: async (category?: string, limit = 8): Promise<{ services: Service[] }> => {
        const res = await api.get('/services/featured', { params: { category, limit } });
        return { services: res.data.services || [] };
    }
};

export const ServiceOrderAPI = {
    // Create a new order
    create: async (data: {
        service_id: string;
        package_tier: PackageTier;
        requirements?: string;
    }): Promise<ServiceOrder> => {
        const res = await api.post('/service-orders', data);
        return res.data.order || res.data;
    },

    // Get order by ID
    getById: async (id: string): Promise<ServiceOrder> => {
        const res = await api.get(`/service-orders/${id}`);
        return res.data.order || res.data;
    },

    // Get my orders (as client)
    getMyOrders: async (status?: string): Promise<{ orders: ServiceOrder[]; total: number }> => {
        const res = await api.get('/service-orders/mine', { params: { status } });
        return { orders: res.data.orders || [], total: res.data.total || 0 };
    },

    // Get orders for my services (as freelancer)
    getReceivedOrders: async (status?: string): Promise<{ orders: ServiceOrder[]; total: number }> => {
        const res = await api.get('/service-orders/received', { params: { status } });
        return { orders: res.data.orders || [], total: res.data.total || 0 };
    },

    // Accept an order (freelancer)
    accept: async (id: string): Promise<ServiceOrder> => {
        const res = await api.post(`/service-orders/${id}/accept`);
        return res.data.order || res.data;
    },

    // Deliver an order (freelancer)
    deliver: async (id: string, data: { message?: string; attachments?: string[] }): Promise<ServiceOrder> => {
        const res = await api.post(`/service-orders/${id}/deliver`, data);
        return res.data.order || res.data;
    },

    // Request revision (client)
    requestRevision: async (id: string, feedback: string): Promise<ServiceOrder> => {
        const res = await api.post(`/service-orders/${id}/revision`, { feedback });
        return res.data.order || res.data;
    },

    // Complete/approve an order (client)
    complete: async (id: string): Promise<ServiceOrder> => {
        const res = await api.post(`/service-orders/${id}/complete`);
        return res.data.order || res.data;
    },

    // Cancel an order
    cancel: async (id: string, reason?: string): Promise<ServiceOrder> => {
        const res = await api.post(`/service-orders/${id}/cancel`, { reason });
        return res.data.order || res.data;
    },

    // Get messages for an order
    getMessages: async (orderId: string, limit = 50, offset = 0): Promise<{ messages: ServiceOrderMessage[]; total: number }> => {
        const res = await api.get(`/service-orders/${orderId}/messages`, { params: { limit, offset } });
        return { messages: res.data.messages || [], total: res.data.total || 0 };
    },

    // Send a message in an order
    sendMessage: async (orderId: string, data: { message: string; attachments?: string[] }): Promise<ServiceOrderMessage> => {
        const res = await api.post(`/service-orders/${orderId}/messages`, data);
        return res.data.message || res.data;
    },

    // Leave a review for a completed order
    leaveReview: async (orderId: string, data: { rating: number; comment?: string }): Promise<ServiceReview> => {
        const res = await api.post(`/service-orders/${orderId}/review`, data);
        return res.data.review || res.data;
    }
};
