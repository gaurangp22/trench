import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Wallet,
    Globe,
    Moon,
    Eye,
    Trash2,
    Mail,
    Smartphone,
    FileText,
    Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

const settingsTabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'wallet', label: 'Wallet Settings', icon: Wallet },
    { id: 'preferences', label: 'Preferences', icon: Globe },
]

export function Settings() {
    const { user } = useAuth()
    const currentRole = user?.role || 'freelancer'
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <DashboardLayout role={currentRole}>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-emerald-400" />
                        Settings
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="grid md:grid-cols-[260px,1fr] gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="space-y-1">
                        {settingsTabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        activeTab === tab.id
                                            ? "bg-white/[0.05] text-white border border-white/10"
                                            : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'privacy' && <PrivacySettings />}
                        {activeTab === 'wallet' && <WalletSettings />}
                        {activeTab === 'preferences' && <PreferenceSettings />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function ProfileSettings() {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Profile Settings</h3>
                <p className="text-sm text-zinc-400">
                    Update your personal information and account details.
                </p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Username</label>
                    <input
                        type="text"
                        defaultValue={user?.username || ''}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        placeholder="Your username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                    <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        placeholder="your@email.com"
                    />
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-6">
                        Save Changes
                    </Button>
                    <span className="text-xs text-zinc-500">Changes will be applied after saving</span>
                </div>
            </div>
        </div>
    )
}

function NotificationSettings() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        messages: true,
        contracts: true,
        marketing: false
    })

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const notificationOptions = [
        { key: 'email' as const, label: 'Email Notifications', description: 'Receive updates via email', icon: Mail },
        { key: 'push' as const, label: 'Push Notifications', description: 'Browser push notifications', icon: Smartphone },
        { key: 'messages' as const, label: 'Message Alerts', description: 'New message notifications', icon: Bell },
        { key: 'contracts' as const, label: 'Contract Updates', description: 'Milestone and payment alerts', icon: FileText },
        { key: 'marketing' as const, label: 'Marketing Emails', description: 'News and promotional content', icon: Globe },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Notification Settings</h3>
                <p className="text-sm text-zinc-400">
                    Control how and when you receive notifications.
                </p>
            </div>

            <div className="space-y-3">
                {notificationOptions.map(({ key, label, description, icon: Icon }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                <Icon className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white block">{label}</span>
                                <span className="text-xs text-zinc-500">{description}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleNotification(key)}
                            className={cn(
                                "w-12 h-7 rounded-full relative transition-colors",
                                notifications[key] ? "bg-emerald-500" : "bg-white/[0.1]"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
                                    notifications[key] ? "right-1" : "left-1"
                                )}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function PrivacySettings() {
    const [visibility, setVisibility] = useState('public')

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Privacy & Security</h3>
                <p className="text-sm text-zinc-400">
                    Manage your privacy settings and account security.
                </p>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                <Eye className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white block">Profile Visibility</span>
                                <span className="text-xs text-zinc-500">Who can see your profile</span>
                            </div>
                        </div>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="contacts">Contacts Only</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                <Lock className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white block">Change Password</span>
                                <span className="text-xs text-zinc-500">Update your account password</span>
                            </div>
                        </div>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/[0.05] text-sm">
                            Update
                        </Button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-white block">Delete Account</span>
                                    <span className="text-xs text-zinc-500">Permanently delete your account and data</span>
                                </div>
                            </div>
                            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm">
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function WalletSettings() {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Wallet Settings</h3>
                <p className="text-sm text-zinc-400">
                    Manage your connected wallets for payments.
                </p>
            </div>

            <div className="space-y-4">
                {user?.wallet_address ? (
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-white block">Connected Wallet</span>
                                    <span className="text-xs text-zinc-500 font-mono">
                                        {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                    Connected
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.1] text-center">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-6 h-6 text-zinc-500" />
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">No wallet connected</p>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/[0.05]">
                            Connect Wallet
                        </Button>
                    </div>
                )}

                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-white font-medium mb-1">Secure Payments</p>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                                All payments are processed through our secure escrow system on the Solana blockchain.
                                Funds are only released when milestones are completed and approved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PreferenceSettings() {
    const [darkMode, setDarkMode] = useState(true)
    const [language, setLanguage] = useState('en')

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Preferences</h3>
                <p className="text-sm text-zinc-400">
                    Customize your experience.
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                            <Moon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white block">Dark Mode</span>
                            <span className="text-xs text-zinc-500">Use dark theme across the app</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={cn(
                            "w-12 h-7 rounded-full relative transition-colors",
                            darkMode ? "bg-emerald-500" : "bg-white/[0.1]"
                        )}
                    >
                        <span
                            className={cn(
                                "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
                                darkMode ? "right-1" : "left-1"
                            )}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                            <Globe className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white block">Language</span>
                            <span className="text-xs text-zinc-500">Select your preferred language</span>
                        </div>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
