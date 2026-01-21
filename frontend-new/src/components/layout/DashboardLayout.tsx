import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    PlusCircle,
    Briefcase,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

interface DashboardLayoutProps {
    children: React.ReactNode
    role?: 'client' | 'freelancer'
}

export function DashboardLayout({ children, role = 'client' }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()

    const clientLinks = [
        { name: "Overview", href: "/client/dashboard", icon: LayoutDashboard },
        { name: "Post a Job", href: "/client/post-job", icon: PlusCircle },
        { name: "My Jobs", href: "/client/jobs", icon: Briefcase },
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Settings", href: "/settings", icon: Settings },
    ]

    const freelancerLinks = [
        { name: "Overview", href: "/freelancer/dashboard", icon: LayoutDashboard },
        { name: "My Proposals", href: "/freelancer/proposals", icon: Briefcase },
        { name: "Active Contracts", href: "/freelancer/contracts", icon: Wallet },
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Settings", href: "/settings", icon: Settings },
    ]

    const links = role === 'client' ? clientLinks : freelancerLinks

    return (
        <div className="min-h-screen bg-[#020204] flex font-sans text-zinc-300">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed md:relative z-40 h-screen bg-[#0a0a0c] border-r border-white/5 transition-all duration-300",
                    isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-[200%] md:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Logo & Toggle */}
                    <div className="flex items-center justify-between mb-10">
                        <Link to="/" className={cn("flex items-center gap-3", !isSidebarOpen && "md:justify-center md:w-full")}>
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                                <span className="text-white font-bold text-lg">⚡</span>
                            </div>
                            {isSidebarOpen && <span className="font-heading font-bold text-white text-xl tracking-tight">TrenchJobs</span>}
                        </Link>
                        {/* Mobile Close */}
                        <button
                            className="md:hidden text-zinc-500 hover:text-white transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = location.pathname === link.href

                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "text-white bg-white/5 border border-white/10"
                                            : "text-zinc-500 hover:text-white hover:bg-white/[0.02] hover:pl-4",
                                        !isSidebarOpen && "md:justify-center hover:pl-3"
                                    )}
                                    title={!isSidebarOpen ? link.name : undefined}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-indigo-500 rounded-r-full blur-[1px]" />
                                    )}
                                    <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-white")} />
                                    {isSidebarOpen && <span>{link.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="mt-auto space-y-6 pt-6 border-t border-white/5">
                        <div className={cn("flex", !isSidebarOpen && "justify-center")}>
                            {/* Styling the external wallet button is tricky, generally we wrap or target classes. 
                                 For now, we keep it but ensure container matches theme. 
                              */}
                            <div className="w-full">
                                <WalletMultiButton className="!bg-[#18181b] hover:!bg-[#27272a] !h-10 !w-full !rounded-xl !justify-center !font-medium !text-sm !border !border-white/10 !transition-all" />
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 border border-transparent rounded-xl",
                                !isSidebarOpen && "justify-center px-0"
                            )}
                            onClick={() => navigate('/')}
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            {isSidebarOpen && <span className="ml-3">Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto w-full relative">
                {/* Decorative Grid Background for Dashboard */}
                <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.15]" style={{ background: "url('/grid.svg')" }} />

                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-white/5 flex items-center px-4 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-heading font-semibold text-white">Dashboard</span>
                </header>

                <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
