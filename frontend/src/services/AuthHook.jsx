// hooks/useAuth.js
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/dashboard`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
                throw new Error('Not authenticated');
            }
        } catch (error) {
            setUser(null);
            console.error('Error checking authentication:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return { user, loading, checkAuth };
};