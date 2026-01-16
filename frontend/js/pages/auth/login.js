// Login Page JavaScript

const LoginPage = {
    /**
     * Initialize login page
     */
    init() {
        Toast.init();

        // Handle form submission
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Check for redirect parameter
        this.redirectUrl = new URLSearchParams(window.location.search).get('redirect') || null;

        // If already logged in, redirect
        if (Storage.isAuthenticated()) {
            this.redirectToApp();
        }
    },

    /**
     * Handle email/password login
     */
    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = document.getElementById('login-submit-btn');
        const originalText = submitBtn.textContent;

        const data = {
            email: form.querySelector('input[name="email"]').value,
            password: form.querySelector('input[name="password"]').value
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            const response = await API.auth.login(data);

            // Save auth data
            Storage.setToken(response.token);
            Storage.setUser(response.user);

            Toast.success('Login successful!');

            // Redirect
            setTimeout(() => this.redirectToApp(response.user), 1000);

        } catch (error) {
            Toast.error(error.message || 'Invalid credentials');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    /**
     * Login with wallet
     */
    async loginWithWallet(walletType) {
        try {
            // Connect wallet first
            Toast.info('Connecting wallet...');
            const { publicKey } = await Wallet.connect(walletType);

            // Get nonce from server
            Toast.info('Getting authentication challenge...');
            const nonceResponse = await API.auth.getNonce(publicKey);

            // Sign the message
            Toast.info('Please sign the message in your wallet...');
            const signedData = await Wallet.signMessage(nonceResponse.message);

            // Send to server for verification
            Toast.info('Verifying signature...');
            const response = await API.auth.loginWithWallet({
                wallet_address: publicKey,
                signature: signedData.signature,
                message: signedData.message
            });

            // Save auth data
            Storage.setToken(response.token);
            Storage.setUser(response.user);

            Toast.success('Login successful!');

            // Redirect
            setTimeout(() => this.redirectToApp(response.user), 1000);

        } catch (error) {
            console.error('Wallet login error:', error);

            if (error.message?.includes('not registered')) {
                Toast.error('Wallet not registered. Please sign up first.');
                setTimeout(() => {
                    window.location.href = 'signup.html';
                }, 2000);
            } else {
                Toast.error(error.message || 'Failed to login with wallet');
            }
        }
    },

    /**
     * Redirect to appropriate dashboard
     */
    redirectToApp(user = null) {
        if (this.redirectUrl) {
            window.location.href = this.redirectUrl;
            return;
        }

        user = user || Storage.getUser();

        if (user?.is_freelancer) {
            window.location.href = '/pages/freelancer/dashboard.html';
        } else if (user?.is_client) {
            window.location.href = '/pages/client/dashboard.html';
        } else {
            window.location.href = '/';
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LoginPage.init();
});
