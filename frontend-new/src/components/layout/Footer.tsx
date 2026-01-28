import { Link } from "react-router-dom"
import { Lightning, XLogo, GithubLogo, LinkedinLogo, ArrowUpRight, Envelope } from "@phosphor-icons/react"

export function Footer() {
    return (
        <footer className="relative bg-[#020204] overflow-hidden">
            {/* Subtle top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-violet-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                {/* Main Footer Content */}
                <div className="py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Brand Column - Takes more space */}
                        <div className="lg:col-span-5 space-y-8">
                            <Link to="/" className="inline-flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Lightning size={20} weight="fill" className="text-[#0a0a0c]" />
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">
                                    TrenchJobs
                                </span>
                            </Link>

                            <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
                                The professional marketplace for the decentralized economy.
                                Trustless payments, verified talent, instant settlements.
                            </p>

                            {/* Newsletter */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-zinc-300">Stay in the loop</p>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 max-w-xs">
                                        <Envelope size={16} weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full h-11 pl-11 pr-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <button className="h-11 px-5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm rounded-xl transition-colors">
                                        Subscribe
                                    </button>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center gap-3 pt-2">
                                <SocialLink href="https://twitter.com" icon={XLogo} label="Twitter" />
                                <SocialLink href="https://github.com" icon={GithubLogo} label="GitHub" />
                                <SocialLink href="https://linkedin.com" icon={LinkedinLogo} label="LinkedIn" />
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div className="lg:col-span-7">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                                {/* Platform */}
                                <div>
                                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                                        Platform
                                    </h4>
                                    <ul className="space-y-4">
                                        <FooterLink to="/jobs">Find Work</FooterLink>
                                        <FooterLink to="/talent">Hire Talent</FooterLink>
                                        <FooterLink to="/how-it-works">How It Works</FooterLink>
                                        <FooterLink to="/pricing">Pricing</FooterLink>
                                    </ul>
                                </div>

                                {/* Company */}
                                <div>
                                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                                        Company
                                    </h4>
                                    <ul className="space-y-4">
                                        <FooterLink to="/about">About Us</FooterLink>
                                        <FooterLink to="/blog">Blog</FooterLink>
                                        <FooterLink to="/careers">Careers</FooterLink>
                                        <FooterLink to="/contact">Contact</FooterLink>
                                    </ul>
                                </div>

                                {/* Resources */}
                                <div>
                                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                                        Resources
                                    </h4>
                                    <ul className="space-y-4">
                                        <FooterLink to="/docs" external>Documentation</FooterLink>
                                        <FooterLink to="/help">Help Center</FooterLink>
                                        <FooterLink to="/security">Security</FooterLink>
                                        <FooterLink to="/status" external>System Status</FooterLink>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-8 border-t border-white/[0.06]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Left - Copyright & Legal */}
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            <p className="text-sm text-zinc-500">
                                &copy; {new Date().getFullYear()} TrenchJobs. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6">
                                <Link to="/privacy" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link to="/terms" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>

                        {/* Right - Network Status */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="text-sm font-medium text-indigo-400">
                                    Solana Mainnet
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({
    to,
    children,
    external,
    badge
}: {
    to: string
    children: React.ReactNode
    external?: boolean
    badge?: string
}) {
    const content = (
        <span className="group flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            {children}
            {external && (
                <ArrowUpRight size={12} weight="bold" className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
            )}
            {badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 rounded">
                    {badge}
                </span>
            )}
        </span>
    )

    if (external) {
        return (
            <li>
                <a href={to} target="_blank" rel="noopener noreferrer">
                    {content}
                </a>
            </li>
        )
    }

    return (
        <li>
            <Link to={to}>{content}</Link>
        </li>
    )
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="group w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
        >
            <Icon size={16} weight="regular" />
        </a>
    )
}
