import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleListings = [
    {
        title: 'Serene Mountain Lodge',
        description: 'Beautiful eco-lodge nestled in the mountains with stunning views. Perfect for nature lovers.',
        category: 'lodging',
        location: 'Drakensberg Mountains',
        price: 850,
        providerId: 'YOUR_PROVIDER_UID_HERE',
        providerName: 'Community Lodge',
        available: true,
        verified: true,
        capacity: 6,
        amenities: ['WiFi', 'Parking', 'Pool', 'Restaurant'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        bookings: 0,
        rating: 4.5,
        totalReviews: 12
    },
    {
        title: 'Wildlife Safari Tour',
        description: 'Guided safari tour with experienced local guides. See the Big Five in their natural habitat.',
        category: 'guide',
        location: 'Kruger National Park',
        price: 1200,
        providerId: 'YOUR_PROVIDER_UID_HERE',
        providerName: 'Local Guide Association',
        available: true,
        verified: true,
        capacity: 8,
        amenities: ['Transport', 'Lunch', 'Binoculars'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        bookings: 0,
        rating: 4.8,
        totalReviews: 8
    },
    {
        title: 'Traditional Cuisine Experience',
        description: 'Authentic local food prepared with traditional recipes. Learn to cook while enjoying the flavors.',
        category: 'food',
        location: 'Cape Town',
        price: 350,
        providerId: 'YOUR_PROVIDER_UID_HERE',
        providerName: 'Taste of Africa',
        available: true,
        verified: true,
        capacity: 12,
        amenities: ['Cooking Class', 'Meal Included', 'Recipe Cards'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        bookings: 0,
        rating: 4.7,
        totalReviews: 5
    }
];

async function addSampleListings() {
    try {
        for (const listing of sampleListings) {
            const docRef = await addDoc(collection(db, 'listings'), listing);
            console.log(`Added listing: ${listing.title} (ID: ${docRef.id})`);
        }
        console.log('All sample listings added successfully!');
    } catch (error) {
        console.error('Error adding sample listings:', error);
    }
}

addSampleListings();