import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { api, AuthAPI, type User, type Profile } from '@/lib/api';
import bs58 from 'bs58';

interface AuthUser extends User {
    username?: string;
    avatar_url?: string;
    display_name?: string;
    is_client?: boolean;
    is_freelancer?: boolean;
}

const ACTIVE_ROLE_KEY = 'trenchjob_active_role';

interface AuthContextType {
    user: AuthUser | null;
    profile: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (email: string, password: string, username: string, role: 'client' | 'freelancer') => Promise<void>;
    loginWithWallet: () => Promise<void>;
    signupWithWallet: (email: string, username: string, role: 'client' | 'freelancer') => Promise<void>;
    logout: () => void;
    needsOnboarding: boolean;
    setNeedsOnboarding: (value: boolean) => void;
    refreshProfile: () => Promise<void>;
    // Role switching
    switchRole: (role: 'client' | 'freelancer') => void;
    enableRole: (role: 'client' | 'freelancer') => Promise<void>;
    canSwitchTo: (role: 'client' | 'freelancer') => boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    loginWithEmail: async () => { },
    signupWithEmail: async () => { },
    loginWithWallet: async () => { },
    signupWithWallet: async () => { },
    logout: () => { },
    needsOnboarding: false,
    setNeedsOnboarding: () => { },
    refreshProfile: async () => { },
    switchRole: () => { },
    enableRole: async () => { },
    canSwitchTo: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { publicKey, signMessage, disconnect, connected } = useWallet();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    // Check for existing token on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Helper to determine active role from stored preference and available roles
    const determineActiveRole = (isClient: boolean, isFreelancer: boolean): 'client' | 'freelancer' => {
        const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
        if (stored === 'client' && isClient) return 'client';
        if (stored === 'freelancer' && isFreelancer) return 'freelancer';
        // Default: prefer the role they have, or freelancer if both
        return isFreelancer ? 'freelancer' : 'client';
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await api.get('/profile');
            const userData = res.data;

            // Extract user and profile from response
            if (userData.profile) {
                setProfile(userData.profile);
                // Get role flags from backend
                const isClient = userData.user?.is_client ?? false;
                const isFreelancer = userData.user?.is_freelancer ?? (userData.profile.professional_title ? true : false);
                const role = determineActiveRole(isClient, isFreelancer);
                setUser({
                    id: userData.user?.id || userData.profile.user_id,
                    email: userData.user?.email || '',
                    role: role,
                    is_client: isClient,
                    is_freelancer: isFreelancer,
                    username: userData.user?.username,
                    avatar_url: userData.profile.avatar_url,
                    display_name: userData.profile.display_name
                });
            } else if (userData.user) {
                // User exists but no profile yet - still authenticated
                const isClient = userData.user.is_client ?? false;
                const isFreelancer = userData.user.is_freelancer ?? false;
                const role = determineActiveRole(isClient, isFreelancer);
                setUser({
                    id: userData.user.id,
                    email: userData.user.email || '',
                    role: role,
                    is_client: isClient,
                    is_freelancer: isFreelancer,
                    username: userData.user.username
                });
            }
        } catch (error: any) {
            // 404 means profile not found, but user may still be authenticated
            // Only clear token on 401 (unauthorized) errors
            if (error.response?.status === 401) {
                console.error("Auth check failed - unauthorized", error);
                localStorage.removeItem('token');
                setUser(null);
                setProfile(null);
            } else if (error.response?.status === 404) {
                // Profile not found - user is authenticated but has no profile
                // Only extract from JWT if we don't already have valid user data
                // This prevents overwriting good user data set during signup
                if (!user || !user.role) {
                    console.log("Profile not found - extracting user from token");
                    try {
                        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                        const isClient = tokenPayload.is_client ?? false;
                        const isFreelancer = tokenPayload.is_freelancer ?? false;
                        const role = determineActiveRole(isClient, isFreelancer);
                        setUser({
                            id: tokenPayload.user_id || tokenPayload.sub,
                            email: tokenPayload.email || '',
                            role: role,
                            is_client: isClient,
                            is_freelancer: isFreelancer,
                            username: tokenPayload.username
                        });
                    } catch (decodeErr) {
                        console.error("Failed to decode token", decodeErr);
                    }
                }
            } else {
                console.error("Auth check failed", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await AuthAPI.login(email, password);
            // Token is already stored by AuthAPI.login

            if (response.user) {
                // Backend returns is_client/is_freelancer booleans
                const isClient = response.user.is_client ?? false;
                const isFreelancer = response.user.is_freelancer ?? false;
                const role = determineActiveRole(isClient, isFreelancer);
                setUser({
                    id: response.user.id,
                    email: response.user.email,
                    role: role,
                    is_client: isClient,
                    is_freelancer: isFreelancer,
                    username: response.user.username
                });
            }

            // Fetch full profile (may fail with 404 for new users - that's OK)
            await checkAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const signupWithEmail = async (email: string, password: string, username: string, role: 'client' | 'freelancer') => {
        setIsLoading(true);
        try {
            const response = await AuthAPI.signup(email, password, username, role);
            // Token is already stored by AuthAPI.signup

            if (response.user) {
                // Backend returns is_client/is_freelancer booleans
                const isClient = response.user.is_client ?? (role === 'client');
                const isFreelancer = response.user.is_freelancer ?? (role === 'freelancer');
                const userRole = isFreelancer ? 'freelancer' : 'client';
                // Store the initial role preference
                localStorage.setItem(ACTIVE_ROLE_KEY, userRole);
                setUser({
                    id: response.user.id,
                    email: response.user.email,
                    role: userRole,
                    is_client: isClient,
                    is_freelancer: isFreelancer,
                    username: response.user.username || username
                });
            }

            // Note: Don't call checkAuth() here - we already have user data from signup response
            // and profile won't exist yet for new users anyway
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithWallet = async () => {
        if (!publicKey || !signMessage) return;

        setIsLoading(true);
        try {
            // 1. Get Nonce
            const nonceRes = await api.get(`/wallet/nonce?address=${publicKey.toBase58()}`);
            const { nonce } = nonceRes.data;

            // 2. Sign Message
            const message = new TextEncoder().encode(
                `Sign this message to authenticate with TrenchJobs: ${nonce}`
            );
            const signature = await signMessage(message);

            // 3. Verify & Login
            const loginRes = await api.post('/auth/login/wallet', {
                address: publicKey.toBase58(),
                signature: bs58.encode(signature),
            });

            const { token, user: userData } = loginRes.data;
            localStorage.setItem('token', token);
            setUser(userData);
            setNeedsOnboarding(false);

            // Fetch full profile
            await checkAuth();
        } catch (error: any) {
            console.error("Wallet login failed", error);
            // Check if user needs to sign up (wallet not registered)
            if (error.response?.status === 404 ||
                error.response?.data?.message?.includes('not registered') ||
                error.response?.data?.error?.includes('not registered')) {
                setNeedsOnboarding(true);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signupWithWallet = async (email: string, username: string, role: 'client' | 'freelancer') => {
        if (!publicKey || !signMessage) return;

        setIsLoading(true);
        try {
            // Generate a secure random password for wallet users
            const randomPassword = crypto.randomUUID() + crypto.randomUUID();

            // Sign up with wallet address
            const response = await AuthAPI.signup(email, randomPassword, username, role, publicKey.toBase58());

            if (response.user) {
                const isClient = response.user.is_client ?? (role === 'client');
                const isFreelancer = response.user.is_freelancer ?? (role === 'freelancer');
                const userRole = isFreelancer ? 'freelancer' : 'client';
                localStorage.setItem(ACTIVE_ROLE_KEY, userRole);
                setUser({
                    id: response.user.id,
                    email: response.user.email,
                    role: userRole,
                    is_client: isClient,
                    is_freelancer: isFreelancer,
                    username: response.user.username || username
                });
            }

            setNeedsOnboarding(false);

            // Note: Don't call checkAuth() here - we already have user data from signup response
            // and profile won't exist yet for new users anyway
        } catch (error) {
            console.error("Wallet signup failed", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        setUser(null);
        setProfile(null);
        if (connected) {
            disconnect();
        }
    };

    const switchRole = (role: 'client' | 'freelancer') => {
        if (!user) return;

        // Validate user has this role
        if (role === 'client' && !user.is_client) {
            console.error('User does not have client role');
            return;
        }
        if (role === 'freelancer' && !user.is_freelancer) {
            console.error('User does not have freelancer role');
            return;
        }

        // Update localStorage
        localStorage.setItem(ACTIVE_ROLE_KEY, role);

        // Update user state
        setUser(prev => prev ? { ...prev, role } : null);
    };

    const enableRole = async (role: 'client' | 'freelancer') => {
        const response = await AuthAPI.enableRole(role);

        // Update user with new role flags
        if (response.user) {
            const isClient = response.user.is_client ?? user?.is_client ?? false;
            const isFreelancer = response.user.is_freelancer ?? user?.is_freelancer ?? false;
            localStorage.setItem(ACTIVE_ROLE_KEY, role);
            setUser(prev => prev ? {
                ...prev,
                is_client: isClient,
                is_freelancer: isFreelancer,
                role: role
            } : null);
        }
    };

    const canSwitchTo = (role: 'client' | 'freelancer'): boolean => {
        if (!user) return false;
        return role === 'client' ? !!user.is_client : !!user.is_freelancer;
    };

    const refreshProfile = async () => {
        try {
            const res = await api.get('/profile');
            const userData = res.data;

            if (userData.profile) {
                setProfile(userData.profile);
                // Also update user display info
                if (user) {
                    setUser({
                        ...user,
                        avatar_url: userData.profile.avatar_url,
                        display_name: userData.profile.display_name
                    });
                }
            }
        } catch (error) {
            console.error("Failed to refresh profile:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            isLoading,
            isAuthenticated: !!user,
            loginWithEmail,
            signupWithEmail,
            loginWithWallet,
            signupWithWallet,
            logout,
            needsOnboarding,
            setNeedsOnboarding,
            refreshProfile,
            switchRole,
            enableRole,
            canSwitchTo
        }}>
            {children}
        </AuthContext.Provider>
    );
};
