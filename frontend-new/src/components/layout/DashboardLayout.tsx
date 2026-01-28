import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    PlusCircle,
    Briefcase,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Wallet,
    FileText,
    Bell,
    ChevronRight,
    Copy,
    Check,
    User,
    Shield,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useWallet } from "@solana/wallet-adapter-react"

interface DashboardLayoutProps {
    children: React.ReactNode
    role?: 'client' | 'freelancer'
}

export function DashboardLayout({ children, role = 'client' }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { publicKey, connected } = useWallet()

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const copyWalletAddress = () => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58())
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`
    }

    // Navigation with color coding
    const clientLinks = [
        { name: "Overview", href: "/client/dashboard", icon: LayoutDashboard, color: "emerald" },
        { name: "Post a Job", href: "/client/post-job", icon: PlusCircle, color: "blue" },
        { name: "My Jobs", href: "/client/jobs", icon: Briefcase, color: "amber" },
        { name: "Contracts", href: "/client/contracts", icon: FileText, color: "purple" },
        { name: "Messages", href: "/messages", icon: MessageSquare, color: "cyan" },
        { name: "Settings", href: "/settings", icon: Settings, color: "zinc" },
    ]

    const freelancerLinks = [
        { name: "Overview", href: "/freelancer/dashboard", icon: LayoutDashboard, color: "emerald" },
        { name: "My Proposals", href: "/freelancer/proposals", icon: Briefcase, color: "blue" },
        { name: "Active Contracts", href: "/freelancer/contracts", icon: Wallet, color: "purple" },
        { name: "Messages", href: "/messages", icon: MessageSquare, color: "cyan" },
        { name: "Settings", href: "/settings", icon: Settings, color: "zinc" },
    ]

    const links = role === 'client' ? clientLinks : freelancerLinks

    const colorClasses: Record<string, { active: string, icon: string, indicator: string }> = {
        emerald: { active: "text-emerald-400", icon: "text-emerald-400", indicator: "bg-emerald-500" },
        blue: { active: "text-blue-400", icon: "text-blue-400", indicator: "bg-blue-500" },
        amber: { active: "text-amber-400", icon: "text-amber-400", indicator: "bg-amber-500" },
        purple: { active: "text-purple-400", icon: "text-purple-400", indicator: "bg-purple-500" },
        cyan: { active: "text-cyan-400", icon: "text-cyan-400", indicator: "bg-cyan-500" },
        pink: { active: "text-pink-400", icon: "text-pink-400", indicator: "bg-pink-500" },
        zinc: { active: "text-zinc-400", icon: "text-zinc-400", indicator: "bg-zinc-500" },
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 mb-2">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                        <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    {isSidebarOpen && (
                        <span className="font-heading font-bold text-white text-xl tracking-tight">TrenchJobs</span>
                    )}
                </Link>
                {/* Mobile Close */}
                <button
                    className="md:hidden text-zinc-500 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* User Profile Card */}
            <div className={cn("px-4 mb-6", !isSidebarOpen && "px-2")}>
                <div className={cn(
                    "bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 transition-all",
                    !isSidebarOpen && "p-2"
                )}>
                    <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center border border-white/10">
                                <User className="w-5 h-5 text-white/70" />
                            </div>
                            {connected && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]" />
                            )}
                        </div>

                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white truncate">
                                        {user?.display_name || user?.username || 'User'}
                                    </span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 text-[10px] font-bold uppercase rounded",
                                        role === 'client'
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-emerald-500/20 text-emerald-400"
                                    )}>
                                        {role}
                                    </span>
                                </div>
                                {connected && publicKey && (
                                    <button
                                        onClick={copyWalletAddress}
                                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5 group"
                                    >
                                        <Wallet className="w-3 h-3" />
                                        <span>{truncateAddress(publicKey.toBase58())}</span>
                                        {copied ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.href
                    const colors = colorClasses[link.color]

                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? `text-white bg-white/5 border border-white/10`
                                    : "text-zinc-500 hover:text-white hover:bg-white/[0.02]",
                                !isSidebarOpen && "justify-center"
                            )}
                            title={!isSidebarOpen ? link.name : undefined}
                        >
                            {isActive && (
                                <div className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r-full blur-[1px]",
                                    colors.indicator
                                )} />
                            )}
                            <Icon className={cn(
                                "w-5 h-5 shrink-0 transition-colors",
                                isActive ? colors.icon : "group-hover:text-white"
                            )} />
                            {isSidebarOpen && <span>{link.name}</span>}
                            {isSidebarOpen && isActive && (
                                <ChevronRight className="w-4 h-4 ml-auto text-zinc-600" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Escrow Link */}
            <div className="px-4 mb-4">
                <Link
                    to="/escrow"
                    className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                        location.pathname === '/escrow'
                            ? "text-white bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                            : "text-zinc-500 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]",
                        !isSidebarOpen && "justify-center"
                    )}
                >
                    <Shield className={cn(
                        "w-5 h-5 shrink-0",
                        location.pathname === '/escrow' ? "text-emerald-400" : "group-hover:text-emerald-400"
                    )} />
                    {isSidebarOpen && <span>Escrow</span>}
                </Link>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-4 pb-6 pt-4 border-t border-white/[0.04]">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl h-11",
                        !isSidebarOpen && "justify-center px-0"
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {isSidebarOpen && <span className="ml-3">Sign Out</span>}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#020204] flex font-sans text-zinc-300">
            {/* Atmospheric Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Top-left emerald glow */}
                <div className="absolute -top-[400px] -left-[400px] w-[800px] h-[800px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
                {/* Bottom-right purple glow */}
                <div className="absolute -bottom-[400px] -right-[400px] w-[800px] h-[800px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
                {/* Center subtle glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-cyan-500/[0.015] rounded-full blur-[150px]" />
            </div>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex fixed z-40 h-screen bg-[#0a0a0c]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex-col",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <SidebarContent />

                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0a0a0c] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all z-50"
                >
                    <ChevronRight className={cn(
                        "w-3 h-3 transition-transform duration-300",
                        !isSidebarOpen && "rotate-180"
                    )} />
                </button>
            </aside>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Mobile Sidebar */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="md:hidden fixed z-50 h-screen w-[280px] bg-[#0a0a0c] border-r border-white/5"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={cn(
                "flex-1 h-screen overflow-y-auto w-full relative transition-all duration-300",
                isSidebarOpen ? "md:ml-64" : "md:ml-20"
            )}>
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                <Zap className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="font-heading font-semibold text-white">TrenchJobs</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 transition-all">
                            <Bell className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center border border-white/10">
                            <User className="w-4 h-4 text-white/70" />
                        </div>
                    </div>
                </header>

                {/* Desktop Header Bar */}
                <header className="hidden md:flex h-16 border-b border-white/[0.04] items-center justify-between px-8 bg-[#020204]/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-white">
                            {links.find(l => l.href === location.pathname)?.name || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <button className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 transition-all">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
                        </button>
                    </div>
                </header>

                <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
