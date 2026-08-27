import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot
} from '../firebase/config';

// ============= USER SERVICES =============

export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        }
        return { success: false, error: 'User not found' };
    } catch (error) {
        console.error('Error getting user data:', error);
        return { success: false, error: error.message };
    }
};

export const updateUserData = async (uid, data) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user data:', error);
        return { success: false, error: error.message };
    }
};

// ============= LISTING SERVICES =============

export const createListing = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'listings'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            available: true,
            views: 0,
            bookings: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating listing:', error);
        return { success: false, error: error.message };
    }
};

export const getListings = async (filters = {}) => {
    try {
        let q = collection(db, 'listings');
        const constraints = [];
        
        // Add filters
        if (filters.category) {
            constraints.push(where('category', '==', filters.category));
        }
        if (filters.location) {
            constraints.push(where('location', '==', filters.location));
        }
        if (filters.available !== undefined) {
            constraints.push(where('available', '==', filters.available));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(query(q, ...constraints));
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: listings };
    } catch (error) {
        console.error('Error getting listings:', error);
        return { success: false, error: error.message };
    }
};

// ============= BOOKING SERVICES =============

export const createBooking = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'pending'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: error.message };
    }
};

export const getUserBookings = async (userId) => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('touristId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const bookings = [];
        querySnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: bookings };
    } catch (error) {
        console.error('Error getting bookings:', error);
        return { success: false, error: error.message };
    }
};

// ============= WASTE LOG SERVICES =============

export const createWasteLog = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'wasteLogs'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating waste log:', error);
        return { success: false, error: error.message };
    }
};

export const getWasteLogs = async (sorterId) => {
    try {
        const q = query(
            collection(db, 'wasteLogs'),
            where('sorterId', '==', sorterId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: logs };
    } catch (error) {
        console.error('Error getting waste logs:', error);
        return { success: false, error: error.message };
    }
};

// ============= SIGHTING SERVICES =============

export const createSighting = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'sightings'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating sighting:', error);
        return { success: false, error: error.message };
    }
};

export const getSightings = async () => {
    try {
        const q = query(
            collection(db, 'sightings'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const sightings = [];
        querySnapshot.forEach((doc) => {
            sightings.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: sightings };
    } catch (error) {
        console.error('Error getting sightings:', error);
        return { success: false, error: error.message };
    }
};

// ============= REAL-TIME SUBSCRIPTIONS =============

export const subscribeToCollection = (collectionName, callback, filters = {}) => {
    try {
        let q = collection(db, collectionName);
        const constraints = [];
        
        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
            constraints.push(where(key, '==', value));
        });
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        return onSnapshot(query(q, ...constraints), (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            callback({ success: true, data });
        }, (error) => {
            console.error('Subscription error:', error);
            callback({ success: false, error: error.message });
        });
    } catch (error) {
        console.error('Error setting up subscription:', error);
        return () => {}; // Return empty unsubscribe function
    }
};