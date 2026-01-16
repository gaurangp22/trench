// Landing Page JavaScript

const LandingPage = {
    /**
     * Initialize landing page
     */
    init() {
        this.initTabs();
        this.initWalletButton();
        this.initWalletModal();
        this.updateUIState();

        // Listen for wallet events
        window.addEventListener('wallet:connected', () => this.updateUIState());
        window.addEventListener('wallet:disconnected', () => this.updateUIState());
        window.addEventListener('wallet:accountChanged', () => this.updateUIState());
    },

    /**
     * Initialize tab functionality
     */
    initTabs() {
        const tabs = DOM.$$('.tab');
        const contents = DOM.$$('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab + '-content';

                // Update tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                contents.forEach(content => {
                    content.classList.toggle('active', content.id === targetId);
                });
            });
        });
    },

    /**
     * Initialize wallet connect button
     */
    initWalletButton() {
        const connectBtn = DOM.$('#connect-wallet-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                if (Wallet.isConnected()) {
                    this.showWalletMenu();
                } else {
                    Modal.open('wallet-modal');
                }
            });
        }
    },

    /**
     * Initialize wallet modal
     */
    initWalletModal() {
        const walletOptions = DOM.$$('.wallet-option');

        walletOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const walletType = option.dataset.wallet;

                try {
                    // Show loading state
                    option.classList.add('loading');

                    await Wallet.connect(walletType);

                    Modal.close('wallet-modal');
                    Toast.success('Wallet connected successfully!');
                } catch (error) {
                    console.error('Connection error:', error);
                    Toast.error(error.message || 'Failed to connect wallet');
                } finally {
                    option.classList.remove('loading');
                }
            });
        });
    },

    /**
     * Update UI based on wallet/auth state
     */
    async updateUIState() {
        const connectBtn = DOM.$('#connect-wallet-btn');
        const walletStatus = DOM.$('#wallet-status');
        const navActions = DOM.$('.nav-actions');

        if (Wallet.isConnected()) {
            // Show wallet status
            DOM.hide(connectBtn);
            DOM.show(walletStatus);

            // Update balance
            try {
                const balance = await Wallet.getBalance();
                const balanceEl = DOM.$('.wallet-balance', walletStatus);
                if (balanceEl) {
                    balanceEl.textContent = DOM.formatSOL(balance);
                }
            } catch (error) {
                console.error('Balance error:', error);
            }

            // Update address
            const addressEl = DOM.$('.wallet-address', walletStatus);
            if (addressEl) {
                addressEl.textContent = DOM.formatWalletAddress(Wallet.publicKey);
            }

            // Update connect button text
            if (connectBtn) {
                connectBtn.textContent = DOM.formatWalletAddress(Wallet.publicKey);
            }
        } else {
            // Show connect button
            DOM.show(connectBtn);
            DOM.hide(walletStatus);

            if (connectBtn) {
                connectBtn.textContent = 'Connect Wallet';
            }
        }

        // Update auth buttons based on login state
        if (Storage.isAuthenticated()) {
            const user = Storage.getUser();
            const loginBtn = DOM.$('.nav-actions a[href*="login"]');
            const signupBtn = DOM.$('.nav-actions a[href*="signup"]');

            if (loginBtn) DOM.hide(loginBtn);
            if (signupBtn) {
                signupBtn.textContent = 'Dashboard';
                signupBtn.href = user.is_freelancer
                    ? '/pages/freelancer/dashboard.html'
                    : '/pages/client/dashboard.html';
            }
        }
    },

    /**
     * Show wallet menu (for connected wallet)
     */
    showWalletMenu() {
        // Simple disconnect for now
        Modal.confirm({
            title: 'Wallet Connected',
            message: `Connected: ${DOM.formatWalletAddress(Wallet.publicKey)}\n\nDo you want to disconnect?`,
            confirmText: 'Disconnect',
            cancelText: 'Close',
            dangerous: true
        }).then(confirmed => {
            if (confirmed) {
                Wallet.disconnect();
                Toast.info('Wallet disconnected');
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LandingPage.init();

    // Try to reconnect wallet
    Wallet.tryReconnect();
});
