import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { auth, user as userApi } from '../services/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 1. Check Session on Load (Strict API Verification)
    useEffect(() => {
        const initAuth = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('suro_token') : null;
            if (token) {
                try {
                    // Call Backend to verify token validity & get fresh data
                    const res = await userApi.getProfile();
                    
                    if (res.data?.status === 'success') {
                        setUser(res.data.user);
                    } else {
                        throw new Error("Invalid Session");
                    }
                } catch (error) {
                    console.error("[AuthContext] Session Validation Failed:", error);
                    
                    // REAL WORLD BEHAVIOR:
                    // If the token is invalid or the server rejects it, 
                    // we must log the user out to prevent unauthorized access state.
                    localStorage.removeItem('suro_token');
                    setUser(null);
                    
                    // Redirect to login if not already there
                    if (router.pathname !== '/') router.push('/');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [router]);

    // 2. Login Action (Strict Proxy Handling)
    const login = async (phone, password) => {
        try {
            // Direct API call to ensure payload isn't stripped by abstract service layers
            const res = await api.post('/auth/login.php', { phone, password });
            
            if (res.data?.status === 'success') {
                localStorage.setItem('suro_token', res.data.token);
                setUser(res.data.user);
                // Note: Router push is handled by the component invoking this to prevent race conditions
                return { success: true };
            }
            return { success: false, error: res.data?.error || 'Unexpected response format' };
        } catch (error) {
            console.error("[AuthContext] Login Proxy Error:", error);
            // Return exact error from server (e.g., "Invalid credentials", "Account banned")
            const errorMsg = error.response?.data?.error || 'Connection to authentication server failed';
            return { success: false, error: errorMsg };
        }
    };

    // 3. Register Action (With Dynamic Affiliate Injection)
    const register = async (phone, password, refCode = '') => {
        try {
            // Dynamically construct payload so PHP isset() doesn't fail on null values
            const payload = { phone, password };
            if (refCode && refCode.trim() !== '') {
                payload.ref_code = refCode.trim();
            }

            const res = await api.post('/auth/register.php', payload);
            
            if (res.data?.status === 'success') {
                localStorage.setItem('suro_token', res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
            return { success: false, error: res.data?.error || 'Unexpected response format' };
        } catch (error) {
            console.error("[AuthContext] Register Proxy Error:", error);
            const errorMsg = error.response?.data?.error || 'Registration sequence failed';
            return { success: false, error: errorMsg };
        }
    };

    // 4. Logout Action
    const logout = () => {
        try { auth.logout(); } catch (e) { console.warn("Logout ping failed"); }
        localStorage.removeItem('suro_token');
        setUser(null);
        router.push('/');
    };

    // 5. State Helpers
    const updateBalance = (newBalance) => {
        setUser(prev => prev ? ({ ...prev, balance: newBalance }) : null);
    };

    const updateActivePet = (charId) => {
        setUser(prev => prev ? ({ ...prev, active_pet_id: charId }) : null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateBalance, updateActivePet, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);