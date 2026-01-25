import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Zap, LayoutDashboard, LogOut, User, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import { useAuth } from "@/context/AuthContext"

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { connected, publicKey, disconnect } = useWallet()
    const { setVisible } = useWalletModal()
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        setIsMobileMenuOpen(false)
        navigate('/')
    }

    const dashboardPath = user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'



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

                            {isAuthenticated ? (
                                <>
                                    {/* User Info Pill */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                                            <User className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[13px] font-medium text-white">
                                            {user?.display_name || user?.username || 'User'}
                                        </span>
                                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <Link
                                        to={dashboardPath}
                                        className="group flex items-center gap-1.5 h-8 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] text-[13px] font-medium text-white transition-all"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                        Dashboard
                                        <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/auth"
                                        className="h-8 px-4 flex items-center text-[13px] font-medium text-zinc-300 hover:text-white rounded-full hover:bg-white/[0.05] transition-all"
                                    >
                                        Sign In
                                    </Link>

                                    <Link to="/auth">
                                        <GradientSlideButton
                                            className="h-8 px-5 text-[13px] font-semibold rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                                            colorFrom="#10B981"
                                            colorTo="#14F195"
                                        >
                                            Start Free
                                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                        </GradientSlideButton>
                                    </Link>
                                </>
                            )}
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

                                {isAuthenticated ? (
                                    <div className="space-y-3">
                                        {/* User Info Card */}
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-medium text-white">
                                                    {user?.display_name || user?.username || 'User'}
                                                </div>
                                                <div className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">
                                                    {user?.role}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)}>
                                                <button className="w-full h-12 flex items-center justify-center gap-2 text-[15px] font-medium text-white bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:border-emerald-500/50 transition-colors">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </button>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full h-12 flex items-center justify-center gap-2 text-[15px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                            <GradientSlideButton
                                                className="w-full h-14 text-[16px] font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                                                colorFrom="#10B981"
                                                colorTo="#14F195"
                                            >
                                                Start Free
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </GradientSlideButton>
                                        </Link>
                                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full h-12 text-[15px] font-medium text-zinc-300 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-colors">
                                                Already have an account? Sign In
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
