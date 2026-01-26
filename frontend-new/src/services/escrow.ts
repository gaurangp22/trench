import { Connection, PublicKey } from '@solana/web3.js';

// TEST MODE: Set to true to skip real blockchain transactions
const TEST_MODE = true;

// Constants
// In a real app, this would be the deployed program ID
export const ESCROW_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Generate a fake transaction signature for test mode
const generateFakeSignature = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let signature = '';
    for (let i = 0; i < 88; i++) {
        signature += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return signature;
};

export class EscrowService {
    connection: Connection;

    constructor(endpoint: string = 'https://api.devnet.solana.com') {
        this.connection = new Connection(endpoint, 'confirmed');
    }

    /**
     * Funds a job escrow.
     * TEST MODE: Returns a fake signature without sending real transactions.
     */
    async fundJob(
        wallet: any,
        _jobId: string,
        amount: number
    ): Promise<string> {
        if (!wallet.publicKey) throw new Error('Wallet not connected');

        if (TEST_MODE) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`[TEST MODE] Simulated funding ${amount} SOL for job`);
            return generateFakeSignature();
        }

        // Real implementation would go here when TEST_MODE is false
        throw new Error('Real transactions disabled. Enable by setting TEST_MODE = false');
    }

    /**
     * Releases payment to a freelancer.
     * TEST MODE: Returns a fake signature without sending real transactions.
     */
    async releasePayment(
        wallet: any,
        _escrowAccount: PublicKey,
        _recipient: PublicKey,
        amount: number
    ): Promise<string> {
        if (!wallet.publicKey) throw new Error('Wallet not connected');

        if (TEST_MODE) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`[TEST MODE] Simulated releasing ${amount} SOL payment`);
            return generateFakeSignature();
        }

        // Real implementation would go here when TEST_MODE is false
        throw new Error('Real transactions disabled. Enable by setting TEST_MODE = false');
    }
}
