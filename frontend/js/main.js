// TrenchJobs Main JavaScript

const App = {
    /**
     * Initialize the application
     */
    init() {
        // Initialize components
        Toast.init();
        Modal.init();

        // Initialize mobile menu
        this.initMobileMenu();

        // Initialize global event listeners
        this.initEventListeners();

        // Check auth status
        this.checkAuthStatus();

        console.log('TrenchJobs initialized');
    },

    /**
     * Initialize mobile menu
     */
    initMobileMenu() {
        const menuBtn = DOM.$('.mobile-menu-btn');
        const navLinks = DOM.$('.nav-links');
        const navActions = DOM.$('.nav-actions');

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                menuBtn.classList.toggle('active');
                navLinks?.classList.toggle('show');
                navActions?.classList.toggle('show');
            });
        }
    },

    /**
     * Initialize global event listeners
     */
    initEventListeners() {
        // Handle auth logout event
        window.addEventListener('auth:logout', () => {
            Storage.removeToken();
            Storage.removeUser();
            Toast.info('You have been logged out');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        });

        // Handle wallet events
        window.addEventListener('wallet:connected', (e) => {
            console.log('Wallet connected:', e.detail);
        });

        window.addEventListener('wallet:disconnected', () => {
            console.log('Wallet disconnected');
        });

        // Handle link clicks for SPA-like navigation (optional)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-spa]');
            if (link) {
                e.preventDefault();
                // Implement SPA navigation if needed
                window.location.href = link.href;
            }
        });

        // Handle form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.dataset.async === 'true') {
                e.preventDefault();
                this.handleAsyncForm(form);
            }
        });
    },

    /**
     * Check authentication status
     */
    checkAuthStatus() {
        if (Storage.isAuthenticated()) {
            const user = Storage.getUser();

            // Update navigation based on user role
            this.updateNavigation(user);

            // Optionally refresh token
            this.refreshTokenIfNeeded();
        }
    },

    /**
     * Update navigation based on user role
     */
    updateNavigation(user) {
        const navActions = DOM.$('.nav-actions');
        if (!navActions) return;

        // Check if we're on a protected page
        const path = window.location.pathname;
        const isProtectedPage = path.includes('/client/') || path.includes('/freelancer/');

        if (isProtectedPage && !user) {
            // Redirect to login
            window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(path);
        }
    },

    /**
     * Refresh token if needed
     */
    async refreshTokenIfNeeded() {
        try {
            const response = await API.auth.refresh();
            if (response.token) {
                Storage.setToken(response.token);
            }
        } catch (error) {
            // Token refresh failed, might need to re-login
            console.error('Token refresh failed:', error);
        }
    },

    /**
     * Handle async form submissions
     */
    async handleAsyncForm(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn?.textContent;

        try {
            // Disable form
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Loading...';
            }

            const formData = DOM.getFormData(form);
            const action = form.action || form.dataset.action;
            const method = (form.method || 'POST').toUpperCase();

            let response;
            if (method === 'GET') {
                const query = new URLSearchParams(formData).toString();
                response = await API.get(`${action}?${query}`);
            } else {
                response = await API.post(action, formData);
            }

            // Handle success
            const successEvent = new CustomEvent('form:success', {
                detail: { form, response }
            });
            form.dispatchEvent(successEvent);

            // Show success message if provided
            if (response.message) {
                Toast.success(response.message);
            }
        } catch (error) {
            // Handle error
            const errorEvent = new CustomEvent('form:error', {
                detail: { form, error }
            });
            form.dispatchEvent(errorEvent);

            Toast.error(error.message || 'An error occurred');
        } finally {
            // Re-enable form
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    },

    /**
     * Navigate to a page
     */
    navigate(path) {
        window.location.href = path;
    },

    /**
     * Get URL parameters
     */
    getUrlParams() {
        return Object.fromEntries(new URLSearchParams(window.location.search));
    },

    /**
     * Format currency (SOL)
     */
    formatSOL(amount) {
        return DOM.formatSOL(amount);
    },

    /**
     * Format wallet address
     */
    formatAddress(address) {
        return DOM.formatWalletAddress(address);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other modules
window.App = App;
