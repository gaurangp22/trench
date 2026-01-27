import type { AxiosError } from 'axios'

/**
 * Image validation configuration
 */
export const IMAGE_VALIDATION_CONFIG = {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    maxSizeMB: 5,
}

export type AllowedImageType = typeof IMAGE_VALIDATION_CONFIG.allowedTypes[number]

export interface ImageValidationResult {
    valid: boolean
    error?: string
}

/**
 * Validate an image file for upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): ImageValidationResult {
    if (!IMAGE_VALIDATION_CONFIG.allowedTypes.includes(file.type as AllowedImageType)) {
        return {
            valid: false,
            error: 'Please upload a JPG, PNG, GIF, or WebP image'
        }
    }

    if (file.size > IMAGE_VALIDATION_CONFIG.maxSizeBytes) {
        return {
            valid: false,
            error: `Image must be less than ${IMAGE_VALIDATION_CONFIG.maxSizeMB}MB`
        }
    }

    return { valid: true }
}

/**
 * Extract a user-friendly error message from an API error
 * @param err - The error object (typically AxiosError)
 * @param fallbackMessage - Default message if no specific error found
 * @returns User-friendly error message
 */
export function extractApiError(
    err: unknown,
    fallbackMessage = 'An error occurred. Please try again.'
): string {
    if (!err || typeof err !== 'object') {
        return fallbackMessage
    }

    const axiosError = err as AxiosError<{
        message?: string
        error?: string
        detail?: string
    }>

    const responseData = axiosError.response?.data
    const status = axiosError.response?.status

    // Try to get error message from response data
    if (responseData?.message) return responseData.message
    if (responseData?.error) return responseData.error
    if (responseData?.detail) return responseData.detail

    // Provide helpful messages based on status code
    switch (status) {
        case 400:
            return 'Invalid data. Please check your inputs.'
        case 401:
            return 'Please log in to continue.'
        case 403:
            return 'You do not have permission to perform this action.'
        case 404:
            return 'The requested resource was not found.'
        case 500:
            return 'Server error. Please try again later.'
        default:
            return fallbackMessage
    }
}

/**
 * Validate a Solana wallet address format
 * @param address - The address to validate
 * @returns Whether the address appears valid
 */
export function isValidSolanaAddress(address: string): boolean {
    // Solana addresses are base58 encoded and typically 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

/**
 * Validate an Ethereum address format
 * @param address - The address to validate
 * @returns Whether the address appears valid
 */
export function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}
