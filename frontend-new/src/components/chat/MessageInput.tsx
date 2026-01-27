import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Paperclip, X, FileText, Image as ImageIcon, File } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { UploadAPI } from '@/lib/api'
import type { Attachment } from '@/lib/websocket/ChatWebSocket'

interface PendingFile {
    id: string
    file: File
    preview?: string
    uploading: boolean
    uploaded?: Attachment
    error?: string
}

interface MessageInputProps {
    onSend: (text: string, attachments?: Attachment[]) => Promise<void>
    onTyping?: (isTyping: boolean) => void
    disabled?: boolean
    placeholder?: string
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB

export function MessageInput({ onSend, onTyping, disabled, placeholder = "Type a message..." }: MessageInputProps) {
    const [text, setText] = useState('')
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
    const [sending, setSending] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Handle typing indicator
    useEffect(() => {
        if (!onTyping) return

        if (text.length > 0) {
            onTyping(true)
            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            // Set new timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false)
            }, 2000)
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        }
    }, [text, onTyping])

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const newPendingFiles: PendingFile[] = []

        for (const file of files) {
            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
            const isDoc = ALLOWED_DOC_TYPES.includes(file.type)

            if (!isImage && !isDoc) {
                continue // Skip unsupported types
            }

            const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
            if (file.size > maxSize) {
                continue // Skip oversized files
            }

            const id = crypto.randomUUID()
            const pending: PendingFile = {
                id,
                file,
                uploading: true,
                preview: isImage ? URL.createObjectURL(file) : undefined,
            }

            newPendingFiles.push(pending)
        }

        setPendingFiles(prev => [...prev, ...newPendingFiles])

        // Upload files
        for (const pending of newPendingFiles) {
            try {
                const result = await UploadAPI.uploadFile(pending.file)
                setPendingFiles(prev => prev.map(p =>
                    p.id === pending.id
                        ? {
                            ...p,
                            uploading: false,
                            uploaded: {
                                url: result.url,
                                file_name: result.original_name || result.filename,
                                file_type: result.file_type || pending.file.type,
                                file_size: result.file_size || pending.file.size,
                            },
                        }
                        : p
                ))
            } catch (error) {
                setPendingFiles(prev => prev.map(p =>
                    p.id === pending.id
                        ? { ...p, uploading: false, error: 'Upload failed' }
                        : p
                ))
            }
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [])

    const removeFile = useCallback((id: string) => {
        setPendingFiles(prev => {
            const file = prev.find(p => p.id === id)
            if (file?.preview) {
                URL.revokeObjectURL(file.preview)
            }
            return prev.filter(p => p.id !== id)
        })
    }, [])

    const handleSend = useCallback(async () => {
        const trimmedText = text.trim()
        const attachments = pendingFiles
            .filter(p => p.uploaded && !p.error)
            .map(p => p.uploaded!)

        if (!trimmedText && attachments.length === 0) return

        setSending(true)
        try {
            await onSend(trimmedText, attachments.length > 0 ? attachments : undefined)
            setText('')
            // Clean up previews
            pendingFiles.forEach(p => {
                if (p.preview) URL.revokeObjectURL(p.preview)
            })
            setPendingFiles([])
            onTyping?.(false)
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setSending(false)
        }
    }, [text, pendingFiles, onSend, onTyping])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const hasUploadingFiles = pendingFiles.some(p => p.uploading)
    const isDisabled = disabled || sending || hasUploadingFiles

    return (
        <div className="border-t border-white/[0.06] bg-[#0a0a0c]">
            {/* Pending files preview */}
            {pendingFiles.length > 0 && (
                <div className="p-3 border-b border-white/[0.06] flex flex-wrap gap-2">
                    {pendingFiles.map(pending => (
                        <div
                            key={pending.id}
                            className={cn(
                                "relative group rounded-lg overflow-hidden border",
                                pending.error
                                    ? "border-red-500/50 bg-red-500/10"
                                    : "border-white/[0.08] bg-white/[0.03]"
                            )}
                        >
                            {pending.preview ? (
                                // Image preview
                                <div className="w-20 h-20 relative">
                                    <img
                                        src={pending.preview}
                                        alt={pending.file.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {pending.uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Document preview
                                <div className="w-32 h-20 p-2 flex flex-col items-center justify-center">
                                    {pending.uploading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FileIcon type={pending.file.type} />
                                            <span className="text-xs text-zinc-400 truncate max-w-full mt-1">
                                                {pending.file.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Remove button */}
                            <button
                                onClick={() => removeFile(pending.id)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>

                            {/* Error indicator */}
                            {pending.error && (
                                <div className="absolute bottom-0 inset-x-0 bg-red-500/80 text-white text-xs py-0.5 text-center">
                                    {pending.error}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Input area */}
            <div className="p-4 flex items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled}
                    className="text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                >
                    <Paperclip className="w-5 h-5" />
                </Button>

                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                />

                <Button
                    onClick={handleSend}
                    disabled={isDisabled || (!text.trim() && pendingFiles.filter(p => p.uploaded).length === 0)}
                    className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50"
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}

function FileIcon({ type }: { type: string }) {
    if (ALLOWED_IMAGE_TYPES.includes(type)) {
        return <ImageIcon className="w-6 h-6 text-blue-400" />
    }
    if (type === 'application/pdf') {
        return <FileText className="w-6 h-6 text-red-400" />
    }
    return <File className="w-6 h-6 text-zinc-400" />
}
