import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { connected, publicKey, disconnect } = useWallet()
    const { setVisible } = useWalletModal()
    const location = useLocation()



    // Don't show on dashboard pages
    const isDashboardPage = location.pathname.startsWith('/client') || location.pathname.startsWith('/freelancer')
    if (isDashboardPage) return null

    const navLinks = [
        { to: "/jobs", label: "Find Work" },
        { to: "/talent", label: "Find Talent" },
        { to: "/how-it-works", label: "How It Works" },
    ]

    const shortenAddress = (address: string) =>
        `${address.slice(0, 4)}...${address.slice(-4)}`

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
                {/* Single Unified Glass Container */}
                <div
                    className={cn(
                        "max-w-5xl mx-auto rounded-2xl transition-all duration-500",
                        "bg-white/[0.03] backdrop-blur-2xl",
                        "border border-white/[0.08]",
                        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    )}
                >
                    <div className="flex items-center justify-between h-14 px-5">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 shrink-0">
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                                <Zap className="h-3.5 w-3.5 text-[#0a0a0c] fill-[#0a0a0c]" />
                            </div>
                            <span className="text-[15px] font-semibold text-white tracking-tight">
                                TrenchJobs
                            </span>
                        </Link>

                        {/* Center Nav Links */}
                        <nav className="hidden md:flex items-center justify-center flex-1 gap-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.to
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={cn(
                                            "relative text-[13px] font-medium px-4 py-1.5 rounded-full transition-all duration-200",
                                            isActive
                                                ? "text-white"
                                                : "text-zinc-400 hover:text-white"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="navIndicator"
                                                className="absolute inset-0 bg-white/[0.1] rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                            />
                                        )}
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center gap-3 shrink-0">
                            {/* Wallet */}
                            {connected && publicKey ? (
                                <button
                                    onClick={() => disconnect()}
                                    className="flex items-center gap-2 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {shortenAddress(publicKey.toString())}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setVisible(true)}
                                    className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    Connect Wallet
                                </button>
                            )}

                            <div className="w-px h-4 bg-white/[0.1]" />

                            <Link to="/auth" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
                                Log in
                            </Link>

                            <Link to="/auth">
                                <button className="h-8 px-4 text-[13px] font-medium text-black bg-white hover:bg-zinc-100 rounded-full transition-all">
                                    Get Started
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-zinc-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        <div className="absolute inset-0 bg-[#0a0a0c]/98 backdrop-blur-2xl" />

                        <div className="relative h-full pt-24 px-6 pb-8 flex flex-col">
                            <nav className="flex-1 space-y-1">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.to}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            to={link.to}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "block py-4 text-2xl font-medium transition-colors",
                                                location.pathname === link.to
                                                    ? "text-white"
                                                    : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-3"
                            >
                                {connected && publicKey ? (
                                    <button
                                        onClick={() => { disconnect(); setIsMobileMenuOpen(false); }}
                                        className="w-full h-12 flex items-center justify-center gap-2 text-[15px] font-medium text-zinc-400 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        {shortenAddress(publicKey.toString())}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setVisible(true); setIsMobileMenuOpen(false); }}
                                        className="w-full h-12 text-[15px] font-medium text-zinc-300 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                                    >
                                        Connect Wallet
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="w-full h-12 text-[15px] font-medium text-white bg-white/[0.05] border border-white/[0.08] rounded-xl">
                                            Log in
                                        </button>
                                    </Link>
                                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="w-full h-12 text-[15px] font-medium text-black bg-white rounded-xl">
                                            Get Started
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
