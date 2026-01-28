import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Mail, ArrowRight, Wallet, Check } from "lucide-react";
import { GradientSlideButton } from "@/components/ui/GradientSlideButton";
import { cn } from "@/lib/utils";

interface WalletOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletAddress: string;
    onComplete: (data: { username: string; email: string; role: 'client' | 'freelancer' }) => Promise<void>;
}

export function WalletOnboardingModal({
    isOpen,
    onClose,
    walletAddress,
    onComplete
}: WalletOnboardingModalProps) {
    const [step, setStep] = useState<'role' | 'details'>('role');
    const [role, setRole] = useState<'client' | 'freelancer' | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shortenAddress = (address: string) =>
        `${address.slice(0, 6)}...${address.slice(-4)}`;

    const handleRoleSelect = (selectedRole: 'client' | 'freelancer') => {
        setRole(selectedRole);
        setStep('details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setIsLoading(true);
        setError(null);

        try {
            await onComplete({ username, email, role });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'details') {
            setStep('role');
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/[0.06]">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Welcome to TrenchJobs
                                </h2>
                                <p className="text-sm text-zinc-500">
                                    Complete your profile to get started
                                </p>
                            </div>
                        </div>

                        {/* Connected Wallet */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="text-sm text-indigo-400 font-mono">
                                {shortenAddress(walletAddress)}
                            </span>
                            <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step === 'role' ? (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <h3 className="text-lg font-medium text-white mb-4">
                                    What brings you here?
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleRoleSelect('client')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all cursor-pointer",
                                            "hover:border-indigo-500/50 hover:bg-indigo-500/5",
                                            "border-white/10 bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-3">
                                            <User className="w-7 h-7 text-indigo-400" />
                                        </div>
                                        <span className="text-base font-medium text-white">I'm Hiring</span>
                                        <span className="text-xs text-zinc-500 mt-1">Find top talent</span>
                                    </button>

                                    <button
                                        onClick={() => handleRoleSelect('freelancer')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all cursor-pointer",
                                            "hover:border-indigo-500/50 hover:bg-indigo-500/5",
                                            "border-white/10 bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-3">
                                            <Briefcase className="w-7 h-7 text-violet-400" />
                                        </div>
                                        <span className="text-base font-medium text-white">I'm a Freelancer</span>
                                        <span className="text-xs text-zinc-500 mt-1">Find work</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={handleBack}
                                        className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                    <h3 className="text-lg font-medium text-white">
                                        Almost there!
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Username */}
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
                                                className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="satoshi"
                                            />
                                        </div>
                                    </div>

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
                                                className="w-full h-12 pl-12 pr-4 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-600 mt-1">
                                            For notifications only. We'll never spam.
                                        </p>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <GradientSlideButton
                                        type="submit"
                                        className="w-full h-12 rounded-xl font-semibold"
                                        colorFrom="#6366f1"
                                        colorTo="#8b5cf6"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </GradientSlideButton>
                                </form>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        <p className="text-xs text-zinc-600 text-center">
                            By creating an account, you agree to our{" "}
                            <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-2">
                                Terms
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-2">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
