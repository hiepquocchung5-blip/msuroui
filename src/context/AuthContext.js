import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, user as userApi } from '../services/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 1. Check Session on Load (Strict API Verification)
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('suro_token');
            if (token) {
                try {
                    // Call Backend to verify token validity & get fresh data
                    const res = await userApi.getProfile();
                    
                    if (res.data.status === 'success') {
                        setUser(res.data.user);
                    } else {
                        throw new Error("Invalid Session");
                    }
                } catch (error) {
                    console.error("Session Validation Failed:", error);
                    
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
    }, []);

    // 2. Login Action (Strict)
    const login = async (phone, password) => {
        try {
            const res = await auth.login(phone, password);
            if (res.data.status === 'success') {
                localStorage.setItem('suro_token', res.data.token);
                setUser(res.data.user);
                router.push('/lobby');
                return { success: true };
            }
            return { success: false, error: 'Unexpected response format' };
        } catch (error) {
            // Return exact error from server (e.g., "Invalid credentials", "Account banned")
            const errorMsg = error.response?.data?.error || 'Connection to server failed';
            return { success: false, error: errorMsg };
        }
    };

    // 3. Register Action (Strict)
    const register = async (phone, password) => {
        try {
            const res = await auth.register(phone, password);
            if (res.data.status === 'success') {
                localStorage.setItem('suro_token', res.data.token);
                setUser(res.data.user);
                router.push('/lobby');
                return { success: true };
            }
            return { success: false, error: 'Unexpected response format' };
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Registration failed';
            return { success: false, error: errorMsg };
        }
    };

    // 4. Logout Action
    const logout = () => {
        auth.logout(); // Optional: Call API to revoke token on server side
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
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateBalance, updateActivePet, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);