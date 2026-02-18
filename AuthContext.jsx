import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.log('No active session');
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (username, password) => {
        const data = await authAPI.login(username, password);
        setUser({
            username: data.username,
            role: data.role,
            user_id: data.user_id,
        });
        return data;
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isOfficer: user?.role === 'officer',
        isSupervisor: user?.role === 'supervisor',
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
