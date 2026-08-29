import React, { useState, useEffect } from 'react';
import { 
    getListings, 
    getBookings, 
    getUsers,
    verifyListing, 
    deleteListing,
    updateBookingStatus,
    updateUserData
} from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function AdminDashboard({ user }) {
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('listings');
    const [stats, setStats] = useState({
        totalListings: 0,
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        verifiedListings: 0,
        unverifiedListings: 0
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load listings
            const listingsResult = await getListings();
            let listingsData = [];
            if (listingsResult.success) {
                listingsData = listingsResult.data || [];
                setListings(listingsData);
            }

            // Load bookings
            const bookingsResult = await getBookings();
            let bookingsData = [];
            if (bookingsResult.success) {
                bookingsData = bookingsResult.data || [];
                setBookings(bookingsData);
            }

            // Load users
            const usersResult = await getUsers();
            let usersData = [];
            if (usersResult.success) {
                usersData = usersResult.data || [];
                setUsers(usersData);
            }

            // Calculate stats
            const verifiedListings = listingsData.filter(l => l.verified === true).length;
            const unverifiedListings = listingsData.filter(l => l.verified !== true).length;
            const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
            const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            setStats({
                totalListings: listingsData.length,
                totalUsers: usersData.length,
                totalBookings: bookingsData.length,
                totalRevenue: totalRevenue,
                pendingBookings: pendingBookings,
                verifiedListings: verifiedListings,
                unverifiedListings: unverifiedListings
            });
        } catch (error) {
            console.error('Error loading admin data:', error);
            setToast({ message: 'Error loading data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (listingId, verified) => {
        try {
            const result = await verifyListing(listingId, verified);
            if (result.success) {
                setToast({ 
                    message: `Listing ${verified ? 'verified' : 'unverified'} successfully`, 
                    type: 'success' 
                });
                loadAllData();
            } else {
                setToast({ 
                    message: result.error || 'Failed to update verification. Check Firebase rules.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Verify error:', error);
            setToast({ 
                message: 'Error: ' + (error.message || 'Failed to verify listing'), 
                type: 'error' 
            });
        }
    };

    const handleDeleteListing = async (listingId) => {
    if (window.confirm('⚠️ Are you sure you want to delete this listing? This action cannot be undone.')) {
        try {
            console.log('Attempting to delete listing:', listingId);
            const result = await deleteListing(listingId);
            console.log('Delete result:', result);
            
            if (result.success) {
                setToast({ message: '✅ Listing deleted successfully', type: 'success' });
                // Remove from local state immediately
                setListings(prev => prev.filter(l => l.id !== listingId));
                // Also reload data
                loadAllData();
            } else {
                setToast({ 
                    message: result.error || 'Failed to delete listing. Please check console for details.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            setToast({ 
                message: 'Error: ' + (error.message || 'Failed to delete listing'), 
                type: 'error' 
            });
        }
    }
};
    const handleUpdateUserRole = async (userId, newRole) => {
        const result = await updateUserData(userId, { role: newRole });
        if (result.success) {
            setToast({ message: `User role updated to ${newRole}`, type: 'success' });
            loadAllData();
        } else {
            setToast({ message: result.error || 'Failed to update user role', type: 'error' });
        }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        const result = await updateBookingStatus(bookingId, status);
        if (result.success) {
            setToast({ message: `Booking ${status}`, type: 'success' });
            loadAllData();
        } else {
            setToast({ message: result.error || 'Failed to update booking', type: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'confirmed': return '#17a2b8';
            case 'completed': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>👋 Welcome, {user?.name || 'Admin'}</h2>
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
                    <div className="stat-details">
                        <span>✅ {stats.verifiedListings} verified</span>
                        <span>❌ {stats.unverifiedListings} unverified</span>
                    </div>
                </div>
                <div className="stat-card">
                    <h4>👥 Total Users</h4>
                    <div className="stat-number">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <h4>📊 Total Bookings</h4>
                    <div className="stat-number">{stats.totalBookings}</div>
                    <div className="stat-details">
                        <span>⏳ {stats.pendingBookings} pending</span>
                    </div>
                </div>
                <div className="stat-card">
                    <h4>💰 Total Revenue</h4>
                    <div className="stat-number">R {stats.totalRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    📋 Listings ({stats.totalListings})
                </button>
                <button 
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Users ({stats.totalUsers})
                </button>
                <button 
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    📊 Bookings ({stats.totalBookings})
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
                                                {listing.price && <span className="price-tag">R {listing.price}</span>}
                                                {!listing.price && <span className="price-tag" style={{background: '#f8d7da', color: '#721c24'}}>No Price</span>}
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
                        {loading ? (
                            <div className="loading">Loading users...</div>
                        ) : users.length === 0 ? (
                            <p className="no-data">No users found</p>
                        ) : (
                            <div className="admin-users">
                                {users.map(userData => (
                                    <div key={userData.id || userData.uid} className="admin-user-item">
                                        <div className="user-info">
                                            <h4>{userData.name || userData.email || 'Unknown'}</h4>
                                            <p>{userData.email}</p>
                                            <div className="user-meta">
                                                <span className={`role-badge ${userData.role || 'tourist'}`}>
                                                    {userData.role || 'tourist'}
                                                </span>
                                                <span className="user-id">ID: {userData.uid?.substring(0, 8) || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="user-actions">
                                            <select 
                                                value={userData.role || 'tourist'}
                                                onChange={(e) => handleUpdateUserRole(userData.uid, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="tourist">Tourist</option>
                                                <option value="provider">Provider</option>
                                                <option value="waste_sorter">Waste Sorter</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    <div key={booking.id} className="admin-booking-item">
                                        <div className="booking-info">
                                            <h4>{booking.listingTitle || 'Unknown'}</h4>
                                            <p>
                                                Tourist: {booking.touristName || 'Unknown'} | 
                                                Provider: {booking.providerName || 'Unknown'}
                                            </p>
                                            <div className="booking-meta">
                                                <span 
                                                    className="status" 
                                                    style={{ background: getStatusColor(booking.status), color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}
                                                >
                                                    {booking.status || 'pending'}
                                                </span>
                                                <span>R {booking.totalPrice?.toFixed(2) || '0.00'}</span>
                                                <span>
                                                    {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span>Guests: {booking.guests || 1}</span>
                                            </div>
                                        </div>
                                        <div className="booking-actions">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button 
                                                        className="confirm-btn"
                                                        onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                                    >
                                                        ✅ Confirm
                                                    </button>
                                                    <button 
                                                        className="cancel-btn"
                                                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                                    >
                                                        ❌ Cancel
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button 
                                                    className="complete-btn"
                                                    onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                                >
                                                    ✅ Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default AdminDashboard;