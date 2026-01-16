// Client Dashboard JavaScript

const ClientDashboard = {
    /**
     * Initialize dashboard
     */
    async init() {
        Toast.init();

        // Check authentication
        if (!Storage.isAuthenticated()) {
            window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        this.setupUI();
        this.setupEventListeners();
        await this.loadDashboardData();
    },

    /**
     * Setup initial UI
     */
    setupUI() {
        const user = Storage.getUser();
        if (user) {
            document.getElementById('user-name').textContent = user.username || 'Client';
            document.getElementById('user-avatar').textContent = (user.username || 'U')[0].toUpperCase();
        }

        // Setup wallet display
        if (user?.primary_wallet_address) {
            const shortAddress = user.primary_wallet_address.substring(0, 4) + '...' +
                               user.primary_wallet_address.substring(user.primary_wallet_address.length - 4);
            document.getElementById('wallet-address').textContent = shortAddress;
            document.getElementById('wallet-status').classList.add('connected');
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            Storage.clear();
            window.location.href = '/pages/auth/login.html';
        });

        // Dropdown toggle
        document.getElementById('user-menu-btn').addEventListener('click', () => {
            document.getElementById('user-dropdown').classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.getElementById('user-dropdown').classList.remove('active');
            }
        });
    },

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Load contracts
            const contractsResp = await API.contracts.list({ role: 'client', limit: 5 });
            this.renderContracts(contractsResp.contracts || []);

            // Count active contracts
            const activeContracts = (contractsResp.contracts || []).filter(c => c.status === 'active');
            document.getElementById('active-contracts').textContent = activeContracts.length;

            // Load jobs
            const jobsResp = await API.jobs.myJobs({ limit: 5 });
            this.renderJobs(jobsResp.jobs || []);

            // Count active jobs
            const activeJobs = (jobsResp.jobs || []).filter(j => j.status === 'open');
            document.getElementById('active-jobs').textContent = activeJobs.length;

            // Calculate escrow balance (sum of escrow amounts from active contracts)
            const escrowBalance = activeContracts.reduce((sum, c) => sum + parseFloat(c.escrow_amount_sol || 0), 0);
            document.getElementById('escrow-balance').textContent = escrowBalance.toFixed(2) + ' SOL';

            // Load proposals for jobs
            let proposalCount = 0;
            for (const job of (jobsResp.jobs || []).slice(0, 5)) {
                if (job.proposal_count) {
                    proposalCount += job.proposal_count;
                }
            }
            document.getElementById('proposal-count').textContent = proposalCount;

        } catch (error) {
            console.error('Error loading dashboard:', error);
            Toast.error('Failed to load dashboard data');
        }
    },

    /**
     * Render contracts list
     */
    renderContracts(contracts) {
        const container = document.getElementById('active-contracts-list');

        if (!contracts || contracts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No active contracts</p>
                    <a href="/pages/client/jobs/new.html" class="btn btn-outline">Post a Job</a>
                </div>
            `;
            return;
        }

        container.innerHTML = contracts.map(contract => `
            <a href="/pages/client/contracts.html?id=${contract.id}" class="list-item">
                <div class="list-item-content">
                    <h4>${contract.title}</h4>
                    <p class="text-muted">${contract.freelancer?.username || 'Freelancer'}</p>
                </div>
                <div class="list-item-meta">
                    <span class="badge badge-${contract.status}">${contract.status}</span>
                    <span class="amount">${parseFloat(contract.total_amount_sol).toFixed(2)} SOL</span>
                </div>
            </a>
        `).join('');
    },

    /**
     * Render jobs list
     */
    renderJobs(jobs) {
        const container = document.getElementById('my-jobs-list');

        if (!jobs || jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No jobs posted yet</p>
                    <a href="/pages/client/jobs/new.html" class="btn btn-outline">Post Your First Job</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Proposals</th>
                        <th>Budget</th>
                        <th>Posted</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobs.map(job => `
                        <tr class="clickable" onclick="window.location.href='/pages/client/jobs.html?id=${job.id}'">
                            <td>${job.title}</td>
                            <td><span class="badge badge-${job.status}">${job.status}</span></td>
                            <td>${job.proposal_count || 0}</td>
                            <td>${this.formatBudget(job)}</td>
                            <td>${this.formatDate(job.posted_at || job.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Format budget display
     */
    formatBudget(job) {
        if (job.payment_type === 'hourly') {
            const min = parseFloat(job.hourly_rate_min_sol || 0);
            const max = parseFloat(job.hourly_rate_max_sol || 0);
            return `${min.toFixed(2)} - ${max.toFixed(2)} SOL/hr`;
        }
        const min = parseFloat(job.budget_min_sol || 0);
        const max = parseFloat(job.budget_max_sol || 0);
        return `${min.toFixed(2)} - ${max.toFixed(2)} SOL`;
    },

    /**
     * Format date
     */
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ClientDashboard.init();
});
