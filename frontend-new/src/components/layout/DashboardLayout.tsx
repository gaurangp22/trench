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
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed md:relative z-40 h-screen bg-zinc-900/50 border-r border-zinc-800 transition-all duration-300 backdrop-blur-xl",
                    isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-[200%] md:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Logo & Toggle */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <Link to="/" className={cn("flex items-center gap-2", !isSidebarOpen && "md:justify-center md:w-full")}>
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
                                <span className="text-black font-bold">⚡</span>
                            </div>
                            {isSidebarOpen && <span className="font-bold text-white text-lg">TrenchJobs</span>}
                        </Link>
                        {/* Mobile Close */}
                        <button
                            className="md:hidden text-zinc-400"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = location.pathname === link.href

                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                                        isActive
                                            ? "bg-zinc-800 text-white"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                                        !isSidebarOpen && "md:justify-center"
                                    )}
                                    title={!isSidebarOpen ? link.name : undefined}
                                >
                                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-purple-400" : "group-hover:text-purple-400")} />
                                    {isSidebarOpen && <span>{link.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="mt-auto space-y-4 pt-4 border-t border-zinc-800">
                        <div className={cn("flex", !isSidebarOpen && "justify-center")}>
                            <WalletMultiButton className="!bg-zinc-800 !h-10 !w-full !justify-center !px-0" />
                        </div>

                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-400",
                                !isSidebarOpen && "justify-center px-0"
                            )}
                            onClick={() => navigate('/')}
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            {isSidebarOpen && <span className="ml-3">Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto w-full">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-semibold text-white">Dashboard</span>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
