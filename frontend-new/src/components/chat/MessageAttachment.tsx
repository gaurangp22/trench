import { useState } from 'react'
import { FileText, File, Download, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Attachment } from '@/lib/websocket/ChatWebSocket'

interface MessageAttachmentProps {
    attachment: Attachment
    isOwnMessage?: boolean
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function MessageAttachment({ attachment, isOwnMessage }: MessageAttachmentProps) {
    const [showLightbox, setShowLightbox] = useState(false)
    const [imageError, setImageError] = useState(false)

    const isImage = IMAGE_TYPES.includes(attachment.file_type) && !imageError

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (isImage) {
        return (
            <>
                <div
                    className="mt-2 cursor-pointer rounded-lg overflow-hidden max-w-xs"
                    onClick={() => setShowLightbox(true)}
                >
                    <img
                        src={attachment.url}
                        alt={attachment.file_name}
                        className="max-w-full h-auto rounded-lg"
                        onError={() => setImageError(true)}
                    />
                </div>

                {/* Lightbox */}
                {showLightbox && (
                    <div
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        <img
                            src={attachment.url}
                            alt={attachment.file_name}
                            className="max-w-full max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <a
                            href={attachment.url}
                            download={attachment.file_name}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    </div>
                )}
            </>
        )
    }

    // Document attachment
    return (
        <a
            href={attachment.url}
            download={attachment.file_name}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "mt-2 flex items-center gap-3 p-3 rounded-lg transition-colors max-w-xs",
                isOwnMessage
                    ? "bg-emerald-600/30 hover:bg-emerald-600/40"
                    : "bg-white/[0.08] hover:bg-white/[0.12]"
            )}
        >
            <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isOwnMessage ? "bg-emerald-500/30" : "bg-white/10"
            )}>
                <FileTypeIcon type={attachment.file_type} />
            </div>

            <div className="flex-1 min-w-0">
                <div className={cn(
                    "text-sm font-medium truncate",
                    isOwnMessage ? "text-white" : "text-zinc-200"
                )}>
                    {attachment.file_name}
                </div>
                <div className={cn(
                    "text-xs",
                    isOwnMessage ? "text-white/70" : "text-zinc-400"
                )}>
                    {formatFileSize(attachment.file_size)}
                </div>
            </div>

            <Download className={cn(
                "w-4 h-4 flex-shrink-0",
                isOwnMessage ? "text-white/70" : "text-zinc-400"
            )} />
        </a>
    )
}

function FileTypeIcon({ type }: { type: string }) {
    if (type === 'application/pdf') {
        return <FileText className="w-5 h-5 text-red-400" />
    }
    if (type.includes('word') || type === 'application/msword') {
        return <FileText className="w-5 h-5 text-blue-400" />
    }
    if (type === 'text/plain') {
        return <FileText className="w-5 h-5 text-zinc-400" />
    }
    if (type.includes('zip')) {
        return <File className="w-5 h-5 text-yellow-400" />
    }
    if (type.startsWith('image/')) {
        return <ImageIcon className="w-5 h-5 text-purple-400" />
    }
    return <File className="w-5 h-5 text-zinc-400" />
}

// Component to display multiple attachments
interface MessageAttachmentsProps {
    attachments: Attachment[]
    isOwnMessage?: boolean
}

export function MessageAttachments({ attachments, isOwnMessage }: MessageAttachmentsProps) {
    if (!attachments || attachments.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
                <MessageAttachment
                    key={`${attachment.url}-${index}`}
                    attachment={attachment}
                    isOwnMessage={isOwnMessage}
                />
            ))}
        </div>
    )
}
