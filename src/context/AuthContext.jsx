/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('emergex_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem('emergex_token'));

    const login = useCallback(async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('emergex_token', data.token);
        localStorage.setItem('emergex_user', JSON.stringify(data.user));
        return data.user;
    }, []);

    const register = useCallback(async (userData) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('emergex_token', data.token);
        localStorage.setItem('emergex_user', JSON.stringify(data.user));
        return data.user;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('emergex_token');
        localStorage.removeItem('emergex_user');
    }, []);

    const updateProfile = useCallback(async (updates) => {
        const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');

        setUser(data.user);
        localStorage.setItem('emergex_user', JSON.stringify(data.user));
        return data.user;
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
