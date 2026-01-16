// Storage Utility Functions

const Storage = {
    /**
     * Get item from localStorage with JSON parsing
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from storage: ${key}`, error);
            return null;
        }
    },

    /**
     * Set item in localStorage with JSON stringification
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage: ${key}`, error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from storage: ${key}`, error);
            return false;
        }
    },

    /**
     * Clear all TrenchJobs related storage
     */
    clear() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            this.remove(key);
        });
    },

    /**
     * Get authentication token
     */
    getToken() {
        return this.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    },

    /**
     * Set authentication token
     */
    setToken(token) {
        return this.set(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    },

    /**
     * Remove authentication token
     */
    removeToken() {
        return this.remove(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    },

    /**
     * Get user data
     */
    getUser() {
        return this.get(CONFIG.STORAGE_KEYS.USER_DATA);
    },

    /**
     * Set user data
     */
    setUser(user) {
        return this.set(CONFIG.STORAGE_KEYS.USER_DATA, user);
    },

    /**
     * Remove user data
     */
    removeUser() {
        return this.remove(CONFIG.STORAGE_KEYS.USER_DATA);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    },

    /**
     * Get connected wallet info
     */
    getWallet() {
        return this.get(CONFIG.STORAGE_KEYS.WALLET_CONNECTED);
    },

    /**
     * Set connected wallet info
     */
    setWallet(walletInfo) {
        return this.set(CONFIG.STORAGE_KEYS.WALLET_CONNECTED, walletInfo);
    },

    /**
     * Remove wallet info
     */
    removeWallet() {
        return this.remove(CONFIG.STORAGE_KEYS.WALLET_CONNECTED);
    }
};
