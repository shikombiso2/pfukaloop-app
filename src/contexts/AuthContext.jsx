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

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            try {
                if (user) {
                    setCurrentUser(user);
                    // Fetch user data from Firestore
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
                        // Create user document if it doesn't exist
                        const newUserData = {
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName || user.email?.split('@')[0] || 'User',
                            role: 'tourist', // Default role
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                            bookings: [],
                            listings: [],
                            earnings: 0,
                            wasteLogs: [],
                            sightings: [],
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

    // Register function
    const register = async (name, email, password, role = 'tourist') => {
        try {
            setError(null);
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore with the selected role
            const userData = {
                uid: user.uid,
                email: user.email,
                name: name,
                role: role, // This is the key fix - store the role
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                bookings: [],
                listings: [],
                earnings: 0,
                wasteLogs: [],
                sightings: [],
                profilePicture: null,
                phoneNumber: null,
                location: null,
                bio: null
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            
            // Set userData with the role
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

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Fetch user data from Firestore
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
                // If no user data exists (shouldn't happen), create it
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
                    wasteLogs: [],
                    sightings: []
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

    // Logout function
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    // Update user data function
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