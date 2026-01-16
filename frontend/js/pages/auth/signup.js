// Signup Page JavaScript

const SignupPage = {
    currentStep: 1,
    totalSteps: 3,
    walletConnected: false,
    formData: {},

    /**
     * Initialize signup page
     */
    init() {
        Toast.init();

        // Check URL params for role preset
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');

        if (role === 'freelancer') {
            document.querySelector('input[name="is_freelancer"]').checked = true;
        } else if (role === 'client') {
            document.querySelector('input[name="is_client"]').checked = true;
        }

        // Handle form submission
        const form = document.getElementById('signup-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Listen for wallet events
        window.addEventListener('wallet:connected', (e) => {
            this.handleWalletConnected(e.detail);
        });

        window.addEventListener('wallet:disconnected', () => {
            this.handleWalletDisconnected();
        });
    },

    /**
     * Go to next step
     */
    nextStep() {
        // Validate current step
        if (!this.validateStep(this.currentStep)) {
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    },

    /**
     * Go to previous step
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    },

    /**
     * Show specific step
     */
    showStep(step) {
        const steps = document.querySelectorAll('.form-step');
        steps.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.step) === step);
        });
    },

    /**
     * Validate step before proceeding
     */
    validateStep(step) {
        const form = document.getElementById('signup-form');

        switch (step) {
            case 1:
                // Check at least one role is selected
                const isFreelancer = form.querySelector('input[name="is_freelancer"]').checked;
                const isClient = form.querySelector('input[name="is_client"]').checked;

                if (!isFreelancer && !isClient) {
                    Toast.error('Please select at least one role');
                    return false;
                }
                return true;

            case 2:
                // Validate email, username, password
                const email = form.querySelector('input[name="email"]').value;
                const username = form.querySelector('input[name="username"]').value;
                const password = form.querySelector('input[name="password"]').value;

                if (!email || !this.isValidEmail(email)) {
                    Toast.error('Please enter a valid email address');
                    return false;
                }

                if (!username || username.length < 3) {
                    Toast.error('Username must be at least 3 characters');
                    return false;
                }

                if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                    Toast.error('Username can only contain letters, numbers, underscores, and hyphens');
                    return false;
                }

                if (!password || password.length < 8) {
                    Toast.error('Password must be at least 8 characters');
                    return false;
                }

                if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                    Toast.error('Password must include uppercase, lowercase, and numbers');
                    return false;
                }

                return true;

            case 3:
                // Wallet is optional
                return true;

            default:
                return true;
        }
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Connect wallet
     */
    async connectWallet(walletType) {
        try {
            await Wallet.connect(walletType);
            // wallet:connected event will handle the UI update
        } catch (error) {
            Toast.error(error.message || 'Failed to connect wallet');
        }
    },

    /**
     * Handle wallet connected
     */
    handleWalletConnected(detail) {
        this.walletConnected = true;

        // Update hidden input
        document.getElementById('wallet-address-input').value = detail.publicKey;

        // Update UI
        DOM.hide(document.getElementById('wallet-connect-section'));
        DOM.show(document.getElementById('wallet-connected-section'));

        // Show connected address
        const addressEl = document.getElementById('connected-wallet-address');
        addressEl.textContent = DOM.formatWalletAddress(detail.publicKey);

        Toast.success('Wallet connected!');
    },

    /**
     * Disconnect wallet
     */
    disconnectWallet() {
        Wallet.disconnect();
    },

    /**
     * Handle wallet disconnected
     */
    handleWalletDisconnected() {
        this.walletConnected = false;

        // Clear hidden input
        document.getElementById('wallet-address-input').value = '';

        // Update UI
        DOM.show(document.getElementById('wallet-connect-section'));
        DOM.hide(document.getElementById('wallet-connected-section'));
    },

    /**
     * Skip wallet connection
     */
    skipWallet() {
        document.getElementById('wallet-address-input').value = '';
        this.handleSubmit(new Event('submit'));
    },

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();

        const form = document.getElementById('signup-form');
        const submitBtn = document.getElementById('signup-submit-btn');
        const originalText = submitBtn.textContent;

        // Collect form data
        const data = {
            email: form.querySelector('input[name="email"]').value,
            username: form.querySelector('input[name="username"]').value,
            password: form.querySelector('input[name="password"]').value,
            is_freelancer: form.querySelector('input[name="is_freelancer"]').checked,
            is_client: form.querySelector('input[name="is_client"]').checked,
            wallet_address: form.querySelector('input[name="wallet_address"]').value || undefined
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            const response = await API.auth.signup(data);

            // Save auth data
            Storage.setToken(response.token);
            Storage.setUser(response.user);

            Toast.success('Account created successfully!');

            // Redirect to appropriate dashboard
            setTimeout(() => {
                if (response.user.is_freelancer) {
                    window.location.href = '/pages/freelancer/dashboard.html';
                } else {
                    window.location.href = '/pages/client/dashboard.html';
                }
            }, 1000);

        } catch (error) {
            Toast.error(error.message || 'Failed to create account');

            // Handle specific errors
            if (error.data?.details?.errors) {
                const errors = error.data.details.errors;
                Object.entries(errors).forEach(([field, message]) => {
                    Toast.error(`${field}: ${message}`);
                });
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SignupPage.init();
});
