import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Mock users database
const MOCK_USERS = [
    { id: 1, name: 'Tourist Tanya', email: 'tourist@pfukaloop.com', password: 'pass123', role: 'tourist' },
    { id: 2, name: 'Lodge Lindi', email: 'lodge@pfukaloop.com', password: 'pass123', role: 'provider' },
    { id: 3, name: 'Sorter Sipho', email: 'sorter@pfukaloop.com', password: 'pass123', role: 'waste_sorter' },
    { id: 4, name: 'Monitor Musa', email: 'monitor@pfukaloop.com', password: 'pass123', role: 'monitor' },
    { id: 5, name: 'Admin Aphiwe', email: 'admin@pfukaloop.com', password: 'pass123', role: 'admin' },
];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(MOCK_USERS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('pfukaloop_user');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const found = users.find(u => u.id === parsed.id);
                if (found) {
                    setCurrentUser(found);
                }
            } catch (e) {
                console.error('Error loading user:', e);
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('pfukaloop_user', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, error: 'Invalid email or password' };
    };

    const register = (name, email, password, role) => {
        const exists = users.find(u => u.email === email);
        if (exists) {
            return { success: false, error: 'Email already registered' };
        }
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            role,
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        localStorage.setItem('pfukaloop_user', JSON.stringify(newUser));
        return { success: true, user: newUser };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('pfukaloop_user');
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}