/**
 * Generate DexScreener URL for a token
 * @param chain - The blockchain network (solana, ethereum, base)
 * @param contractAddress - The token contract address
 * @returns DexScreener URL
 */
export function getDexScreenerUrl(chain: string, contractAddress: string): string {
    return `https://dexscreener.com/${chain}/${contractAddress}`
}

/**
 * Generate Solscan URL for a Solana address
 * @param address - The Solana address
 * @returns Solscan URL
 */
export function getSolscanUrl(address: string): string {
    return `https://solscan.io/account/${address}`
}

/**
 * Generate Solscan transaction URL
 * @param txHash - The transaction hash
 * @returns Solscan transaction URL
 */
export function getSolscanTxUrl(txHash: string): string {
    return `https://solscan.io/tx/${txHash}`
}
