/**
 * Format market cap values into human-readable strings
 * @param value - The market cap value (number or string)
 * @returns Formatted string like "$1.2B", "$500M", "$10K"
 */
export function formatMarketCap(value: number | string | undefined): string {
    if (!value) return 'N/A'
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return 'N/A'
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(0)}`
}

/**
 * Format currency values with SOL symbol
 * @param value - The value in SOL
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "◎1.5"
 */
export function formatSol(value: number | undefined, decimals = 1): string {
    if (value === undefined || value === null) return '◎0'
    return `◎${value.toFixed(decimals)}`
}

/**
 * Format a date string to a readable format
 * @param dateStr - ISO date string
 * @returns Formatted date like "Jan 15, 2024"
 */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param dateStr - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(dateStr)
}
