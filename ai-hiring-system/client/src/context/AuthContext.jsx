import { createContext, useEffect, useState } from 'react';
import API from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const loginUser = async (credentials) => {
        const { data } = await API.post('/auth/login', credentials);
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const registerUser = async (payload) => {
        try {
            const { data } = await API.post('/auth/register', payload);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, loginUser, registerUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
