import { api } from './client'
import type {
    Service,
    CreateServiceRequest,
    UpdateServiceRequest,
    ServiceSearchParams,
    ServiceSearchResponse,
    ServiceDetailResponse,
    ServiceOrder,
    CreateOrderRequest,
    OrderListResponse,
    ServiceOrderMessage,
    SendOrderMessageRequest,
    DeliverOrderRequest,
    RequestRevisionRequest,
    ServiceReview,
    CreateServiceReviewRequest
} from './types'

/**
 * Service (Freelancer Gig) API
 */
export const ServiceAPI = {
    // Search/browse services (public)
    search: async (params?: ServiceSearchParams): Promise<ServiceSearchResponse> => {
        const res = await api.get('/services', { params })
        return {
            services: res.data.services || [],
            total: res.data.total || 0,
            limit: res.data.limit || 20,
            offset: res.data.offset || 0
        }
    },

    // Get service by ID (public)
    getById: async (id: string): Promise<ServiceDetailResponse> => {
        const res = await api.get(`/services/${id}`)
        return {
            service: res.data.service || res.data,
            skills: res.data.skills || [],
            faqs: res.data.faqs || [],
            reviews: res.data.reviews || []
        }
    },

    // Get my services (freelancer)
    getMyServices: async (status?: string): Promise<ServiceSearchResponse> => {
        const res = await api.get('/services/mine', { params: { status } })
        return {
            services: res.data.services || [],
            total: res.data.total || 0,
            limit: res.data.limit || 20,
            offset: res.data.offset || 0
        }
    },

    // Create a new service (freelancer)
    create: async (data: CreateServiceRequest): Promise<Service> => {
        const res = await api.post('/services', data)
        return res.data.service || res.data
    },

    // Update a service (freelancer - owner)
    update: async (id: string, data: UpdateServiceRequest): Promise<Service> => {
        const res = await api.put(`/services/${id}`, data)
        return res.data.service || res.data
    },

    // Publish a service (freelancer - owner)
    publish: async (id: string): Promise<void> => {
        await api.post(`/services/${id}/publish`)
    },

    // Pause a service (freelancer - owner)
    pause: async (id: string): Promise<void> => {
        await api.post(`/services/${id}/pause`)
    },

    // Delete/archive a service (freelancer - owner)
    delete: async (id: string): Promise<void> => {
        await api.delete(`/services/${id}`)
    },

    // Get service reviews (public)
    getReviews: async (serviceId: string, limit?: number, offset?: number): Promise<{ reviews: ServiceReview[]; total: number }> => {
        const res = await api.get(`/services/${serviceId}/reviews`, { params: { limit, offset } })
        return {
            reviews: res.data.reviews || [],
            total: res.data.total || 0
        }
    }
}

/**
 * Service Order API
 */
export const ServiceOrderAPI = {
    // Place an order (client)
    placeOrder: async (serviceId: string, data: CreateOrderRequest): Promise<{ order: ServiceOrder }> => {
        const res = await api.post(`/services/${serviceId}/order`, data)
        return { order: res.data.order || res.data }
    },

    // Get my orders (role-aware)
    getMyOrders: async (role: 'client' | 'freelancer', status?: string): Promise<OrderListResponse> => {
        const res = await api.get('/orders', { params: { role, status } })
        return {
            orders: res.data.orders || [],
            total: res.data.total || 0,
            limit: res.data.limit || 20,
            offset: res.data.offset || 0
        }
    },

    // Get order by ID
    getById: async (id: string): Promise<{ order: ServiceOrder }> => {
        const res = await api.get(`/orders/${id}`)
        return { order: res.data.order || res.data }
    },

    // Accept order (freelancer)
    accept: async (id: string): Promise<void> => {
        await api.post(`/orders/${id}/accept`)
    },

    // Deliver order (freelancer)
    deliver: async (id: string, data: DeliverOrderRequest): Promise<void> => {
        await api.post(`/orders/${id}/deliver`, data)
    },

    // Approve delivery (client)
    approve: async (id: string): Promise<void> => {
        await api.post(`/orders/${id}/approve`)
    },

    // Request revision (client)
    requestRevision: async (id: string, data: RequestRevisionRequest): Promise<void> => {
        await api.post(`/orders/${id}/revision`, data)
    },

    // Cancel order
    cancel: async (id: string): Promise<void> => {
        await api.post(`/orders/${id}/cancel`)
    },

    // Get order messages
    getMessages: async (orderId: string, limit?: number, offset?: number): Promise<{ messages: ServiceOrderMessage[]; total: number }> => {
        const res = await api.get(`/orders/${orderId}/messages`, { params: { limit, offset } })
        return {
            messages: res.data.messages || [],
            total: res.data.total || 0
        }
    },

    // Send message in order
    sendMessage: async (orderId: string, data: SendOrderMessageRequest): Promise<ServiceOrderMessage> => {
        const res = await api.post(`/orders/${orderId}/messages`, data)
        return res.data.order_message || res.data
    },

    // Create review for completed order (client)
    createReview: async (orderId: string, data: CreateServiceReviewRequest): Promise<ServiceReview> => {
        const res = await api.post(`/orders/${orderId}/review`, data)
        return res.data.review || res.data
    }
}
