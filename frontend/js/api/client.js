// API Client

const API = {
    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth token if available
        const token = Storage.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const error = new Error(data.error || 'Request failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (error.status === 401) {
                // Clear auth data on unauthorized
                Storage.removeToken();
                Storage.removeUser();
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            throw error;
        }
    },

    /**
     * GET request
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    /**
     * POST request
     */
    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    },

    /**
     * PUT request
     */
    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    },

    /**
     * PATCH request
     */
    patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    },

    /**
     * DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },

    // ============================================
    // Auth Endpoints
    // ============================================

    auth: {
        signup(data) {
            return API.post('/auth/signup', data);
        },

        login(data) {
            return API.post('/auth/login', data);
        },

        loginWithWallet(data) {
            return API.post('/auth/login/wallet', data);
        },

        logout() {
            return API.post('/auth/logout');
        },

        refresh() {
            return API.post('/auth/refresh');
        },

        getNonce(walletAddress) {
            return API.get(`/wallet/nonce?wallet_address=${walletAddress}`);
        },

        connectWallet(data) {
            return API.post('/wallet/connect', data);
        },

        getWallets() {
            return API.get('/wallet/me');
        },

        disconnectWallet(address) {
            return API.delete(`/wallet?address=${address}`);
        }
    },

    // ============================================
    // User & Profile Endpoints
    // ============================================

    users: {
        getMe() {
            return API.get('/users/me');
        },

        updateMe(data) {
            return API.patch('/users/me', data);
        },

        getByUsername(username) {
            return API.get(`/users/${username}`);
        }
    },

    profile: {
        getMyProfile() {
            return API.get('/profile');
        },

        update(data) {
            return API.put('/profile', data);
        },

        getById(id) {
            return API.get(`/profiles/${id}`);
        },

        search(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/profiles?${query}`);
        },

        setSkills(data) {
            return API.put('/profile/skills', data);
        },

        addSkill(data) {
            return API.post('/profile/skills', data);
        },

        removeSkill(skillId) {
            return API.delete(`/profile/skills/${skillId}`);
        },

        createPortfolioItem(data) {
            return API.post('/profile/portfolio', data);
        },

        updatePortfolioItem(id, data) {
            return API.put(`/profile/portfolio/${id}`, data);
        },

        deletePortfolioItem(id) {
            return API.delete(`/profile/portfolio/${id}`);
        }
    },

    profiles: {
        getById(id) {
            return API.get(`/profiles/${id}`);
        },

        search(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/profiles?${query}`);
        }
    },

    // ============================================
    // Jobs Endpoints
    // ============================================

    jobs: {
        create(data) {
            return API.post('/jobs', data);
        },

        getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/jobs?${query}`);
        },

        myJobs(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/jobs/mine?${query}`);
        },

        getById(id) {
            return API.get(`/jobs/${id}`);
        },

        update(id, data) {
            return API.put(`/jobs/${id}`, data);
        },

        delete(id) {
            return API.delete(`/jobs/${id}`);
        },

        publish(id) {
            return API.post(`/jobs/${id}/publish`);
        },

        close(id) {
            return API.post(`/jobs/${id}/close`);
        },

        getProposals(id, params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/jobs/${id}/proposals?${query}`);
        },

        save(id) {
            return API.post(`/jobs/${id}/save`);
        },

        unsave(id) {
            return API.delete(`/jobs/${id}/save`);
        }
    },

    // ============================================
    // Proposals Endpoints
    // ============================================

    proposals: {
        create(jobId, data) {
            return API.post(`/jobs/${jobId}/proposals`, data);
        },

        getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/proposals?${query}`);
        },

        listMine(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/proposals/mine?${query}`);
        },

        getById(id) {
            return API.get(`/proposals/${id}`);
        },

        update(id, data) {
            return API.put(`/proposals/${id}`, data);
        },

        withdraw(id) {
            return API.delete(`/proposals/${id}`);
        },

        shortlist(id) {
            return API.post(`/proposals/${id}/shortlist`);
        },

        reject(id) {
            return API.post(`/proposals/${id}/reject`);
        },

        hire(id, data) {
            return API.post(`/proposals/${id}/hire`, data);
        }
    },

    // ============================================
    // Contracts Endpoints
    // ============================================

    contracts: {
        list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/contracts?${query}`);
        },

        get(id) {
            return API.get(`/contracts/${id}`);
        },

        getById(id) {
            return API.get(`/contracts/${id}`);
        },

        addMilestone(id, data) {
            return API.post(`/contracts/${id}/milestones`, data);
        },

        complete(id) {
            return API.post(`/contracts/${id}/complete`);
        }
    },

    // ============================================
    // Milestones Endpoints
    // ============================================

    milestones: {
        create(contractId, data) {
            return API.post(`/contracts/${contractId}/milestones`, data);
        },

        getByContract(contractId) {
            return API.get(`/contracts/${contractId}/milestones`);
        },

        submit(id, data) {
            return API.post(`/milestones/${id}/submit`, data);
        },

        revision(id, data) {
            return API.post(`/milestones/${id}/revision`, data);
        },

        approve(id) {
            return API.post(`/milestones/${id}/approve`);
        }
    },

    // ============================================
    // Escrow & Payments Endpoints
    // ============================================

    escrow: {
        getStatus(contractId) {
            return API.get(`/contracts/${contractId}/escrow`);
        },

        buildFund(data) {
            return API.post('/escrow/build/fund', data);
        },

        buildRelease(data) {
            return API.post('/escrow/build/release', data);
        },

        buildRefund(data) {
            return API.post('/escrow/build/refund', data);
        }
    },

    payments: {
        getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/payments?${query}`);
        },

        getById(id) {
            return API.get(`/payments/${id}`);
        },

        verify(txSignature, data) {
            return API.post(`/payments/verify/${txSignature}`, data);
        }
    },

    // ============================================
    // Messages Endpoints
    // ============================================

    conversations: {
        getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/conversations?${query}`);
        },

        getById(id) {
            return API.get(`/conversations/${id}`);
        },

        getMessages(id, params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/conversations/${id}/messages?${query}`);
        },

        sendMessage(id, data) {
            return API.post(`/conversations/${id}/messages`, data);
        },

        markAsRead(id) {
            return API.post(`/conversations/${id}/read`);
        }
    },

    // ============================================
    // Reviews Endpoints
    // ============================================

    reviews: {
        create(data) {
            return API.post('/reviews', data);
        },

        getById(id) {
            return API.get(`/reviews/${id}`);
        },

        getByContract(contractId) {
            return API.get(`/contracts/${contractId}/reviews`);
        },

        getByUser(userId, params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/users/${userId}/reviews?${query}`);
        }
    },

    // ============================================
    // Notifications Endpoints
    // ============================================

    notifications: {
        list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/notifications?${query}`);
        },

        markAsRead(id) {
            return API.post(`/notifications/${id}/read`);
        },

        markAllAsRead() {
            return API.post('/notifications/read-all');
        },

        getUnreadCount() {
            return API.get('/notifications/unread-count');
        }
    },

    // ============================================
    // Lookup Endpoints
    // ============================================

    skills: {
        getAll() {
            return API.get('/skills');
        }
    },

    categories: {
        getAll() {
            return API.get('/categories');
        }
    }
};
