import React, { useState, useEffect } from 'react';
import { getListings } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function TouristDashboard({ user }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        setLoading(true);
        const result = await getListings({ available: true });
        
        if (result.success) {
            setListings(result.data);
        } else {
            setToast({ 
                message: result.error || 'Failed to load listings', 
                type: 'error' 
            });
        }
        setLoading(false);
    };

    const filteredListings = listings.filter(listing => {
        if (filter === 'all') return true;
        return listing.category === filter;
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Tourist</span>
            </div>

            {/* Filter Buttons */}
            <div className="filter-section">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
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
                            <p>No experiences available in this category.</p>
                            <button className="btn-primary" onClick={loadListings}>
                                Refresh
                            </button>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {filteredListings.map(listing => (
                                <div key={listing.id} className="listing-card">
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
                                        <span className="price">R {listing.price} <small>/night</small></span>
                                        <span className="location">📍 {listing.location}</span>
                                    </div>
                                    <div className="listing-footer">
                                        <span className="rating">
                                            ⭐ {listing.rating?.toFixed(1) || 'New'} 
                                            ({listing.totalReviews || 0} reviews)
                                        </span>
                                    </div>
                                    <button 
                                        className="book-btn"
                                        onClick={() => {
                                            setToast({ 
                                                message: `Booking for "${listing.title}" coming soon!`, 
                                                type: 'success' 
                                            });
                                        }}
                                    >
                                        📅 Book Now
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