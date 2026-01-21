import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { api, type User } from '@/lib/api';
import bs58 from 'bs58';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: async () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { publicKey, signMessage, disconnect } = useWallet();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token or just assume valid for now? 
            // Better to fetch profile to validate.
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            // We need a specific endpoint to get 'me'. 
            // The backend has GET /api/v1/profile (protected) which returns profile info inside response
            // Or we check /api/v1/auth/me if it existed.
            // Let's assume we can get user info or we just check if 401.
            const res = await api.get('/profile');
            // Assuming res.data contains user info or we map it.
            // If profile is returned:
            setUser(res.data as User);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            logout(); // Token likely invalid
        }
    };

    const login = async () => {
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

            const { token, user } = loginRes.data;
            localStorage.setItem('token', token);
            setUser(user);
        } catch (error) {
            console.error("Login failed", error);
            alert("Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
