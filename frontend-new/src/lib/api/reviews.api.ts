import { api } from './client'
import type { Review, CreateReviewRequest } from './types'

export const ReviewAPI = {
    create: async (data: CreateReviewRequest): Promise<Review> => {
        const res = await api.post('/reviews', data)
        return res.data
    },

    getById: async (id: string): Promise<Review> => {
        const res = await api.get(`/reviews/${id}`)
        return res.data
    },

    getByContract: async (contractId: string): Promise<{ reviews: Review[] }> => {
        const res = await api.get(`/contracts/${contractId}/reviews`)
        return res.data
    },

    getByUser: async (
        userId: string,
        limit = 20,
        offset = 0
    ): Promise<{ reviews: Review[]; total: number }> => {
        const res = await api.get(`/users/${userId}/reviews`, { params: { limit, offset } })
        return res.data
    }
}
