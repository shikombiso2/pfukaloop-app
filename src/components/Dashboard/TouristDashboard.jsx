import React, { useState, useEffect } from 'react';
import { getListings } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function TouristDashboard({ user }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        setLoading(true);
        setError(null);
        
        const result = await getListings({});
        
        if (result.success) {
            setListings(result.data);
        } else {
            console.error('Error loading listings:', result.error);
            if (result.needsIndex) {
                setError('Please create the required index in Firebase Console.');
                setToast({ 
                    message: 'Index needed. Please check console for link.', 
                    type: 'error' 
                });
            } else {
                setError(result.error || 'Failed to load listings');
            }
        }
        setLoading(false);
    };

    const handleBook = (listing) => {
        setToast({ message: `Booking ${listing.title} coming soon!`, type: 'success' });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2>👋 Welcome, {user.name}</h2>
                    <span className="role-badge">Tourist</span>
                </div>
                <div className="loading">Loading available experiences...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2>👋 Welcome, {user.name}</h2>
                    <span className="role-badge">Tourist</span>
                </div>
                <div className="error-container">
                    <h3>⚠️ Error Loading Listings</h3>
                    <p>{error}</p>
                    <button 
                        className="btn-primary" 
                        onClick={() => window.open('https://console.firebase.google.com/project/pfukaloop/firestore/indexes', '_blank')}
                    >
                        Create Index in Firebase
                    </button>
                    <button className="btn-outline" onClick={loadListings}>
                        Retry
                    </button>
                </div>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Tourist</span>
            </div>

            <div className="dashboard-content">
                <div className="section">
                    <h3>🌍 Available Experiences</h3>
                    {listings.length === 0 ? (
                        <p className="no-listings">No experiences available at the moment.</p>
                    ) : (
                        <div className="listings-grid">
                            {listings.map(listing => (
                                <div key={listing.id} className="listing-card">
                                    <div className="listing-card-header">
                                        <span className="category-badge">{listing.category}</span>
                                        {listing.verified && (
                                            <span className="verified-badge">✅ Verified</span>
                                        )}
                                    </div>
                                    <h4>{listing.title}</h4>
                                    <p className="listing-description">
                                        {listing.description?.substring(0, 100)}...
                                    </p>
                                    <div className="listing-details">
                                        <span className="price">R {listing.price}</span>
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
                                    <button 
                                        className="book-btn"
                                        onClick={() => handleBook(listing)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default TouristDashboard;