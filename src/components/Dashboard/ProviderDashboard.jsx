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
            loadListingCount();
            loadBookingStats();
        }
    }, [user, activeTab, refreshTrigger]);

    const loadListingCount = async () => {
        if (user) {
            const result = await getListings({ providerId: user.uid });
            if (result.success) {
                setListingCount(result.data.length);
            }
        }
    };

    const loadBookingStats = async () => {
        if (user) {
            const result = await getBookings({ providerId: user.uid });
            if (result.success) {
                const bookings = result.data || [];
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
        }
    };

    const handleListingCreated = () => {
        setActiveTab('listings');
        setRefreshTrigger(prev => prev + 1);
        loadListingCount();
        setToast({ message: '✅ Listing created successfully!', type: 'success' });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user?.name || 'Provider'}</h2>
                <span className="role-badge">PROVIDER</span>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>📋 My Listings</h4>
                    <div className="stat-number">{listingCount}</div>
                </div>
                <div className="stat-card">
                    <h4>📊 Total Bookings</h4>
                    <div className="stat-number">{bookingCount}</div>
                </div>
                <div className="stat-card">
                    <h4>⏳ Pending</h4>
                    <div className="stat-number">{stats.pendingBookings}</div>
                </div>
                <div className="stat-card">
                    <h4>💰 Total Revenue</h4>
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
            </div>

            <div className="dashboard-content">
                {activeTab === 'listings' && (
                    <div className="section">
                        <ListingList 
                            filters={{ providerId: user?.uid }} 
                            key={refreshTrigger}
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
                        <MyBookings />
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default ProviderDashboard;