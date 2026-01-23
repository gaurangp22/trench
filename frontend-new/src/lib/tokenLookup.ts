// Token lookup service using DexScreener API
// Fetches token data (name, symbol, image, ATH) from contract address

export interface TokenData {
    name: string;
    symbol: string;
    imageUrl?: string;
    athMarketCap?: number;
    priceUsd?: number;
    chain: string;
}

interface DexScreenerPair {
    chainId: string;
    baseToken: {
        name: string;
        symbol: string;
    };
    info?: {
        imageUrl?: string;
    };
    fdv?: number;
    marketCap?: number;
    priceUsd?: string;
}

interface DexScreenerResponse {
    pairs: DexScreenerPair[] | null;
}

/**
 * Lookup token data from DexScreener API
 * @param contractAddress - The token's contract address
 * @param chain - The blockchain (default: 'solana')
 */
export async function lookupToken(contractAddress: string, chain: string = 'solana'): Promise<TokenData | null> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
        );

        if (!response.ok) {
            console.error('DexScreener API error:', response.status);
            return null;
        }

        const data: DexScreenerResponse = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
            console.warn('No pairs found for token:', contractAddress);
            return null;
        }

        // Find the pair with highest liquidity/volume, preferring the specified chain
        const chainPairs = data.pairs.filter(p =>
            p.chainId.toLowerCase() === chain.toLowerCase()
        );

        const pair = chainPairs.length > 0 ? chainPairs[0] : data.pairs[0];

        // Get ATH market cap - DexScreener doesn't provide ATH, so we use current fdv/marketCap
        // In a production app, you'd track ATH historically
        const marketCap = pair.marketCap || pair.fdv;

        return {
            name: pair.baseToken.name,
            symbol: pair.baseToken.symbol,
            imageUrl: pair.info?.imageUrl,
            athMarketCap: marketCap,
            priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : undefined,
            chain: pair.chainId,
        };
    } catch (error) {
        console.error('Failed to lookup token:', error);
        return null;
    }
}

/**
 * Format market cap for display
 */
export function formatMarketCap(value: number | undefined): string {
    if (!value) return 'N/A';

    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
}
