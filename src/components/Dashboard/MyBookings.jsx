import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBookings, updateBookingStatus } from '../../services/firebaseServices';
import WriteReview from '../Reviews/WriteReview';
import Toast from '../Common/Toast';
import './Dashboard.css';

function MyBookings() {
    const { userData } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [filter, setFilter] = useState('all');

    const loadBookings = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        try {
            // Get bookings based on user role
            const filters = {};
            if (userData.role === 'provider') {
                filters.providerId = userData.uid;
            } else {
                filters.touristId = userData.uid;
            }
            
            const result = await getBookings(filters);
            
            if (result.success) {
                setBookings(result.data || []);
            } else {
                console.error('Failed to load bookings:', result.error);
                setToast({ message: 'Failed to load bookings: ' + result.error, type: 'error' });
                setBookings([]);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            setToast({ message: 'Error loading bookings', type: 'error' });
            setBookings([]);
        }
        
        setLoading(false);
    }, [userData]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleUpdateStatus = async (bookingId, status) => {
        const result = await updateBookingStatus(bookingId, status);
        if (result.success) {
            setToast({ message: `Booking ${status} successfully!`, type: 'success' });
            loadBookings();
        } else {
            setToast({ message: 'Failed to update booking: ' + result.error, type: 'error' });
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

    const isBookingCompleted = (booking) => {
        if (!booking.endDate) return false;
        const endDate = new Date(booking.endDate);
        return endDate < new Date();
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

    if (loading) return <div className="loading">Loading bookings...</div>;

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h3>📊 My Bookings</h3>
                <div className="filter-section">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({bookings.length})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
                        onClick={() => setFilter('confirmed')}
                    >
                        Confirmed
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="no-listings">
                    <p>No bookings found.</p>
                    {userData?.role === 'tourist' && (
                        <p style={{ color: '#95a5a6', marginTop: '8px' }}>
                            Start exploring and book experiences!
                        </p>
                    )}
                    {userData?.role === 'provider' && (
                        <p style={{ color: '#95a5a6', marginTop: '8px' }}>
                            Bookings will appear here when tourists book your listings.
                        </p>
                    )}
                    <button 
                        className="btn-primary" 
                        onClick={loadBookings}
                        style={{ marginTop: '16px' }}
                    >
                        🔄 Refresh
                    </button>
                </div>
            ) : (
                <div className="bookings-list">
                    {filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <h4>{booking.listingTitle || 'Unknown Listing'}</h4>
                                <span 
                                    className="booking-status"
                                    style={{ 
                                        background: getStatusColor(booking.status), 
                                        color: 'white', 
                                        padding: '2px 12px', 
                                        borderRadius: '12px', 
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {booking.status?.toUpperCase() || 'PENDING'}
                                </span>
                            </div>
                            <div className="booking-details">
                                <p><strong>Provider:</strong> {booking.providerName || 'Unknown'}</p>
                                <p><strong>Tourist:</strong> {booking.touristName || 'Unknown'}</p>
                                <p><strong>Date:</strong> {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} - {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</p>
                                {booking.startTime && (
                                    <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                                )}
                                <p><strong>Guests:</strong> {booking.guests || 1}</p>
                                <p><strong>Total:</strong> R {booking.totalPrice?.toFixed(2) || '0.00'}</p>
                            </div>
                            
                            {userData?.role === 'provider' && booking.status === 'pending' && (
                                <div className="booking-actions">
                                    <button 
                                        className="confirm-btn"
                                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                    >
                                        ✅ Confirm
                                    </button>
                                    <button 
                                        className="cancel-btn"
                                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            )}
                            
                            {userData?.role === 'provider' && booking.status === 'confirmed' && (
                                <div className="booking-actions">
                                    <button 
                                        className="complete-btn"
                                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                    >
                                        ✅ Mark Complete
                                    </button>
                                </div>
                            )}
                            
                            {userData?.role === 'tourist' && isBookingCompleted(booking) && booking.status !== 'cancelled' && (
                                <button 
                                    className="review-btn"
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    ⭐ Write Review
                                </button>
                            )}
                            
                            {selectedBooking && selectedBooking.id === booking.id && (
                                <div className="review-container">
                                    <WriteReview 
                                        listingId={booking.listingId}
                                        onReviewSubmitted={() => {
                                            setSelectedBooking(null);
                                            loadBookings();
                                        }}
                                    />
                                    <button 
                                        className="cancel-btn" 
                                        onClick={() => setSelectedBooking(null)}
                                        style={{ marginTop: '8px' }}
                                    >
                                        Cancel Review
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default MyBookings;