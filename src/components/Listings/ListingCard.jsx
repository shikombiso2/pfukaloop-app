import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createBooking } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Listing.css';

function ListingCard({ listing, onUpdate }) {
    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        guests: 1
    });

    const handleBook = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            setToast({ message: 'Please login to book', type: 'error' });
            return;
        }

        if (!bookingData.startDate || !bookingData.endDate) {
            setToast({ message: 'Please select dates', type: 'error' });
            return;
        }

        // Validate dates
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        if (end < start) {
            setToast({ message: 'End date must be after start date', type: 'error' });
            return;
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days < 1) {
            setToast({ message: 'Minimum booking is 1 day', type: 'error' });
            return;
        }

        setLoading(true);
        const totalPrice = parseFloat(listing.price) * parseInt(bookingData.guests) * days;
        
        const result = await createBooking({
            listingId: listing.id,
            providerId: listing.providerId,
            listingTitle: listing.title,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            guests: parseInt(bookingData.guests),
            totalPrice: totalPrice,
            touristName: userData?.name || 'Guest',
            providerName: listing.providerName || 'Provider'
        });

        if (result.success) {
            setToast({ 
                message: `✅ Booking confirmed! Total: R ${totalPrice.toFixed(2)}`, 
                type: 'success' 
            });
            setShowBooking(false);
            setBookingData({ startDate: '', endDate: '', guests: 1 });
            if (onUpdate) onUpdate();
        } else {
            setToast({ message: result.error || 'Failed to create booking', type: 'error' });
        }
        setLoading(false);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            lodging: '🏡',
            guide: '🧭',
            food: '🍽️',
            craft: '🎨'
        };
        return icons[category] || '📌';
    };

    // Calculate minimum date for booking (today)
    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div className="listing-card">
            <div className="listing-header">
                <span className="category-badge">
                    {getCategoryIcon(listing.category)} {listing.category}
                </span>
                {listing.verified && (
                    <span className="verified-badge">✅ Verified</span>
                )}
                {!listing.available && (
                    <span className="unavailable-badge">❌ Unavailable</span>
                )}
            </div>
            
            <h3>{listing.title}</h3>
            <p className="listing-description">{listing.description}</p>
            
            <div className="listing-details">
                <span className="price">R {listing.price} <small>/night</small></span>
                {listing.capacity && (
                    <span className="capacity">👤 {listing.capacity} people</span>
                )}
                <span className="location">📍 {listing.location}</span>
            </div>

            <div className="listing-footer">
                <div className="rating">
                    ⭐ {listing.rating?.toFixed(1) || 'New'} ({listing.totalReviews || 0} reviews)
                </div>
                <div className="provider">
                    By {listing.providerName || 'Community Provider'}
                </div>
            </div>

            {listing.available && (
                <button 
                    className="book-btn"
                    onClick={() => setShowBooking(!showBooking)}
                    disabled={!currentUser}
                >
                    {currentUser ? '📅 Book Now' : '🔒 Login to Book'}
                </button>
            )}

            {showBooking && (
                <div className="booking-form">
                    <h4>📅 Book This Experience</h4>
                    <form onSubmit={handleBook}>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={bookingData.startDate}
                                onChange={(e) => setBookingData(prev => ({
                                    ...prev,
                                    startDate: e.target.value
                                }))}
                                min={minDate}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={bookingData.endDate}
                                onChange={(e) => setBookingData(prev => ({
                                    ...prev,
                                    endDate: e.target.value
                                }))}
                                min={bookingData.startDate || minDate}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Number of Guests</label>
                            <input
                                type="number"
                                value={bookingData.guests}
                                onChange={(e) => setBookingData(prev => ({
                                    ...prev,
                                    guests: e.target.value
                                }))}
                                min="1"
                                max={listing.capacity || 10}
                                required
                            />
                        </div>
                        {bookingData.startDate && bookingData.endDate && (
                            <div className="booking-total">
                                Total: R {
                                    (parseFloat(listing.price) * 
                                    parseInt(bookingData.guests) * 
                                    Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
                                    ).toFixed(2)
                                }
                                <small style={{ display: 'block', fontSize: '12px', color: '#5a7a6a' }}>
                                    ({Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} nights × {bookingData.guests} guests)
                                </small>
                            </div>
                        )}
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : '✅ Confirm Booking'}
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => setShowBooking(false)}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default ListingCard;