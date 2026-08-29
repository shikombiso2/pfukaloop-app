import React, { useState, useEffect } from 'react';
import CreateListing from '../Listings/CreateListing';
import ListingList from '../Listings/ListingList';
import MyBookings from './MyBookings';
import { getListings, getBookings } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function ProviderDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('listings');
    const [listingCount, setListingCount] = useState(0);
    const [bookingCount, setBookingCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingBookings: 0,
        completedBookings: 0
    });

    useEffect(() => {
        if (user) {
            loadProviderData();
        }
    }, [user, refreshTrigger]);

    const loadProviderData = async () => {
        if (!user) return;
        
        try {
            // Get provider's own listings
            const listingsResult = await getListings({ providerId: user.uid });
            if (listingsResult.success) {
                const listings = listingsResult.data || [];
                setListingCount(listings.length);
            }

            // Get bookings for provider's listings
            const bookingsResult = await getBookings({ providerId: user.uid });
            if (bookingsResult.success) {
                const bookings = bookingsResult.data || [];
                setBookingCount(bookings.length);
                
                const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                const pendingBookings = bookings.filter(b => b.status === 'pending').length;
                const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length;
                
                setStats({
                    totalRevenue,
                    pendingBookings,
                    completedBookings
                });
            }
        } catch (error) {
            console.error('Error loading provider data:', error);
            setToast({ message: 'Error loading data', type: 'error' });
        }
    };

    const handleListingCreated = () => {
        setActiveTab('listings');
        setRefreshTrigger(prev => prev + 1);
        loadProviderData();
        setToast({ message: '✅ Listing created successfully!', type: 'success' });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user?.name || 'Provider'}</h2>
                <span className="role-badge">PROVIDER</span>
            </div>

            {/* Stats Cards - Only for provider's own data */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>📋 My Listings</h4>
                    <div className="stat-number">{listingCount}</div>
                </div>
                <div className="stat-card">
                    <h4>📊 My Bookings</h4>
                    <div className="stat-number">{bookingCount}</div>
                </div>
                <div className="stat-card">
                    <h4>⏳ Pending</h4>
                    <div className="stat-number">{stats.pendingBookings}</div>
                </div>
                <div className="stat-card">
                    <h4>💰 My Revenue</h4>
                    <div className="stat-number">R {stats.totalRevenue.toFixed(2)}</div>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    📋 My Listings ({listingCount})
                </button>
                <button 
                    className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    ➕ Create Listing
                </button>
                <button 
                    className={`tab ${activeTab === 'mybookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mybookings')}
                >
                    📊 My Bookings ({bookingCount})
                </button>
                <button 
                    className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                >
                    🌍 Browse Listings
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'listings' && (
                    <div className="section">
                        <h3>📋 My Listings</h3>
                        <p style={{ color: '#5a7a6a', marginBottom: '16px' }}>
                            These are the listings you have created. You cannot book your own listings.
                        </p>
                        <ListingList 
                            filters={{ providerId: user?.uid }} 
                            key={refreshTrigger}
                            hideBookButton={true}
                        />
                    </div>
                )}
                {activeTab === 'create' && (
                    <div className="section">
                        <CreateListing onListingCreated={handleListingCreated} />
                    </div>
                )}
                {activeTab === 'mybookings' && (
                    <div className="section">
                        <h3>📊 My Bookings</h3>
                        <p style={{ color: '#5a7a6a', marginBottom: '16px' }}>
                            Bookings received for your listings
                        </p>
                        <MyBookings />
                    </div>
                )}
                {activeTab === 'browse' && (
                    <div className="section">
                        <h3>🌍 Browse Other Listings</h3>
                        <p style={{ color: '#5a7a6a', marginBottom: '16px' }}>
                            Explore and book experiences from other providers
                        </p>
                        <ListingList 
                            filters={{}} 
                            hideOwnListing={true}
                            currentUserId={user?.uid}
                        />
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default ProviderDashboard;