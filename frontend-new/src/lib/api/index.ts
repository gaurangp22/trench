// Re-export client
export { api, API_URL } from './client'

// Re-export all types
export * from './types'

// Re-export all API modules
export { AuthAPI, login, signup } from './auth.api'
export { JobAPI, fetchJobs } from './jobs.api'
export { ProposalAPI } from './proposals.api'
export { ProfileAPI, fetchTalent } from './profiles.api'
export { ContractAPI } from './contracts.api'
export { MessageAPI } from './messages.api'
export { SkillsAPI, getSkills } from './skills.api'
export type { Skill } from './skills.api'
export { ReviewAPI } from './reviews.api'
export { UploadAPI } from './upload.api'
export { ServiceAPI, ServiceOrderAPI } from './services.api'
