// Freelancer Dashboard Page JavaScript

const FreelancerDashboard = {
    /**
     * Initialize dashboard
     */
    init() {
        Toast.init();
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardData();
        this.initWalletStatus();
    },

    /**
     * Check authentication
     */
    checkAuth() {
        if (!Storage.isAuthenticated()) {
            window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        const user = Storage.getUser();
        if (!user.is_freelancer) {
            window.location.href = '/pages/client/dashboard.html';
            return;
        }

        // Update user name in welcome
        const userName = user.username || user.email.split('@')[0];
        document.getElementById('user-name').textContent = userName;

        // Update avatar
        const avatarInitial = userName.charAt(0).toUpperCase();
        document.getElementById('user-avatar').textContent = avatarInitial;
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // User dropdown toggle
        document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.dropdown').classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            document.querySelector('.dropdown')?.classList.remove('active');
        });
    },

    /**
     * Initialize wallet status
     */
    async initWalletStatus() {
        const user = Storage.getUser();
        const walletAddressEl = document.getElementById('wallet-address');
        const walletIconEl = document.querySelector('.wallet-icon');

        if (user.primary_wallet_address) {
            walletAddressEl.textContent = Wallet.formatAddress(user.primary_wallet_address);
            walletIconEl.style.color = 'var(--success)';
        } else {
            walletAddressEl.textContent = 'No wallet connected';
            walletIconEl.style.color = 'var(--text-secondary)';
        }
    },

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Load profile stats
            await this.loadProfileStats();

            // Load active contracts
            await this.loadActiveContracts();

            // Load pending proposals
            await this.loadPendingProposals();

            // Load recent activity
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    },

    /**
     * Load profile stats
     */
    async loadProfileStats() {
        try {
            const profile = await API.profile.getMyProfile();

            document.getElementById('total-earnings').textContent =
                `${profile.profile?.total_earnings_sol || 0} SOL`;

            const rating = profile.profile?.average_rating || 0;
            document.getElementById('avg-rating').textContent =
                rating > 0 ? `${parseFloat(rating).toFixed(1)}/5` : '--';
        } catch (error) {
            console.error('Failed to load profile stats:', error);
        }
    },

    /**
     * Load active contracts
     */
    async loadActiveContracts() {
        try {
            const response = await API.contracts.list({ status: 'active', limit: 5 });
            const container = document.getElementById('active-contracts-list');

            if (!response.contracts || response.contracts.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No active contracts</p>
                        <a href="/pages/freelancer/jobs.html" class="btn btn-outline">Browse Jobs</a>
                    </div>
                `;
                document.getElementById('active-contracts').textContent = '0';
                document.getElementById('pending-payments').textContent = '0 SOL';
                return;
            }

            document.getElementById('active-contracts').textContent = response.contracts.length;

            // Calculate pending payments
            let pendingPayments = 0;
            response.contracts.forEach(contract => {
                pendingPayments += parseFloat(contract.escrow_amount_sol || 0) - parseFloat(contract.released_amount_sol || 0);
            });
            document.getElementById('pending-payments').textContent = `${pendingPayments.toFixed(2)} SOL`;

            container.innerHTML = response.contracts.map(contract => `
                <div class="contract-item">
                    <div class="item-info">
                        <div class="item-title">${contract.title}</div>
                        <div class="item-meta">${contract.total_amount_sol} SOL - ${contract.client_username || 'Client'}</div>
                    </div>
                    <span class="item-status status-active">Active</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load contracts:', error);
        }
    },

    /**
     * Load pending proposals
     */
    async loadPendingProposals() {
        try {
            const response = await API.proposals.listMine({ status: 'submitted', limit: 5 });
            const container = document.getElementById('pending-proposals-list');

            if (!response.proposals || response.proposals.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No pending proposals</p>
                        <a href="/pages/freelancer/jobs.html" class="btn btn-outline">Find Jobs</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = response.proposals.map(proposal => `
                <div class="proposal-item">
                    <div class="item-info">
                        <div class="item-title">${proposal.job_title}</div>
                        <div class="item-meta">${proposal.proposed_amount_sol || proposal.proposed_rate_sol} SOL</div>
                    </div>
                    <span class="item-status status-${proposal.status}">${this.formatStatus(proposal.status)}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load proposals:', error);
        }
    },

    /**
     * Load recent activity
     */
    async loadRecentActivity() {
        try {
            const response = await API.notifications.list({ limit: 5 });
            const container = document.getElementById('recent-activity');

            if (!response.notifications || response.notifications.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No recent activity</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = response.notifications.map(notification => `
                <div class="activity-item">
                    <div class="activity-icon">${this.getNotificationIcon(notification.type)}</div>
                    <div class="activity-content">
                        <div class="activity-text">${notification.title}</div>
                        <div class="activity-time">${this.formatTime(notification.created_at)}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load activity:', error);
            // Show empty state on error
            document.getElementById('recent-activity').innerHTML = `
                <div class="empty-state">
                    <p>No recent activity</p>
                </div>
            `;
        }
    },

    /**
     * Format status for display
     */
    formatStatus(status) {
        const statusMap = {
            'submitted': 'Submitted',
            'viewed': 'Viewed',
            'shortlisted': 'Shortlisted',
            'accepted': 'Accepted',
            'rejected': 'Rejected',
            'withdrawn': 'Withdrawn'
        };
        return statusMap[status] || status;
    },

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            'proposal_accepted': '&#9989;',
            'proposal_rejected': '&#10060;',
            'payment_received': '&#128176;',
            'new_message': '&#128172;',
            'milestone_approved': '&#9989;',
            'default': '&#128276;'
        };
        return icons[type] || icons.default;
    },

    /**
     * Format time for display
     */
    formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return date.toLocaleDateString();
    },

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            await API.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Storage.clearAuth();
            window.location.href = '/';
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    FreelancerDashboard.init();
});
