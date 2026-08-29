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
            providerName: data.providerName || auth.currentUser?.displayName || 'Provider',
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
        // Simple query without orderBy to avoid index requirement
        const querySnapshot = await getDocs(collection(db, 'listings'));
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by createdAt client-side (newest first)
        listings.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        
        // Apply filters client-side
        let filteredListings = listings;
        
        if (filters.category) {
            filteredListings = filteredListings.filter(l => l.category === filters.category);
        }
        if (filters.location) {
            filteredListings = filteredListings.filter(l => l.location === filters.location);
        }
        if (filters.providerId) {
            filteredListings = filteredListings.filter(l => l.providerId === filters.providerId);
        }
        if (filters.available !== undefined) {
            filteredListings = filteredListings.filter(l => l.available === filters.available);
        }
        if (filters.verified !== undefined) {
            filteredListings = filteredListings.filter(l => l.verified === filters.verified);
        }
        
        return { success: true, data: filteredListings };
    } catch (error) {
        console.error('Error getting listings:', error);
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
        if (!listingId) {
            return { success: false, error: 'Listing ID is required' };
        }
        
        console.log('Deleting listing with ID:', listingId);
        
        // Check if user is authenticated
        if (!auth.currentUser) {
            return { success: false, error: 'You must be logged in to delete a listing' };
        }
        
        const listingRef = doc(db, 'listings', listingId);
        
        // First check if the listing exists
        const listingDoc = await getDoc(listingRef);
        if (!listingDoc.exists()) {
            return { success: false, error: 'Listing not found' };
        }
        
        // Delete the listing
        await deleteDoc(listingRef);
        console.log('Listing deleted successfully');
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
        return { success: false, error: error.message || 'Failed to delete listing' };
    }
};

// ============================================
// BOOKING SERVICES
// ============================================

export const createBooking = async (data) => {
    try {
        // Ensure all required fields are present
        const bookingData = {
            listingId: data.listingId,
            providerId: data.providerId,
            listingTitle: data.listingTitle || 'Unknown',
            startDate: data.startDate,
            endDate: data.endDate || data.startDate,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            durationType: data.durationType || 'night',
            quantity: data.quantity || 1,
            guests: parseInt(data.guests) || 1,
            totalPrice: parseFloat(data.totalPrice) || 0,
            pricePerUnit: parseFloat(data.pricePerUnit) || 0,
            touristId: data.touristId || auth.currentUser?.uid,
            touristName: data.touristName || auth.currentUser?.displayName || 'Guest',
            providerName: data.providerName || 'Provider',
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Validate required fields
        if (!bookingData.listingId) {
            return { success: false, error: 'Listing ID is required' };
        }
        if (!bookingData.providerId) {
            return { success: false, error: 'Provider ID is required' };
        }
        if (!bookingData.startDate) {
            return { success: false, error: 'Start date is required' };
        }
        if (bookingData.totalPrice <= 0) {
            return { success: false, error: 'Invalid total price' };
        }

        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        
        // Update listing bookings count
        try {
            await updateDoc(doc(db, 'listings', data.listingId), {
                bookings: increment(1)
            });
        } catch (updateError) {
            console.warn('Could not update listing count:', updateError);
        }
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: error.message || 'Failed to create booking' };
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
        
        // If no filters, get all bookings (admin)
        let q;
        if (constraints.length === 0) {
            q = collection(db, 'bookings');
        } else {
            q = query(collection(db, 'bookings'), ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        const bookings = [];
        querySnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by createdAt descending
        bookings.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB - dateA;
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
        console.error('Error updating booking status:', error);
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
            reviewerName: data.reviewerName || auth.currentUser?.displayName || 'Anonymous',
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
// NOTIFICATION SERVICES
// ============================================

export const addNotification = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'notifications'), {
            ...data,
            read: false,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding notification:', error);
        return { success: false, error: error.message };
    }
};

export const getNotifications = async (userId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const notifications = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: notifications };
    } catch (error) {
        console.error('Error getting notifications:', error);
        return { success: false, error: error.message };
    }
};

export const markNotificationRead = async (notificationId) => {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), {
            read: true,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking notification read:', error);
        return { success: false, error: error.message };
    }
};

export const markAllNotificationsRead = async (userId) => {
    try {
        const notifications = await getNotifications(userId);
        if (notifications.success) {
            const promises = notifications.data
                .filter(n => !n.read)
                .map(n => markNotificationRead(n.id));
            await Promise.all(promises);
        }
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications read:', error);
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
            sorterName: data.sorterName || auth.currentUser?.displayName || 'Sorter',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating waste log:', error);
        return { success: false, error: error.message };
    }
};

export const getUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: users };
    } catch (error) {
        console.error('Error getting users:', error);
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