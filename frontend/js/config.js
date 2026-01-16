// TrenchJobs Configuration

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:8080/api/v1',

    // Solana Configuration
    SOLANA_NETWORK: 'devnet',
    SOLANA_RPC_ENDPOINT: 'https://api.devnet.solana.com',
    ESCROW_PROGRAM_ID: '', // Set after deployment

    // Platform Settings
    PLATFORM_FEE_PERCENTAGE: 5,
    MIN_ESCROW_AMOUNT_SOL: 0.1,
    JOB_POSTING_FEE_SOL: 0.01,

    // UI Settings
    TOAST_DURATION: 5000,
    DEBOUNCE_DELAY: 300,

    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'trenchjob_token',
        USER_DATA: 'trenchjob_user',
        WALLET_CONNECTED: 'trenchjob_wallet',
        THEME: 'trenchjob_theme'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
