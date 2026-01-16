// Client Contracts Page JavaScript

const ContractsPage = {
    contracts: [],
    currentContract: null,
    currentPage: 1,
    pageSize: 10,
    totalContracts: 0,

    /**
     * Initialize contracts page
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
        await this.loadContracts();

        // Check if specific contract ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const contractId = urlParams.get('id');
        if (contractId) {
            await this.showContractDetail(contractId);
        }
    },

    /**
     * Setup initial UI
     */
    setupUI() {
        const user = Storage.getUser();
        if (user) {
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

        // Status filter
        document.getElementById('status-filter').addEventListener('change', () => {
            this.currentPage = 1;
            this.loadContracts();
        });

        // Modal close buttons
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('fund-modal-close').addEventListener('click', () => this.closeFundModal());
        document.getElementById('cancel-fund').addEventListener('click', () => this.closeFundModal());
        document.getElementById('confirm-fund').addEventListener('click', () => this.fundEscrow());

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeModal();
                this.closeFundModal();
            });
        });
    },

    /**
     * Load contracts from API
     */
    async loadContracts() {
        const status = document.getElementById('status-filter').value;
        const container = document.getElementById('contracts-list');
        const emptyState = document.getElementById('empty-state');

        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading contracts...</p>
            </div>
        `;
        emptyState.classList.add('hidden');

        try {
            const response = await API.contracts.list({
                role: 'client',
                status: status,
                limit: this.pageSize,
                offset: (this.currentPage - 1) * this.pageSize
            });

            this.contracts = response.contracts || [];
            this.totalContracts = response.total || 0;

            if (this.contracts.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
            } else {
                this.renderContracts();
            }

            this.renderPagination();

        } catch (error) {
            console.error('Error loading contracts:', error);
            container.innerHTML = `
                <div class="error-state">
                    <p>Failed to load contracts. Please try again.</p>
                    <button class="btn btn-outline" onclick="ContractsPage.loadContracts()">Retry</button>
                </div>
            `;
            Toast.error('Failed to load contracts');
        }
    },

    /**
     * Render contracts list
     */
    renderContracts() {
        const container = document.getElementById('contracts-list');

        container.innerHTML = this.contracts.map(contract => {
            const milestonesCompleted = (contract.milestones || []).filter(m => m.status === 'paid').length;
            const totalMilestones = (contract.milestones || []).length;
            const progress = totalMilestones > 0 ? (milestonesCompleted / totalMilestones) * 100 : 0;

            return `
                <div class="contract-card" onclick="ContractsPage.showContractDetail('${contract.id}')">
                    <div class="contract-card-header">
                        <h3 class="contract-title">${contract.title}</h3>
                        <span class="contract-status ${contract.status}">${contract.status}</span>
                    </div>
                    <div class="contract-card-body">
                        <div class="contract-freelancer">
                            <div class="freelancer-avatar">${(contract.freelancer?.username || 'F')[0].toUpperCase()}</div>
                            <div class="freelancer-info">
                                <h4>${contract.freelancer?.username || 'Freelancer'}</h4>
                                <p>${contract.payment_type === 'hourly' ? 'Hourly' : 'Fixed Price'}</p>
                            </div>
                        </div>
                        <div class="contract-amount">
                            <span class="amount">${parseFloat(contract.total_amount_sol).toFixed(2)} SOL</span>
                            <span class="label">Contract Value</span>
                        </div>
                    </div>
                    ${totalMilestones > 0 ? `
                        <div class="milestones-progress">
                            <div class="progress-label">
                                <span>Milestones</span>
                                <span>${milestonesCompleted} of ${totalMilestones} completed</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="contract-card-footer">
                        <span class="contract-date">Started: ${this.formatDate(contract.started_at || contract.created_at)}</span>
                        <div class="contract-actions">
                            ${contract.status === 'pending' ? `
                                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); ContractsPage.openFundModal('${contract.id}')">
                                    Fund Escrow
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); window.location.href='/pages/shared/messages.html?contract=${contract.id}'">
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const container = document.getElementById('pagination');
        const totalPages = Math.ceil(this.totalContracts / this.pageSize);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="ContractsPage.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="ContractsPage.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="ContractsPage.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `;

        container.innerHTML = html;
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
        this.currentPage = page;
        this.loadContracts();
    },

    /**
     * Show contract detail modal
     */
    async showContractDetail(contractId) {
        try {
            const response = await API.contracts.get(contractId);
            this.currentContract = response;

            const contract = response.contract;
            const milestones = response.milestones || [];
            const escrow = response.escrow;

            const modalBody = document.getElementById('modal-body');
            document.getElementById('modal-title').textContent = contract.title;

            modalBody.innerHTML = `
                <div class="contract-detail">
                    <!-- Contract Info -->
                    <div class="detail-section">
                        <h3>Contract Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Status</span>
                            <span class="detail-value"><span class="contract-status ${contract.status}">${contract.status}</span></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Freelancer</span>
                            <span class="detail-value">${contract.freelancer?.username || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Contract Value</span>
                            <span class="detail-value">${parseFloat(contract.total_amount_sol).toFixed(2)} SOL</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Type</span>
                            <span class="detail-value">${contract.payment_type === 'hourly' ? 'Hourly' : 'Fixed Price'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Started</span>
                            <span class="detail-value">${this.formatDate(contract.started_at || contract.created_at)}</span>
                        </div>
                    </div>

                    <!-- Escrow Status -->
                    ${escrow ? `
                        <div class="detail-section">
                            <h3>Escrow Status</h3>
                            <div class="escrow-status">
                                <div class="escrow-row">
                                    <span class="escrow-label">Status</span>
                                    <span class="escrow-value">${escrow.status}</span>
                                </div>
                                <div class="escrow-row">
                                    <span class="escrow-label">Total Amount</span>
                                    <span class="escrow-value">${parseFloat(escrow.total_amount_sol).toFixed(2)} SOL</span>
                                </div>
                                <div class="escrow-row">
                                    <span class="escrow-label">Funded</span>
                                    <span class="escrow-value highlight">${parseFloat(escrow.funded_amount_sol).toFixed(2)} SOL</span>
                                </div>
                                <div class="escrow-row">
                                    <span class="escrow-label">Released</span>
                                    <span class="escrow-value">${parseFloat(escrow.released_amount_sol).toFixed(2)} SOL</span>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="detail-section">
                            <h3>Escrow Status</h3>
                            <div class="alert alert-warning">
                                Escrow has not been created yet. Fund the escrow to begin work.
                            </div>
                            <button class="btn btn-primary" onclick="ContractsPage.openFundModal('${contract.id}')">
                                Fund Escrow
                            </button>
                        </div>
                    `}

                    <!-- Milestones -->
                    <div class="detail-section">
                        <h3>Milestones</h3>
                        ${milestones.length > 0 ? `
                            <div class="milestones-list">
                                ${milestones.map((m, i) => `
                                    <div class="milestone-item">
                                        <div class="milestone-header">
                                            <h4 class="milestone-title">${i + 1}. ${m.title}</h4>
                                            <span class="milestone-status ${m.status}">${m.status.replace('_', ' ')}</span>
                                        </div>
                                        ${m.description ? `<p class="milestone-description">${m.description}</p>` : ''}
                                        <div class="milestone-footer">
                                            <span class="milestone-amount">${parseFloat(m.amount_sol).toFixed(2)} SOL</span>
                                            <div class="milestone-actions">
                                                ${m.status === 'submitted' ? `
                                                    <button class="btn btn-sm btn-success" onclick="ContractsPage.approveMilestone('${m.id}')">
                                                        Approve
                                                    </button>
                                                    <button class="btn btn-sm btn-outline" onclick="ContractsPage.requestRevision('${m.id}')">
                                                        Request Revision
                                                    </button>
                                                ` : ''}
                                                ${m.status === 'approved' ? `
                                                    <button class="btn btn-sm btn-primary" onclick="ContractsPage.releaseMilestonePayment('${m.id}')">
                                                        Release Payment
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-muted">No milestones defined</p>'}
                    </div>
                </div>
            `;

            document.getElementById('contract-modal').classList.add('active');

        } catch (error) {
            console.error('Error loading contract:', error);
            Toast.error('Failed to load contract details');
        }
    },

    /**
     * Close contract detail modal
     */
    closeModal() {
        document.getElementById('contract-modal').classList.remove('active');
        this.currentContract = null;

        // Remove contract ID from URL
        const url = new URL(window.location);
        url.searchParams.delete('id');
        window.history.replaceState({}, '', url);
    },

    /**
     * Open fund escrow modal
     */
    openFundModal(contractId) {
        const contract = this.contracts.find(c => c.id === contractId) || this.currentContract?.contract;
        if (!contract) return;

        const amount = parseFloat(contract.total_amount_sol);
        const fee = amount * 0.05;
        const total = amount + fee;

        document.getElementById('fund-amount').textContent = amount.toFixed(2) + ' SOL';
        document.getElementById('platform-fee').textContent = fee.toFixed(2) + ' SOL';
        document.getElementById('total-amount').textContent = total.toFixed(2) + ' SOL';

        document.getElementById('confirm-fund').dataset.contractId = contractId;
        document.getElementById('fund-modal').classList.add('active');
    },

    /**
     * Close fund modal
     */
    closeFundModal() {
        document.getElementById('fund-modal').classList.remove('active');
    },

    /**
     * Fund escrow
     */
    async fundEscrow() {
        const contractId = document.getElementById('confirm-fund').dataset.contractId;
        const btn = document.getElementById('confirm-fund');
        const originalText = btn.textContent;

        try {
            btn.disabled = true;
            btn.textContent = 'Processing...';

            Toast.info('Building transaction...');

            // Build the fund transaction
            const txResponse = await API.escrow.buildFund(contractId);

            Toast.info('Please sign the transaction in your wallet...');

            // Connect wallet if needed
            if (!Wallet.isConnected()) {
                await Wallet.connect();
            }

            // Sign and send transaction
            const signature = await Wallet.signAndSendTransaction(txResponse.transaction);

            Toast.info('Verifying transaction...');

            // Verify the transaction
            await API.payments.verify(signature);

            Toast.success('Escrow funded successfully!');
            this.closeFundModal();
            this.closeModal();
            await this.loadContracts();

        } catch (error) {
            console.error('Error funding escrow:', error);
            Toast.error(error.message || 'Failed to fund escrow');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    /**
     * Approve milestone
     */
    async approveMilestone(milestoneId) {
        try {
            Toast.info('Approving milestone...');
            await API.milestones.approve(milestoneId);
            Toast.success('Milestone approved!');

            // Refresh contract detail
            if (this.currentContract) {
                await this.showContractDetail(this.currentContract.contract.id);
            }
        } catch (error) {
            console.error('Error approving milestone:', error);
            Toast.error(error.message || 'Failed to approve milestone');
        }
    },

    /**
     * Request revision for milestone
     */
    async requestRevision(milestoneId) {
        const notes = prompt('Please provide revision notes:');
        if (!notes) return;

        try {
            Toast.info('Requesting revision...');
            await API.milestones.revision(milestoneId, { notes });
            Toast.success('Revision requested');

            // Refresh contract detail
            if (this.currentContract) {
                await this.showContractDetail(this.currentContract.contract.id);
            }
        } catch (error) {
            console.error('Error requesting revision:', error);
            Toast.error(error.message || 'Failed to request revision');
        }
    },

    /**
     * Release milestone payment
     */
    async releaseMilestonePayment(milestoneId) {
        try {
            Toast.info('Building release transaction...');

            // Build the release transaction
            const txResponse = await API.escrow.buildRelease(milestoneId);

            Toast.info('Please sign the transaction in your wallet...');

            // Connect wallet if needed
            if (!Wallet.isConnected()) {
                await Wallet.connect();
            }

            // Sign and send transaction
            const signature = await Wallet.signAndSendTransaction(txResponse.transaction);

            Toast.info('Verifying transaction...');

            // Verify the transaction
            await API.payments.verify(signature);

            Toast.success('Payment released successfully!');

            // Refresh contract detail
            if (this.currentContract) {
                await this.showContractDetail(this.currentContract.contract.id);
            }
            await this.loadContracts();

        } catch (error) {
            console.error('Error releasing payment:', error);
            Toast.error(error.message || 'Failed to release payment');
        }
    },

    /**
     * Format date
     */
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ContractsPage.init();
});
