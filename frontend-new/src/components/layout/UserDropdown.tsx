import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronDown,
    Briefcase,
    FileText,
    Bell,
    Wallet,
    Copy,
    Check,
    ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
    onClose?: () => void;
}

export function UserDropdown({ onClose }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, profile, logout } = useAuth();
    const { publicKey, disconnect } = useWallet();

    const dashboardPath = user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
    const profilePath = user?.role === 'freelancer' ? '/freelancer/profile' : '/client/profile';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        onClose?.();
        navigate('/');
    };

    const shortenAddress = (address: string) =>
        `${address.slice(0, 4)}...${address.slice(-4)}`;

    const copyAddress = async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const menuItems = user?.role === 'client' ? [
        { icon: LayoutDashboard, label: "Dashboard", to: "/client/dashboard" },
        { icon: User, label: "My Profile", to: profilePath },
        { icon: Briefcase, label: "My Jobs", to: "/client/jobs" },
        { icon: FileText, label: "Contracts", to: "/client/contracts" },
        { icon: Bell, label: "Notifications", to: "/client/notifications" },
        { icon: Settings, label: "Settings", to: "/client/settings" },
    ] : [
        { icon: LayoutDashboard, label: "Dashboard", to: "/freelancer/dashboard" },
        { icon: User, label: "My Profile", to: profilePath },
        { icon: Briefcase, label: "My Proposals", to: "/freelancer/proposals" },
        { icon: FileText, label: "Contracts", to: "/freelancer/contracts" },
        { icon: Bell, label: "Notifications", to: "/freelancer/notifications" },
        { icon: Settings, label: "Settings", to: "/freelancer/settings" },
    ];

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
                    "hover:bg-white/[0.06]",
                    isOpen && "bg-white/[0.06]"
                )}
            >
                {/* Avatar */}
                <div className="relative">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.display_name || user?.username || "User"}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center ring-2 ring-white/10">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    )}
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0a0c]" />
                </div>

                {/* Name & Role */}
                <div className="hidden sm:flex flex-col items-start">
                    <span className="text-[13px] font-medium text-white leading-tight">
                        {profile?.display_name || user?.username || "User"}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider leading-tight">
                        {user?.role}
                    </span>
                </div>

                <ChevronDown className={cn(
                    "w-4 h-4 text-zinc-500 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 py-2 rounded-xl bg-[#0f0f12] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden z-50"
                    >
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.display_name || user?.username || "User"}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">
                                        {profile?.display_name || user?.username || "User"}
                                    </div>
                                    <div className="text-xs text-zinc-500 truncate">
                                        {user?.email || "No email"}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Info */}
                            {publicKey && (
                                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                    <Wallet className="w-4 h-4 text-zinc-500" />
                                    <span className="text-xs font-mono text-zinc-400 flex-1">
                                        {shortenAddress(publicKey.toString())}
                                    </span>
                                    <button
                                        onClick={copyAddress}
                                        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                        title="Copy address"
                                    >
                                        {copied ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                        )}
                                    </button>
                                    <a
                                        href={`https://solscan.io/account/${publicKey.toString()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                        title="View on Solscan"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => { setIsOpen(false); onClose?.(); }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Logout */}
                        <div className="pt-2 border-t border-white/[0.06]">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
