import { Link } from "react-router-dom"
import { Zap, Twitter, Github, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-white text-black p-1.5 rounded-lg">
                                <Zap className="h-5 w-5 fill-current" />
                            </div>
                            <span className="text-lg font-bold text-white">
                                TrenchJobs
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            The professional marketplace for the decentralized economy.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={Twitter} />
                            <SocialLink href="#" icon={Github} />
                            <SocialLink href="#" icon={Linkedin} />
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Platform</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/jobs">Find Work</FooterLink>
                            <FooterLink to="/freelancers">Hire Talent</FooterLink>
                            <FooterLink to="/how-it-works">How It Works</FooterLink>
                            <FooterLink to="/pricing">Pricing</FooterLink>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Company</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/about">About Us</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/careers">Careers</FooterLink>
                            <FooterLink to="/contact">Contact</FooterLink>
                        </ul>
                    </div>

                    {/* Status */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Network</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 bg-white/5 p-2 rounded-lg border border-white/5 inline-block">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            Solana Mainnet
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} TrenchJobs.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <li>
            <Link to={to} className="text-gray-400 hover:text-white transition-colors text-sm">
                {children}
            </Link>
        </li>
    )
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a
            href={href}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
            <Icon className="h-4 w-4" />
        </a>
    )
}
