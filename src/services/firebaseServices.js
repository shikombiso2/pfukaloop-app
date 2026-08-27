import { 
    db, 
    auth,
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
    onSnapshot,
    increment
} from '../firebase/config';

// ============================================
// USER SERVICES
// ============================================

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

// ============================================
// LISTING SERVICES
// ============================================

export const createListing = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'listings'), {
            ...data,
            providerId: data.providerId || auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            available: true,
            verified: false,
            views: 0,
            bookings: 0,
            rating: 0,
            totalReviews: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating listing:', error);
        return { success: false, error: error.message };
    }
};

export const getListings = async (filters = {}) => {
    try {
        let constraints = [];
        
        // Only add where clauses if they exist
        if (filters.category) {
            constraints.push(where('category', '==', filters.category));
        }
        if (filters.location) {
            constraints.push(where('location', '==', filters.location));
        }
        if (filters.providerId) {
            constraints.push(where('providerId', '==', filters.providerId));
        }
        
        // Only filter by available if explicitly set
        if (filters.available !== undefined) {
            constraints.push(where('available', '==', filters.available));
        }
        
        // Only add orderBy if we have at least one where clause
        // or if we want to order without filters
        if (constraints.length > 0) {
            constraints.push(orderBy('createdAt', 'desc'));
            const q = query(collection(db, 'listings'), ...constraints);
            const querySnapshot = await getDocs(q);
            const listings = [];
            querySnapshot.forEach((doc) => {
                listings.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: listings };
        } else {
            // If no filters, just get all listings ordered by createdAt
            const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const listings = [];
            querySnapshot.forEach((doc) => {
                listings.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: listings };
        }
    } catch (error) {
        console.error('Error getting listings:', error);
        // If it's an index error, return a helpful message
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
            return { 
                success: false, 
                error: 'Please create the required index in Firebase Console',
                needsIndex: true,
                message: error.message
            };
        }
        return { success: false, error: error.message };
    }
};

export const getListingById = async (listingId) => {
    try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                views: increment(1)
            });
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        }
        return { success: false, error: 'Listing not found' };
    } catch (error) {
        console.error('Error getting listing:', error);
        return { success: false, error: error.message };
    }
};

export const updateListing = async (listingId, data) => {
    try {
        await updateDoc(doc(db, 'listings', listingId), {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating listing:', error);
        return { success: false, error: error.message };
    }
};

export const deleteListing = async (listingId) => {
    try {
        await deleteDoc(doc(db, 'listings', listingId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// BOOKING SERVICES
// ============================================

export const createBooking = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...data,
            touristId: data.touristId || auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'pending',
            paymentStatus: 'pending'
        });
        
        await updateDoc(doc(db, 'listings', data.listingId), {
            bookings: increment(1)
        });
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: error.message };
    }
};

export const getBookings = async (filters = {}) => {
    try {
        let constraints = [];
        
        if (filters.touristId) {
            constraints.push(where('touristId', '==', filters.touristId));
        }
        if (filters.providerId) {
            constraints.push(where('providerId', '==', filters.providerId));
        }
        if (filters.status) {
            constraints.push(where('status', '==', filters.status));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        const q = query(collection(db, 'bookings'), ...constraints);
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

export const updateBookingStatus = async (bookingId, status) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: status,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating booking:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// REVIEW SERVICES
// ============================================

export const createReview = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'reviews'), {
            ...data,
            reviewerId: data.reviewerId || auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            helpful: 0
        });
        
        const listingRef = doc(db, 'listings', data.listingId);
        const listingDoc = await getDoc(listingRef);
        if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            const newTotal = (listingData.totalReviews || 0) + 1;
            const newRating = ((listingData.rating || 0) * (listingData.totalReviews || 0) + data.rating) / newTotal;
            
            await updateDoc(listingRef, {
                rating: newRating,
                totalReviews: newTotal
            });
        }
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating review:', error);
        return { success: false, error: error.message };
    }
};

export const getReviews = async (listingId) => {
    try {
        const q = query(
            collection(db, 'reviews'),
            where('listingId', '==', listingId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: reviews };
    } catch (error) {
        console.error('Error getting reviews:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// WASTE LOG SERVICES
// ============================================

export const createWasteLog = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'wasteLogs'), {
            ...data,
            sorterId: data.sorterId || auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating waste log:', error);
        return { success: false, error: error.message };
    }
};

export const getWasteLogs = async (filters = {}) => {
    try {
        let constraints = [];
        
        if (filters.sorterId) {
            constraints.push(where('sorterId', '==', filters.sorterId));
        }
        if (filters.wasteType) {
            constraints.push(where('wasteType', '==', filters.wasteType));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        const q = query(collection(db, 'wasteLogs'), ...constraints);
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

// ============================================
// WILDLIFE SIGHTING SERVICES
// ============================================

export const createSighting = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'sightings'), {
            ...data,
            monitorId: data.monitorId || auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            verified: false
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating sighting:', error);
        return { success: false, error: error.message };
    }
};

export const getSightings = async (filters = {}) => {
    try {
        let constraints = [];
        
        if (filters.monitorId) {
            constraints.push(where('monitorId', '==', filters.monitorId));
        }
        if (filters.verified !== undefined) {
            constraints.push(where('verified', '==', filters.verified));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        const q = query(collection(db, 'sightings'), ...constraints);
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

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export const subscribeToCollection = (collectionName, callback, filters = {}) => {
    try {
        let constraints = [];
        
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'orderBy') {
                constraints.push(orderBy(value.field, value.direction || 'desc'));
            } else {
                constraints.push(where(key, '==', value));
            }
        });
        
        if (!filters.orderBy) {
            constraints.push(orderBy('createdAt', 'desc'));
        }
        
        const q = query(collection(db, collectionName), ...constraints);
        
        return onSnapshot(q, (snapshot) => {
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
        return () => {};
    }
};

// ============================================
// VERIFICATION SERVICES
// ============================================

export const verifyListing = async (listingId, verified = true) => {
    try {
        await updateDoc(doc(db, 'listings', listingId), {
            verified: verified,
            verifiedAt: serverTimestamp(),
            verifiedBy: auth.currentUser?.uid
        });
        return { success: true };
    } catch (error) {
        console.error('Error verifying listing:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// PAYMENT SERVICES (Mock)
// ============================================

export const processPayment = async (bookingId, paymentData) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            paymentStatus: 'completed',
            paymentData: paymentData,
            paidAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error processing payment:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// UTILITY SERVICES
// ============================================

export const getCollectionData = async (collectionName, filters = {}) => {
    try {
        let constraints = [];
        
        Object.entries(filters).forEach(([key, value]) => {
            if (key !== 'orderBy') {
                constraints.push(where(key, '==', value));
            }
        });
        
        if (filters.orderBy) {
            constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction || 'desc'));
        } else {
            constraints.push(orderBy('createdAt', 'desc'));
        }
        
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data };
    } catch (error) {
        console.error('Error getting collection data:', error);
        return { success: false, error: error.message };
    }
};