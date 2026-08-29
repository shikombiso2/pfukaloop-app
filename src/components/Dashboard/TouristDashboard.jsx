import React, { useState, useEffect } from 'react';
import { getListings } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import WriteReview from '../Reviews/WriteReview';
import './Dashboard.css';

function TouristDashboard({ user }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '11:00',
        guests: 1
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [selectedListingForReview, setSelectedListingForReview] = useState(null);

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        setLoading(true);
        try {
            const result = await getListings({ available: true });
            
            if (result.success) {
                const validListings = (result.data || []).filter(listing => 
                    listing.price && parseFloat(listing.price) > 0
                );
                setListings(validListings);
            } else {
                console.error('Error loading listings:', result.error);
                setToast({ 
                    message: result.error || 'Failed to load listings', 
                    type: 'error' 
                });
                setListings([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setToast({ message: 'Error loading listings', type: 'error' });
            setListings([]);
        }
        setLoading(false);
    };

    const handleBookNow = (listing) => {
        if (!user) {
            setToast({ message: 'Please login to book', type: 'error' });
            return;
        }
        
        if (!listing.price || parseFloat(listing.price) <= 0) {
            setToast({ 
                message: 'This listing has an invalid price. Please contact the provider.', 
                type: 'error' 
            });
            return;
        }
        
        setSelectedListing(listing);
        setShowBookingModal(true);
        setBookingData({
            startDate: '',
            endDate: '',
            startTime: '09:00',
            endTime: '11:00',
            guests: 1
        });
    };

    const handleWriteReview = (listing) => {
        setSelectedListingForReview(listing);
        setShowReview(true);
    };

    const calculateTotal = () => {
        if (!selectedListing || !bookingData.startDate) {
            return { quantity: 0, total: 0, unit: '' };
        }

        const isNightly = selectedListing.durationType === 'night' || selectedListing.category === 'lodging';
        const price = parseFloat(selectedListing.price) || 0;
        const guests = parseInt(bookingData.guests || 1);

        if (price <= 0) {
            return { quantity: 0, total: 0, unit: isNightly ? 'nights' : 'hours' };
        }

        if (isNightly) {
            if (!bookingData.endDate) {
                return { quantity: 0, total: 0, unit: 'nights' };
            }
            const start = new Date(bookingData.startDate);
            const end = new Date(bookingData.endDate);
            let nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
            if (nights === 0) nights = 1;
            const total = price * guests * nights;
            return { quantity: nights, total, unit: nights === 1 ? 'night' : 'nights' };
        } else {
            if (!bookingData.startTime || !bookingData.endTime) {
                return { quantity: 0, total: 0, unit: 'hours' };
            }
            const startHour = parseInt(bookingData.startTime.split(':')[0]);
            const endHour = parseInt(bookingData.endTime.split(':')[0]);
            let hours = endHour - startHour;
            if (hours <= 0) hours = 1;
            const total = price * guests * hours;
            return { quantity: hours, total, unit: hours === 1 ? 'hour' : 'hours' };
        }
    };

    const { quantity, total, unit } = calculateTotal();

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedListing) {
            setToast({ message: 'No listing selected', type: 'error' });
            return;
        }
        
        const isNightly = selectedListing.durationType === 'night' || selectedListing.category === 'lodging';
        
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

        const price = parseFloat(selectedListing.price);
        if (!price || price <= 0) {
            setToast({ 
                message: 'Invalid price. Please contact the provider.', 
                type: 'error' 
            });
            return;
        }

        if (total <= 0) {
            setToast({ 
                message: 'Invalid total. Please check your booking details.', 
                type: 'error' 
            });
            return;
        }

        setBookingLoading(true);
        
        try {
            const { createBooking, addNotification } = await import('../../services/firebaseServices');
            
            const bookingDataToSend = {
                listingId: selectedListing.id,
                providerId: selectedListing.providerId,
                listingTitle: selectedListing.title,
                startDate: bookingData.startDate,
                endDate: isNightly ? bookingData.endDate : bookingData.startDate,
                startTime: isNightly ? null : bookingData.startTime,
                endTime: isNightly ? null : bookingData.endTime,
                durationType: isNightly ? 'night' : 'hour',
                quantity: quantity,
                guests: parseInt(bookingData.guests || 1),
                totalPrice: total,
                pricePerUnit: price,
                touristId: user?.uid,
                touristName: user?.name || 'Guest',
                providerName: selectedListing.providerName || 'Provider'
            };

            const result = await createBooking(bookingDataToSend);

            if (result.success) {
                try {
                    await addNotification({
                        userId: selectedListing.providerId,
                        message: `🔔 New booking from ${user?.name || 'Guest'} for ${selectedListing.title} - Total: R ${total.toFixed(2)}`,
                        type: 'booking',
                        referenceId: result.id,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                } catch (notifError) {
                    console.error('Notification error:', notifError);
                }

                setToast({ 
                    message: `✅ Booking confirmed! Total: R ${total.toFixed(2)}`, 
                    type: 'success' 
                });
                setShowBookingModal(false);
                setSelectedListing(null);
                setBookingData({
                    startDate: '',
                    endDate: '',
                    startTime: '09:00',
                    endTime: '11:00',
                    guests: 1
                });
            } else {
                setToast({ 
                    message: result.error || 'Failed to create booking. Please try again.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            setToast({ 
                message: error.message || 'Error creating booking. Please try again.', 
                type: 'error' 
            });
        }
        
        setBookingLoading(false);
    };

    const filteredListings = listings.filter(listing => {
        if (filter === 'all') return true;
        return listing.category === filter;
    });

    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const isNightly = selectedListing?.durationType === 'night' || selectedListing?.category === 'lodging';
    const priceUnit = isNightly ? 'night' : 'hour';
    const displayPrice = selectedListing?.price ? parseFloat(selectedListing.price).toFixed(2) : '0.00';

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user?.name || 'Guest'}</h2>
                <span className="role-badge">Tourist</span>
            </div>

            <div className="filter-section">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({listings.length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'lodging' ? 'active' : ''}`}
                    onClick={() => setFilter('lodging')}
                >
                    🏡 Lodging
                </button>
                <button 
                    className={`filter-btn ${filter === 'guide' ? 'active' : ''}`}
                    onClick={() => setFilter('guide')}
                >
                    🧭 Guides
                </button>
                <button 
                    className={`filter-btn ${filter === 'food' ? 'active' : ''}`}
                    onClick={() => setFilter('food')}
                >
                    🍽️ Food
                </button>
                <button 
                    className={`filter-btn ${filter === 'craft' ? 'active' : ''}`}
                    onClick={() => setFilter('craft')}
                >
                    🎨 Crafts
                </button>
            </div>

            <div className="dashboard-content">
                <div className="section">
                    <h3>🌍 Available Experiences ({filteredListings.length})</h3>
                    {loading ? (
                        <div className="loading">Loading experiences...</div>
                    ) : filteredListings.length === 0 ? (
                        <div className="no-listings">
                            <p>No experiences available.</p>
                            <button className="btn-primary" onClick={loadListings}>
                                🔄 Refresh
                            </button>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {filteredListings.map(listing => {
                                const isNight = listing.durationType === 'night' || listing.category === 'lodging';
                                const price = listing.price ? parseFloat(listing.price).toFixed(2) : '0.00';
                                return (
                                    <div key={listing.id} className="listing-card">
                                        {listing.imageUrl && (
                                            <div className="listing-image">
                                                <img src={listing.imageUrl} alt={listing.title} />
                                            </div>
                                        )}
                                        <div className="listing-content">
                                            <div className="listing-card-header">
                                                <span className="category-badge">{listing.category}</span>
                                                {listing.verified && (
                                                    <span className="verified-badge">✅ Verified</span>
                                                )}
                                            </div>
                                            <h4>{listing.title}</h4>
                                            <p className="listing-description">
                                                {listing.description?.substring(0, 120)}
                                                {listing.description?.length > 120 && '...'}
                                            </p>
                                            <div className="listing-details">
                                                <span className="price">
                                                    R {price} <small>/{isNight ? 'night' : 'hour'}</small>
                                                </span>
                                                <span className="location">📍 {listing.location}</span>
                                            </div>
                                            <div className="listing-footer">
                                                <span className="rating">
                                                    ⭐ {listing.rating?.toFixed(1) || 'New'} 
                                                    ({listing.totalReviews || 0} reviews)
                                                </span>
                                                <span className="provider">
                                                    By {listing.providerName || 'Community'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    className="book-btn"
                                                    onClick={() => handleBookNow(listing)}
                                                    disabled={!listing.price || parseFloat(listing.price) <= 0}
                                                >
                                                    {!listing.price || parseFloat(listing.price) <= 0 ? 
                                                        '⚠️ Invalid Price' : 
                                                        '📅 Book Now'}
                                                </button>
                                                <button 
                                                    className="review-btn-small"
                                                    onClick={() => handleWriteReview(listing)}
                                                >
                                                    ⭐ Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Section */}
            {showReview && selectedListingForReview && (
                <div className="review-section-modal">
                    <div className="review-modal-content">
                        <div className="review-modal-header">
                            <h3>📝 Review: {selectedListingForReview.title}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowReview(false);
                                    setSelectedListingForReview(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="review-modal-body">
                            <WriteReview 
                                listingId={selectedListingForReview.id}
                                onReviewSubmitted={() => {
                                    setShowReview(false);
                                    setSelectedListingForReview(null);
                                    loadListings();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedListing && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📅 Book: {selectedListing.title}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowBookingModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="booking-details">
                                <p><strong>Location:</strong> {selectedListing.location}</p>
                                <p><strong>Price:</strong> R {displayPrice} / {priceUnit}</p>
                                <p><strong>Provider:</strong> {selectedListing.providerName || 'Community'}</p>
                                {selectedListing.capacity && (
                                    <p><strong>Max Guests:</strong> {selectedListing.capacity} people</p>
                                )}
                                {!isNightly && selectedListing.durationHours && (
                                    <p><strong>Duration:</strong> {selectedListing.durationHours} hours</p>
                                )}
                            </div>
                            <form onSubmit={handleBookingSubmit}>
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
                                    <label>Number of Guests *</label>
                                    <input
                                        type="number"
                                        value={bookingData.guests}
                                        onChange={(e) => setBookingData(prev => ({
                                            ...prev,
                                            guests: e.target.value
                                        }))}
                                        min="1"
                                        max={selectedListing.capacity || 10}
                                        required
                                    />
                                </div>
                                
                                {bookingData.startDate && (isNightly ? bookingData.endDate : true) && total > 0 && (
                                    <div className="booking-total">
                                        <h4>Total: R {total.toFixed(2)}</h4>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                                            {isNightly ? (
                                                `${quantity} ${unit} × ${bookingData.guests} guest${bookingData.guests > 1 ? 's' : ''} × R ${displayPrice}/${unit}`
                                            ) : (
                                                `${quantity} ${unit} × ${bookingData.guests} guest${bookingData.guests > 1 ? 's' : ''} × R ${displayPrice}/${unit}`
                                            )}
                                        </p>
                                        {isNightly && bookingData.startDate && bookingData.endDate && (
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                                {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                                            </p>
                                        )}
                                        {!isNightly && bookingData.startTime && bookingData.endTime && (
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                                {new Date(bookingData.startDate).toLocaleDateString()} • {bookingData.startTime} - {bookingData.endTime}
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowBookingModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                        disabled={bookingLoading || !bookingData.startDate || (isNightly && !bookingData.endDate) || total <= 0}
                                    >
                                        {bookingLoading ? 'Processing...' : '✅ Confirm Booking'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default TouristDashboard;