import React, { useState, useEffect, useCallback } from 'react';
import { getListings, verifyListing, getBookings, deleteListing } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function AdminDashboard({ user }) {
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('listings');
    const [stats, setStats] = useState({
        totalListings: 0,
        totalUsers: 0,
        totalBookings: 0,
        revenue: 0
    });

    // Define loadAllData with useCallback to avoid dependency issues
    const loadAllData = useCallback(async () => {
        setLoading(true);
        try {
            // Load listings
            const listingsResult = await getListings();
            let listingsData = [];
            if (listingsResult.success) {
                listingsData = listingsResult.data;
                setListings(listingsData);
            }

            // Load bookings
            const bookingsResult = await getBookings();
            let bookingsData = [];
            if (bookingsResult.success) {
                bookingsData = bookingsResult.data;
                setBookings(bookingsData);
            }

            // Calculate stats
            setStats({
                totalListings: listingsData.length || 0,
                totalUsers: 0, // You can add user count later
                totalBookings: bookingsData.length || 0,
                revenue: bookingsData.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0
            });
        } catch (error) {
            console.error('Error loading admin data:', error);
            setToast({ message: 'Error loading data', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const handleVerify = async (listingId, verified) => {
        const result = await verifyListing(listingId, verified);
        if (result.success) {
            setToast({ 
                message: `Listing ${verified ? 'verified' : 'unverified'} successfully`, 
                type: 'success' 
            });
            loadAllData();
        } else {
            setToast({ message: result.error || 'Failed to update verification', type: 'error' });
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            const result = await deleteListing(listingId);
            if (result.success) {
                setToast({ message: 'Listing deleted successfully', type: 'success' });
                loadAllData();
            } else {
                setToast({ message: result.error || 'Failed to delete listing', type: 'error' });
            }
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>👋 Welcome, {user.name}</h2>
                    <span className="role-badge">ADMIN</span>
                </div>
                <div className="admin-actions">
                    <button className="btn-primary" onClick={loadAllData}>
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>📋 Total Listings</h4>
                    <div className="stat-number">{stats.totalListings}</div>
                </div>
                <div className="stat-card">
                    <h4>👥 Total Users</h4>
                    <div className="stat-number">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <h4>📊 Total Bookings</h4>
                    <div className="stat-number">{stats.totalBookings}</div>
                </div>
                <div className="stat-card">
                    <h4>💰 Total Revenue</h4>
                    <div className="stat-number">R {stats.revenue.toFixed(2)}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    📋 Listings
                </button>
                <button 
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Users
                </button>
                <button 
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    📊 Bookings
                </button>
                <button 
                    className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    📈 Reports
                </button>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {activeTab === 'listings' && (
                    <div className="section">
                        <h3>📋 Manage Listings</h3>
                        {loading ? (
                            <div className="loading">Loading listings...</div>
                        ) : listings.length === 0 ? (
                            <p className="no-data">No listings found</p>
                        ) : (
                            <div className="admin-listings">
                                {listings.map(listing => (
                                    <div key={listing.id} className="admin-listing-item">
                                        <div className="listing-info">
                                            <h4>{listing.title}</h4>
                                            <p>
                                                {listing.category} - {listing.location}
                                                <span className="price-tag">R {listing.price}</span>
                                            </p>
                                            <div className="listing-meta">
                                                <span className={`status ${listing.verified ? 'verified' : 'unverified'}`}>
                                                    {listing.verified ? '✅ Verified' : '❌ Not Verified'}
                                                </span>
                                                <span className="provider-name">
                                                    By: {listing.providerName || 'Unknown'}
                                                </span>
                                                <span className="booking-count">
                                                    📊 {listing.bookings || 0} bookings
                                                </span>
                                                <span className="rating">
                                                    ⭐ {listing.rating?.toFixed(1) || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="listing-actions">
                                            <button 
                                                className={listing.verified ? 'btn-warning' : 'btn-primary'}
                                                onClick={() => handleVerify(listing.id, !listing.verified)}
                                            >
                                                {listing.verified ? 'Unverify' : 'Verify'}
                                            </button>
                                            <button 
                                                className="btn-danger"
                                                onClick={() => handleDeleteListing(listing.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="section">
                        <h3>👥 Manage Users</h3>
                        <p className="coming-soon">User management coming soon...</p>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="section">
                        <h3>📊 All Bookings</h3>
                        {loading ? (
                            <div className="loading">Loading bookings...</div>
                        ) : bookings.length === 0 ? (
                            <p className="no-data">No bookings found</p>
                        ) : (
                            <div className="admin-bookings">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="booking-item">
                                        <div className="booking-info">
                                            <h4>{booking.listingTitle || 'Unknown'}</h4>
                                            <p>
                                                Tourist: {booking.touristName || 'Unknown'} | 
                                                Provider: {booking.providerName || 'Unknown'}
                                            </p>
                                            <div className="booking-meta">
                                                <span className={`status ${booking.status || 'pending'}`}>
                                                    {booking.status || 'pending'}
                                                </span>
                                                <span>R {booking.totalPrice}</span>
                                                <span>
                                                    {new Date(booking.startDate?.toDate?.() || booking.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="section">
                        <h3>📈 Reports</h3>
                        <div className="reports-grid">
                            <div className="report-card">
                                <h4>📋 Listings by Category</h4>
                                <div className="report-content">
                                    {Object.entries(
                                        listings.reduce((acc, l) => {
                                            acc[l.category] = (acc[l.category] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([category, count]) => (
                                        <div key={category}>
                                            {category}: {count}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="report-card">
                                <h4>📊 Booking Status</h4>
                                <div className="report-content">
                                    {Object.entries(
                                        bookings.reduce((acc, b) => {
                                            acc[b.status] = (acc[b.status] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([status, count]) => (
                                        <div key={status}>
                                            {status}: {count}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default AdminDashboard;