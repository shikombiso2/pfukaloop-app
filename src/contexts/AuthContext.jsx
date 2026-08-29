import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    auth, 
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from '../firebase/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            try {
                if (user) {
                    setCurrentUser(user);
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            ...data,
                            uid: user.uid,
                            email: user.email
                        });
                    } else {
                        const newUserData = {
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName || user.email?.split('@')[0] || 'User',
                            role: 'tourist',
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                            bookings: [],
                            listings: [],
                            earnings: 0,
                            wasteLogs: [],
                            profilePicture: null,
                            phoneNumber: null,
                            location: null,
                            bio: null
                        };
                        await setDoc(userDocRef, newUserData);
                        setUserData({
                            ...newUserData,
                            uid: user.uid,
                            email: user.email
                        });
                    }
                } else {
                    setCurrentUser(null);
                    setUserData(null);
                    // Clear any stored session
                    localStorage.removeItem('pfukaloop_user');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const register = async (name, email, password, role = 'tourist') => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            const userData = {
                uid: user.uid,
                email: user.email,
                name: name,
                role: role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                bookings: [],
                listings: [],
                earnings: 0,
                wasteLogs: [],
                profilePicture: null,
                phoneNumber: null,
                location: null,
                bio: null
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            
            setUserData({
                ...userData,
                uid: user.uid,
                email: user.email
            });

            return { success: true, user: { ...user, ...userData } };
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData({
                    ...data,
                    uid: userCredential.user.uid,
                    email: userCredential.user.email
                });
                return { 
                    success: true, 
                    user: { 
                        ...userCredential.user, 
                        ...data,
                        uid: userCredential.user.uid,
                        email: userCredential.user.email
                    } 
                };
            } else {
                const newUserData = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: userCredential.user.displayName || 'User',
                    role: 'tourist',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    bookings: [],
                    listings: [],
                    earnings: 0,
                    wasteLogs: []
                };
                await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
                setUserData(newUserData);
                return { success: true, user: { ...userCredential.user, ...newUserData } };
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
            localStorage.removeItem('pfukaloop_user');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const updateUserData = async (data) => {
        try {
            if (!currentUser) throw new Error('No user logged in');
            
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            
            setUserData(prev => ({ ...prev, ...data }));
            return { success: true };
        } catch (error) {
            console.error('Update user data error:', error);
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const value = {
        currentUser,
        userData,
        loading,
        error,
        register,
        login,
        logout,
        updateUserData,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}