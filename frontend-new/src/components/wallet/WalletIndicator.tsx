import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletIndicatorProps {
    onClick?: () => void
    className?: string
}

export function WalletIndicator({ onClick, className }: WalletIndicatorProps) {
    const { publicKey, connected } = useWallet()
    const { connection } = useConnection()
    const [balance, setBalance] = useState<number | null>(null)

    useEffect(() => {
        if (!publicKey || !connected) {
            setBalance(null)
            return
        }

        const fetchBalance = async () => {
            try {
                const bal = await connection.getBalance(publicKey)
                setBalance(bal / LAMPORTS_PER_SOL)
            } catch (error) {
                console.error("Failed to fetch balance:", error)
                setBalance(null)
            }
        }

        fetchBalance()
        // Refresh balance every 30 seconds
        const interval = setInterval(fetchBalance, 30000)
        return () => clearInterval(interval)
    }, [publicKey, connected, connection])

    // Format wallet address as ENS-style shortened ID
    const shortenAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`
    }

    if (!connected || !publicKey) {
        return null
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-gradient-to-r from-green-500/10 to-indigo-500/10",
                "border border-green-500/20 hover:border-green-500/40",
                "transition-all duration-200 group",
                className
            )}
        >
            {/* Connection Status Dot */}
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>

            {/* Balance */}
            <span className="text-sm font-medium text-white">
                ◎ {balance !== null ? balance.toFixed(2) : "..."}
            </span>

            {/* Shortened Address */}
            <span className="text-xs text-zinc-400 hidden sm:inline">
                {shortenAddress(publicKey.toBase58())}
            </span>

            {/* Dropdown Arrow */}
            <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" />
        </button>
    )
}

// Wallet Status Badge - compact version for tight spaces
export function WalletStatusBadge({ className }: { className?: string }) {
    const { connected } = useWallet()

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <span className={cn(
                "w-2 h-2 rounded-full",
                connected ? "bg-green-500" : "bg-zinc-500"
            )} />
            <span className="text-xs text-zinc-400">
                {connected ? "Connected" : "Not connected"}
            </span>
        </div>
    )
}
