import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { GradientSlideButton } from "@/components/ui/gradient-slide-button"
import { useAuth } from "@/context/AuthContext"
import { ArrowRight, Mail, Lock, User, Briefcase, Shield, Zap, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
    { icon: Shield, text: "Trustless escrow protection" },
    { icon: Zap, text: "Instant SOL payments" },
    { icon: Check, text: "Verified on-chain reputation" }
]

export function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [role, setRole] = useState<'client' | 'freelancer'>('client')
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()
    const location = useLocation()
    const { loginWithEmail, signupWithEmail, isAuthenticated, isLoading, user } = useAuth()

    const formRef = useRef<HTMLDivElement>(null)
    const isFormInView = useInView(formRef, { once: true })

    useEffect(() => {
        if (isAuthenticated && user) {
            const from = (location.state as any)?.from?.pathname
            if (from) {
                navigate(from, { replace: true })
            } else {
                navigate(user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard', { replace: true })
            }
        }
    }, [isAuthenticated, user, navigate, location])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (isLogin) {
                await loginWithEmail(email, password)
            } else {
                await signupWithEmail(email, password, username, role)
            }
        } catch (err: any) {
            console.error("Auth error:", err)
            setError(err.response?.data?.message || err.response?.data?.error || err.message || "Authentication failed")
        }
    }

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
                                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
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
                                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                                !isLogin
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign Up
                        </button>
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
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
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
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
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

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

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
