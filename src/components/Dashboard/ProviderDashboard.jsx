import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreateListing from '../Listings/CreateListing';
import ListingList from '../Listings/ListingList';
import './Dashboard.css';

function ProviderDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('listings');

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Provider</span>
            </div>

            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    📋 My Listings
                </button>
                <button 
                    className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    ➕ Create Listing
                </button>
                <button 
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    📊 Bookings
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'listings' && (
                    <ListingList filters={{ providerId: user.uid }} />
                )}
                {activeTab === 'create' && (
                    <CreateListing />
                )}
                {activeTab === 'bookings' && (
                    <div className="bookings-section">
                        <h3>Your Bookings</h3>
                        {/* Booking list will be implemented */}
                        <p>Booking management coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProviderDashboard;