// API Service Layer for FD Management System
const API_BASE_URL = 'http://localhost:8000';

// ============================================================================
// Token Management
// ============================================================================

export const getToken = () => localStorage.getItem('session_token');
export const setToken = (token) => localStorage.setItem('session_token', token);
export const removeToken = () => localStorage.removeItem('session_token');

// ============================================================================
// HTTP Client
// ============================================================================

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
};

const request = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['X-Session-Token'] = token;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return handleResponse(response);
};

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
    login: async (username, password) => {
        const data = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        setToken(data.session_token);
        return data;
    },

    logout: async () => {
        try {
            await request('/auth/logout', { method: 'POST' });
        } finally {
            removeToken();
        }
    },

    getCurrentUser: async () => {
        return request('/auth/me');
    },
};

// ============================================================================
// FD Operations API
// ============================================================================

export const fdAPI = {
    create: async (fdData) => {
        return request('/fd', {
            method: 'POST',
            body: JSON.stringify(fdData),
        });
    },

    list: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        const query = params.toString() ? `?${params.toString()}` : '';
        return request(`/fd${query}`);
    },

    getById: async (fdNo) => {
        return request(`/fd/${fdNo}`);
    },

    simulateClosure: async (fdNo, closureDate) => {
        return request(`/fd/${fdNo}/simulate-closure`, {
            method: 'POST',
            body: JSON.stringify({ closure_date: closureDate }),
        });
    },

    close: async (fdNo, closureDate) => {
        return request(`/fd/${fdNo}/close`, {
            method: 'POST',
            body: JSON.stringify({ closure_date: closureDate }),
        });
    },

    mature: async (fdNo) => {
        return request(`/fd/${fdNo}/mature`, {
            method: 'POST',
        });
    },

    downloadReceipt: async (fdNo) => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['X-Session-Token'] = token;
        }

        const response = await fetch(`${API_BASE_URL}/fd/${fdNo}/receipt`, {
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to download receipt');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FD_Receipt_${fdNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};

// ============================================================================
// System Configuration API
// ============================================================================

export const configAPI = {
    get: async () => {
        return request('/config');
    },

    update: async (config) => {
        return request('/config', {
            method: 'PUT',
            body: JSON.stringify(config),
        });
    },
};

// ============================================================================
// User Management API
// ============================================================================

export const userAPI = {
    list: async () => {
        return request('/users');
    },

    create: async (userData) => {
        return request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },
};
