import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Zap, LayoutDashboard, Briefcase, MessageSquare, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletIndicator } from "@/components/wallet/WalletIndicator"

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { connected } = useWallet()
    const location = useLocation()

    // Mock auth state - in real app, this would come from auth context
    const [isLoggedIn] = useState(false)
    const [userRole] = useState<'client' | 'freelancer'>('freelancer')

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Determine if we're on a dashboard page
    const isDashboardPage = location.pathname.startsWith('/client') || location.pathname.startsWith('/freelancer')

    // Navigation links based on auth state
    const loggedOutLinks = [
        { to: "/jobs", label: "Find Work" },
        { to: "/talent", label: "Find Talent" },
        { to: "/how-it-works", label: "How It Works" },
    ]

    const loggedInLinks = userRole === 'client' ? [
        { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/client/jobs", label: "My Jobs", icon: Briefcase },
        { to: "/messages", label: "Messages", icon: MessageSquare },
        { to: "/escrow", label: "Escrow", icon: Shield },
    ] : [
        { to: "/freelancer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
        { to: "/messages", label: "Messages", icon: MessageSquare },
        { to: "/escrow", label: "Escrow", icon: Shield },
    ]

    const navLinks = isLoggedIn ? loggedInLinks : loggedOutLinks

    // Don't show main navbar on dashboard pages (they have their own layout)
    if (isDashboardPage) {
        return null
    }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/50"
                    : "bg-transparent"
            )}
        >
            <div className="container max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                            <Zap className="h-4 w-4 text-black fill-black" />
                        </div>
                        <span className="text-base font-semibold text-white">
                            TrenchJobs
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <NavLink key={link.to} to={link.to}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {connected ? (
                            // Connected state - show wallet indicator
                            <WalletIndicator />
                        ) : (
                            // Not connected - show connect button
                            <WalletMultiButton className="!bg-zinc-800 hover:!bg-zinc-700 !rounded-lg !h-9 !px-4 !text-sm !font-medium !transition-all" />
                        )}

                        {!isLoggedIn ? (
                            // Logged out actions
                            <>
                                <Link
                                    to="/auth"
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
                                >
                                    Log in
                                </Link>
                                <Link to="/auth">
                                    <Button
                                        size="sm"
                                        className="h-9 px-4 text-sm font-medium bg-white text-black hover:bg-zinc-200 rounded-md"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            // Logged in actions
                            <Link to="/profile">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-white/20 transition-all">
                                    <span className="text-xs font-bold text-white">
                                        {userRole === 'client' ? 'C' : 'F'}
                                    </span>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0a0a0a] border-b border-zinc-800"
                    >
                        <div className="px-6 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <MobileNavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </MobileNavLink>
                            ))}

                            {/* Wallet Status in Mobile */}
                            {connected && (
                                <div className="pt-2 pb-2">
                                    <WalletIndicator className="w-full justify-center" />
                                </div>
                            )}

                            <div className="pt-4 flex flex-col gap-3">
                                {!connected && (
                                    <WalletMultiButton className="!w-full !justify-center !bg-zinc-800 !h-11" />
                                )}
                                {!isLoggedIn ? (
                                    <>
                                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full h-11 border-zinc-800 text-white hover:bg-zinc-900">
                                                Log in
                                            </Button>
                                        </Link>
                                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full h-11 bg-white text-black hover:bg-zinc-200">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-11 border-zinc-800 text-white hover:bg-zinc-900">
                                            My Profile
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link
            to={to}
            className={cn(
                "text-sm font-medium px-3 py-2 rounded-md transition-colors",
                isActive
                    ? "text-white bg-zinc-800/50"
                    : "text-zinc-400 hover:text-white"
            )}
        >
            {children}
        </Link>
    )
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block text-lg font-medium text-zinc-300 hover:text-white"
        >
            {children}
        </Link>
    )
}
