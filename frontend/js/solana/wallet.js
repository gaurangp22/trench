// Solana Wallet Integration

const Wallet = {
    connection: null,
    wallet: null,
    publicKey: null,
    walletType: null,

    /**
     * Initialize Solana connection
     */
    async init() {
        // Dynamic import of Solana web3.js would go here in production
        // For now, we'll use the window.solanaWeb3 if loaded via CDN
        this.connection = {
            rpcEndpoint: CONFIG.SOLANA_RPC_ENDPOINT,
            // In production, this would be a real Connection object
        };
    },

    /**
     * Get available wallets
     */
    getAvailableWallets() {
        const wallets = [];

        if (typeof window !== 'undefined') {
            if (window.phantom?.solana?.isPhantom) {
                wallets.push({
                    name: 'Phantom',
                    type: 'phantom',
                    icon: '/assets/icons/phantom.svg',
                    adapter: window.phantom.solana
                });
            }

            if (window.solflare?.isSolflare) {
                wallets.push({
                    name: 'Solflare',
                    type: 'solflare',
                    icon: '/assets/icons/solflare.svg',
                    adapter: window.solflare
                });
            }
        }

        return wallets;
    },

    /**
     * Check if any wallet is available
     */
    isWalletAvailable() {
        return this.getAvailableWallets().length > 0;
    },

    /**
     * Check if currently connected
     */
    isConnected() {
        return !!(this.wallet && this.publicKey);
    },

    /**
     * Connect to a wallet
     */
    async connect(walletType = 'phantom') {
        try {
            let adapter;

            if (walletType === 'phantom') {
                if (!window.phantom?.solana?.isPhantom) {
                    throw new Error('Phantom wallet not installed. Please install it from phantom.app');
                }
                adapter = window.phantom.solana;
            } else if (walletType === 'solflare') {
                if (!window.solflare?.isSolflare) {
                    throw new Error('Solflare wallet not installed. Please install it from solflare.com');
                }
                adapter = window.solflare;
            } else {
                throw new Error('Unsupported wallet type');
            }

            // Request connection
            const response = await adapter.connect();

            this.wallet = adapter;
            this.publicKey = response.publicKey.toBase58
                ? response.publicKey.toBase58()
                : response.publicKey.toString();
            this.walletType = walletType;

            // Setup event listeners
            this.setupEventListeners(adapter);

            // Save to storage
            Storage.setWallet({
                publicKey: this.publicKey,
                walletType: this.walletType
            });

            // Dispatch connected event
            window.dispatchEvent(new CustomEvent('wallet:connected', {
                detail: {
                    publicKey: this.publicKey,
                    walletType: this.walletType
                }
            }));

            return {
                publicKey: this.publicKey,
                walletType: this.walletType
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    },

    /**
     * Setup wallet event listeners
     */
    setupEventListeners(adapter) {
        // Handle disconnect
        adapter.on('disconnect', () => {
            this.handleDisconnect();
        });

        // Handle account change
        adapter.on('accountChanged', (publicKey) => {
            if (publicKey) {
                this.publicKey = publicKey.toBase58
                    ? publicKey.toBase58()
                    : publicKey.toString();

                Storage.setWallet({
                    publicKey: this.publicKey,
                    walletType: this.walletType
                });

                window.dispatchEvent(new CustomEvent('wallet:accountChanged', {
                    detail: { publicKey: this.publicKey }
                }));
            } else {
                this.handleDisconnect();
            }
        });
    },

    /**
     * Disconnect wallet
     */
    async disconnect() {
        if (this.wallet) {
            try {
                await this.wallet.disconnect();
            } catch (error) {
                console.error('Disconnect error:', error);
            }
        }
        this.handleDisconnect();
    },

    /**
     * Handle disconnect event
     */
    handleDisconnect() {
        this.wallet = null;
        this.publicKey = null;
        this.walletType = null;

        Storage.removeWallet();

        window.dispatchEvent(new CustomEvent('wallet:disconnected'));
    },

    /**
     * Get wallet balance
     */
    async getBalance() {
        if (!this.isConnected()) {
            throw new Error('Wallet not connected');
        }

        try {
            // In production, this would call the actual RPC endpoint
            // const balance = await this.connection.getBalance(new PublicKey(this.publicKey));
            // return balance / LAMPORTS_PER_SOL;

            // Mock for development
            const response = await fetch(`${CONFIG.SOLANA_RPC_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [this.publicKey]
                })
            });
            const data = await response.json();

            if (data.result?.value !== undefined) {
                return data.result.value / 1000000000; // Convert lamports to SOL
            }
            return 0;
        } catch (error) {
            console.error('Get balance error:', error);
            return 0;
        }
    },

    /**
     * Sign a message (for authentication)
     */
    async signMessage(message) {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await this.wallet.signMessage(encodedMessage, 'utf8');

            // Convert signature to base58 or hex
            const signature = this.uint8ArrayToBase58(signedMessage.signature);

            return {
                signature,
                publicKey: this.publicKey,
                message
            };
        } catch (error) {
            console.error('Sign message error:', error);
            throw error;
        }
    },

    /**
     * Sign and send a transaction
     */
    async signAndSendTransaction(serializedTx) {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            // In production, deserialize and send the transaction
            // const transaction = Transaction.from(Buffer.from(serializedTx, 'base64'));
            // const { signature } = await this.wallet.signAndSendTransaction(transaction);

            // For now, we'll simulate the wallet signing flow
            const { signature } = await this.wallet.signAndSendTransaction(
                // This would be the actual transaction object
                { serialize: () => new Uint8Array() }
            );

            return signature;
        } catch (error) {
            console.error('Sign and send transaction error:', error);
            throw error;
        }
    },

    /**
     * Convert Uint8Array to base58 string
     */
    uint8ArrayToBase58(array) {
        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let result = '';
        let num = BigInt(0);

        for (const byte of array) {
            num = num * BigInt(256) + BigInt(byte);
        }

        while (num > 0) {
            result = ALPHABET[Number(num % BigInt(58))] + result;
            num = num / BigInt(58);
        }

        // Handle leading zeros
        for (const byte of array) {
            if (byte === 0) {
                result = '1' + result;
            } else {
                break;
            }
        }

        return result;
    },

    /**
     * Try to restore wallet connection from storage
     */
    async tryReconnect() {
        const savedWallet = Storage.getWallet();
        if (!savedWallet) return false;

        try {
            // Check if the wallet extension is still available
            const availableWallets = this.getAvailableWallets();
            const savedWalletAvailable = availableWallets.find(
                w => w.type === savedWallet.walletType
            );

            if (savedWalletAvailable) {
                // Try to reconnect silently
                const adapter = savedWalletAvailable.adapter;

                // Check if already connected
                if (adapter.isConnected) {
                    this.wallet = adapter;
                    this.publicKey = adapter.publicKey?.toBase58?.() || adapter.publicKey?.toString();
                    this.walletType = savedWallet.walletType;

                    if (this.publicKey) {
                        this.setupEventListeners(adapter);

                        window.dispatchEvent(new CustomEvent('wallet:connected', {
                            detail: {
                                publicKey: this.publicKey,
                                walletType: this.walletType
                            }
                        }));

                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('Reconnect error:', error);
        }

        // Clear invalid saved wallet
        Storage.removeWallet();
        return false;
    }
};

// Initialize wallet manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Wallet.init();
});
