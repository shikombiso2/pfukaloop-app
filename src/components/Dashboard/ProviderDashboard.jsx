import React, { useState } from 'react';
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
                    📋 My Listings ({user.listings?.length || 0})
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
                    <div className="section">
                        <ListingList filters={{ providerId: user.uid }} />
                    </div>
                )}
                {activeTab === 'create' && (
                    <div className="section">
                        <CreateListing />
                    </div>
                )}
                {activeTab === 'bookings' && (
                    <div className="section">
                        <div className="bookings-section">
                            <h3>📊 Your Bookings</h3>
                            <p style={{ color: '#5a7a6a', marginBottom: '16px' }}>
                                View and manage bookings for your listings
                            </p>
                            <div className="booking-stats">
                                <div className="stat-card">
                                    <h4>Total Bookings</h4>
                                    <div className="stat-number">0</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Pending</h4>
                                    <div className="stat-number">0</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Completed</h4>
                                    <div className="stat-number">0</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Revenue</h4>
                                    <div className="stat-number">R 0</div>
                                </div>
                            </div>
                            <p style={{ textAlign: 'center', color: '#95a5a6', padding: '20px 0' }}>
                                Bookings will appear here once customers book your listings
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProviderDashboard;