import { Globe, Twitter, MessageCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Social platform configuration
 */
export interface SocialPlatform {
    id: 'website' | 'twitter' | 'telegram' | 'discord'
    label: string
    icon: LucideIcon
    placeholder: string
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
    { id: 'website', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { id: 'telegram', label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/username' },
    { id: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'username#0000 or server invite' },
]

/**
 * Blockchain chain options
 */
export interface ChainOption {
    value: string
    label: string
}

export const CHAIN_OPTIONS: ChainOption[] = [
    { value: 'solana', label: 'Solana' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'base', label: 'Base' },
]

/**
 * Availability status options for freelancers
 */
export interface AvailabilityOption {
    value: 'available' | 'busy' | 'not_available'
    label: string
    description: string
}

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
    { value: 'available', label: 'Available', description: 'Actively looking for work' },
    { value: 'busy', label: 'Limited', description: 'Taking on select projects' },
    { value: 'not_available', label: 'Not Available', description: 'Not accepting new work' },
]

/**
 * Job difficulty levels
 */
export const JOB_DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'expert'] as const
export type JobDifficulty = typeof JOB_DIFFICULTY_LEVELS[number]

/**
 * Job status values
 */
export const JOB_STATUSES = ['draft', 'open', 'active', 'completed', 'cancelled'] as const
export type JobStatus = typeof JOB_STATUSES[number]

/**
 * Proposal status values
 */
export const PROPOSAL_STATUSES = ['pending', 'shortlisted', 'rejected', 'hired', 'withdrawn'] as const
export type ProposalStatus = typeof PROPOSAL_STATUSES[number]

/**
 * Contract status values
 */
export const CONTRACT_STATUSES = ['pending', 'active', 'completed', 'cancelled', 'disputed'] as const
export type ContractStatus = typeof CONTRACT_STATUSES[number]

/**
 * Milestone status values
 */
export const MILESTONE_STATUSES = ['pending', 'in_progress', 'submitted', 'approved', 'revision_requested'] as const
export type MilestoneStatus = typeof MILESTONE_STATUSES[number]

/**
 * Budget types
 */
export const BUDGET_TYPES = ['fixed', 'hourly'] as const
export type BudgetType = typeof BUDGET_TYPES[number]

/**
 * User roles
 */
export const USER_ROLES = ['client', 'freelancer'] as const
export type UserRole = typeof USER_ROLES[number]
