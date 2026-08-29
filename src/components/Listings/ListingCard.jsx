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
        startTime: '09:00',
        endTime: '11:00',
        guests: 1
    });

    const isNightly = listing.durationType === 'night' || listing.category === 'lodging';
    const priceUnit = isNightly ? 'night' : 'hour';

    const handleBook = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            setToast({ message: 'Please login to book', type: 'error' });
            return;
        }

        if (isNightly) {
            if (!bookingData.startDate || !bookingData.endDate) {
                setToast({ message: 'Please select dates', type: 'error' });
                return;
            }
        } else {
            if (!bookingData.startDate || !bookingData.startTime || !bookingData.endTime) {
                setToast({ message: 'Please select date and time', type: 'error' });
                return;
            }
        }

        setLoading(true);
        
        try {
            let quantity = 0;
            let totalPrice = 0;
            const price = parseFloat(listing.price);
            const guests = parseInt(bookingData.guests || 1);

            if (isNightly) {
                const start = new Date(bookingData.startDate);
                const end = new Date(bookingData.endDate);
                let nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
                if (nights === 0) nights = 1;
                quantity = nights;
                totalPrice = price * guests * nights;
            } else {
                const startHour = parseInt(bookingData.startTime.split(':')[0]);
                const endHour = parseInt(bookingData.endTime.split(':')[0]);
                let hours = endHour - startHour;
                if (hours <= 0) hours = 1;
                quantity = hours;
                totalPrice = price * guests * hours;
            }

            const result = await createBooking({
                listingId: listing.id,
                providerId: listing.providerId,
                listingTitle: listing.title,
                startDate: bookingData.startDate,
                endDate: isNightly ? bookingData.endDate : bookingData.startDate,
                startTime: isNightly ? null : bookingData.startTime,
                endTime: isNightly ? null : bookingData.endTime,
                durationType: isNightly ? 'night' : 'hour',
                quantity: quantity,
                guests: parseInt(bookingData.guests || 1),
                totalPrice: totalPrice,
                touristName: userData?.name || 'Guest',
                providerName: listing.providerName || 'Provider',
                touristId: currentUser?.uid
            });

            if (result.success) {
                setToast({ 
                    message: `✅ Booking confirmed! Total: R ${totalPrice.toFixed(2)}`, 
                    type: 'success' 
                });
                setShowBooking(false);
                setBookingData({
                    startDate: '',
                    endDate: '',
                    startTime: '09:00',
                    endTime: '11:00',
                    guests: 1
                });
                if (onUpdate) onUpdate();
            } else {
                setToast({ 
                    message: result.error || 'Failed to create booking', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            setToast({ message: 'Error creating booking. Please try again.', type: 'error' });
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

    const minDate = new Date().toISOString().split('T')[0];
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="listing-card">
            {listing.imageUrl && (
                <div className="listing-image">
                    <img src={listing.imageUrl} alt={listing.title} />
                </div>
            )}
            
            <div className="listing-content">
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
                    <span className="price">
                        R {listing.price} <small>/{isNightly ? 'night' : 'hour'}</small>
                    </span>
                    {listing.capacity && (
                        <span className="capacity">👤 {listing.capacity} people</span>
                    )}
                    <span className="location">📍 {listing.location}</span>
                </div>

                {!isNightly && listing.durationHours && (
                    <div style={{ fontSize: '13px', color: '#5a7a6a', marginBottom: '8px' }}>
                        ⏱️ {listing.durationHours} hour{listing.durationHours > 1 ? 's' : ''} experience
                    </div>
                )}

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
                                <label>Date *</label>
                                <input
                                    type="date"
                                    value={bookingData.startDate}
                                    onChange={(e) => setBookingData(prev => ({
                                        ...prev,
                                        startDate: e.target.value
                                    }))}
                                    min={minDate}
                                    max={maxDateStr}
                                    required
                                />
                            </div>

                            {isNightly ? (
                                <div className="form-group">
                                    <label>End Date *</label>
                                    <input
                                        type="date"
                                        value={bookingData.endDate}
                                        onChange={(e) => setBookingData(prev => ({
                                            ...prev,
                                            endDate: e.target.value
                                        }))}
                                        min={bookingData.startDate || minDate}
                                        max={maxDateStr}
                                        required
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label>Start Time *</label>
                                            <input
                                                type="time"
                                                value={bookingData.startTime}
                                                onChange={(e) => setBookingData(prev => ({
                                                    ...prev,
                                                    startTime: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>End Time *</label>
                                            <input
                                                type="time"
                                                value={bookingData.endTime}
                                                onChange={(e) => setBookingData(prev => ({
                                                    ...prev,
                                                    endTime: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

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

                            {/* Price Summary */}
                            {bookingData.startDate && (isNightly ? bookingData.endDate : true) && (
                                <div className="booking-total" style={{ 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    padding: '12px', 
                                    borderRadius: '8px',
                                    margin: '12px 0'
                                }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                        Total: R {
                                            (() => {
                                                if (isNightly && bookingData.endDate) {
                                                    const start = new Date(bookingData.startDate);
                                                    const end = new Date(bookingData.endDate);
                                                    let nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
                                                    if (nights === 0) nights = 1;
                                                    return (parseFloat(listing.price) * parseInt(bookingData.guests || 1) * nights).toFixed(2);
                                                } else if (!isNightly) {
                                                    const startHour = parseInt(bookingData.startTime.split(':')[0]);
                                                    const endHour = parseInt(bookingData.endTime.split(':')[0]);
                                                    let hours = endHour - startHour;
                                                    if (hours <= 0) hours = 1;
                                                    return (parseFloat(listing.price) * parseInt(bookingData.guests || 1) * hours).toFixed(2);
                                                }
                                                return '0.00';
                                            })()
                                        }
                                    </div>
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
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default ListingCard;