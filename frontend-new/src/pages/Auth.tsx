import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { login, signup } from "@/lib/api"
import { ArrowRight, Mail, Lock, User, Briefcase } from "lucide-react"

export function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [role, setRole] = useState<'client' | 'freelancer'>('client')
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                await login(email, password)
            } else {
                await signup(email, password, role)
            }
            // On success, redirect to dashboard or home
            // In a real app, you'd store the token in context/local storage here
            navigate(role === 'client' ? '/post-job' : '/jobs') // Redirect specific to role
        } catch (err: any) {
            console.error("Auth error:", err)
            setError(err.response?.data?.message || err.message || "Authentication failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 pt-24">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {isLogin ? "Welcome back" : "Create your account"}
                    </h1>
                    <p className="text-zinc-400">
                        {isLogin
                            ? "Enter your credentials to access your account"
                            : "Join the future of decentralized work"}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-zinc-900 rounded-lg mb-8 border border-zinc-800">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setRole('client')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === 'client'
                                        ? 'bg-purple-500/10 border-purple-500/50 text-white'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                    }`}
                            >
                                <User className={`w-6 h-6 mb-2 ${role === 'client' ? 'text-purple-400' : 'text-zinc-500'}`} />
                                <span className="text-sm font-medium">I'm a Client</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('freelancer')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === 'freelancer'
                                        ? 'bg-purple-500/10 border-purple-500/50 text-white'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                    }`}
                            >
                                <Briefcase className={`w-6 h-6 mb-2 ${role === 'freelancer' ? 'text-purple-400' : 'text-zinc-500'}`} />
                                <span className="text-sm font-medium">I'm a Freelancer</span>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all transition-colors"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-white text-black hover:bg-zinc-200 mt-2 font-medium"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-zinc-500 text-sm mt-8">
                    By continuing, you agree to our <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-4">Terms of Service</a> and <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-4">Privacy Policy</a>.
                </p>
            </div>
        </div>
    )
}
