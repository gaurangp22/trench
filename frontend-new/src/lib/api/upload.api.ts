import { api } from './client'

export const UploadAPI = {
    /**
     * Upload a file (profile picture, portfolio image, etc.)
     */
    uploadFile: async (file: File): Promise<{ url: string; filename: string }> => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return res.data
    }
}
