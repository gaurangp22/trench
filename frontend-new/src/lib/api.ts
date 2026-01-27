/**
 * @deprecated This file is maintained for backward compatibility.
 * Import from '@/lib/api/index' or specific modules instead:
 *
 * import { JobAPI, ProfileAPI, type Job } from '@/lib/api'
 *
 * The API has been split into domain-specific modules:
 * - @/lib/api/auth.api.ts
 * - @/lib/api/jobs.api.ts
 * - @/lib/api/proposals.api.ts
 * - @/lib/api/profiles.api.ts
 * - @/lib/api/contracts.api.ts
 * - @/lib/api/messages.api.ts
 * - @/lib/api/skills.api.ts
 * - @/lib/api/reviews.api.ts
 * - @/lib/api/upload.api.ts
 */

// Re-export everything from the new modular API
export * from './api/index'
