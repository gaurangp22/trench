import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { GradientSlideButton } from "@/components/ui/GradientSlideButton"
import { useAuth } from "@/context/AuthContext"
import { ArrowRight, Mail, Lock, User, Briefcase, Shield, Zap, Check, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

const features = [
    { icon: Shield, text: "Trustless escrow protection" },
    { icon: Zap, text: "Instant SOL payments" },
    { icon: Check, text: "Verified on-chain reputation" }
]

export function Auth() {
    const [searchParams] = useSearchParams()
    const mode = searchParams.get('mode')

    const [isLogin, setIsLogin] = useState(mode !== 'signup')
    const [role, setRole] = useState<'client' | 'freelancer'>('client')
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isWalletConnecting, setIsWalletConnecting] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const { loginWithEmail, signupWithEmail, loginWithWallet, signupWithWallet, isAuthenticated, isLoading, user, needsOnboarding, setNeedsOnboarding } = useAuth()
    const { connected, publicKey, disconnect } = useWallet()
    const { setVisible } = useWalletModal()

    const formRef = useRef<HTMLDivElement>(null)
    const isFormInView = useInView(formRef, { once: true })

    // Update isLogin when URL mode changes
    useEffect(() => {
        setIsLogin(mode !== 'signup')
    }, [mode])

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const from = (location.state as any)?.from?.pathname
            // Check if user needs to complete onboarding (no profile yet)
            // New signups won't have a profile, so redirect to onboarding
            const isNewSignup = !from && !isLogin

            if (isNewSignup) {
                navigate('/onboarding', { replace: true })
            } else if (from) {
                navigate(from, { replace: true })
            } else {
                navigate(user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard', { replace: true })
            }
        }
    }, [isAuthenticated, user, navigate, location, isLogin])

    // Auto-login when wallet connects (for returning users)
    useEffect(() => {
        const autoLogin = async () => {
            if (connected && publicKey && !isAuthenticated && !isLoading && !isWalletConnecting && !needsOnboarding) {
                setIsWalletConnecting(true)
                setError(null)
                try {
                    await loginWithWallet()
                } catch (err: any) {
                    console.error("Wallet login failed:", err)
                    // If wallet not registered, show signup form with wallet pre-filled
                    if (err.response?.status === 404 ||
                        err.response?.data?.message?.includes('not registered') ||
                        err.response?.data?.error?.includes('not registered')) {
                        setIsLogin(false) // Switch to signup mode
                        setError("Wallet not registered. Please complete signup below.")
                    } else {
                        setError(err.response?.data?.message || "Wallet authentication failed")
                        disconnect()
                    }
                } finally {
                    setIsWalletConnecting(false)
                }
            }
        }
        autoLogin()
    }, [connected, publicKey, isAuthenticated, isLoading, needsOnboarding])

    const handleConnectWallet = () => {
        setError(null)
        setVisible(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (isLogin) {
                await loginWithEmail(email, password)
            } else {
                // If wallet is connected, include it in signup
                if (connected && publicKey) {
                    await signupWithWallet(email, username, role)
                } else {
                    await signupWithEmail(email, password, username, role)
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err)
            setError(err.response?.data?.message || err.response?.data?.error || err.message || "Authentication failed")
        }
    }

    const shortenAddress = (address: string) =>
        `${address.slice(0, 6)}...${address.slice(-4)}`

    return (
        <div className="min-h-screen bg-[#020204] flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-600/15 rounded-full blur-[120px]" />
                </div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }} />

                <div className="relative z-10 flex flex-col justify-center px-16 py-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-5xl font-heading font-bold text-white mb-6 leading-tight">
                            The future of
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                freelance work
                            </span>
                            <br />
                            is here.
                        </h1>

                        <p className="text-xl text-zinc-400 mb-12 max-w-md leading-relaxed">
                            Join thousands of professionals building the decentralized economy.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <span className="text-zinc-300 font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 pt-28 lg:pt-16">
                <motion.div
                    ref={formRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFormInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-heading font-bold text-white mb-3">
                            {isLogin ? "Welcome back" : "Create your account"}
                        </h2>
                        <p className="text-zinc-400">
                            {isLogin
                                ? "Sign in to continue to your dashboard"
                                : "Join the future of decentralized work"}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer",
                                isLogin
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer",
                                !isLogin
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Wallet Connection Option */}
                    <div className="mb-6">
                        {connected && publicKey ? (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">Wallet Connected</div>
                                    <div className="text-xs text-emerald-400 font-mono">{shortenAddress(publicKey.toString())}</div>
                                </div>
                                <Check className="w-5 h-5 text-emerald-400" />
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={handleConnectWallet}
                                    disabled={isWalletConnecting}
                                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                >
                                    {isWalletConnecting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span className="text-white font-medium">Connecting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-5 h-5 text-emerald-400" />
                                            <span className="text-white font-medium">Connect Wallet</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-zinc-500 mt-2 text-center">
                                    Required for funding escrow and receiving payments
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-xs text-zinc-600 uppercase tracking-wider">or continue with email</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* Form */}
                    <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a0c]">
                        {/* Role Selector (Sign Up Only) */}
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole('client')}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer",
                                        role === 'client'
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                            : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-white/15"
                                    )}
                                >
                                    <User className={cn(
                                        "w-6 h-6 mb-2 transition-colors",
                                        role === 'client' ? "text-emerald-400" : "text-zinc-500"
                                    )} />
                                    <span className="text-sm font-medium">I'm Hiring</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('freelancer')}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer",
                                        role === 'freelancer'
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                            : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-white/15"
                                    )}
                                >
                                    <Briefcase className={cn(
                                        "w-6 h-6 mb-2 transition-colors",
                                        role === 'freelancer' ? "text-emerald-400" : "text-zinc-500"
                                    )} />
                                    <span className="text-sm font-medium">I'm a Freelancer</span>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username (Sign Up Only) */}
                            {!isLogin && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="satoshi"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password - only show if wallet not connected */}
                            {(!connected || isLogin) && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="password"
                                            required={!connected || isLogin}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Wallet signup notice */}
                            {connected && !isLogin && (
                                <div className="text-xs text-zinc-500 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]">
                                    <span className="text-emerald-400">Signing up with wallet.</span> No password needed - your wallet is your authentication.
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="text-sm text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <GradientSlideButton
                                type="submit"
                                className="w-full h-12 rounded-xl font-semibold"
                                colorFrom="#10B981"
                                colorTo="#14F195"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? "Sign In" : "Create Account"}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </GradientSlideButton>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-zinc-600 text-sm mt-8">
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-4 transition-colors">
                            Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-4 transition-colors">
                            Privacy Policy
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
