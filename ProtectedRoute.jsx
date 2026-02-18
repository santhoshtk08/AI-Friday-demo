import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireSupervisor = false }) => {
    const { isAuthenticated, isSupervisor, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireSupervisor && !isSupervisor) {
        return (
            <div className="access-denied">
                <h2>Access Denied</h2>
                <p>This page requires supervisor privileges.</p>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
