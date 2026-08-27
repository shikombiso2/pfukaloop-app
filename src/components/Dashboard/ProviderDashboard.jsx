import React from 'react';
import './Dashboard.css';

function ProviderDashboard({ user }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Provider</span>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>🏡 My Listings</h4>
                    <div className="stat">5</div>
                    <div className="desc">Active lodges / experiences</div>
                </div>
                <div className="dashboard-card">
                    <h4>💰 Earnings</h4>
                    <div className="stat">R 12,450</div>
                    <div className="desc">This month's revenue</div>
                </div>
                <div className="dashboard-card">
                    <h4>📊 Bookings</h4>
                    <div className="stat">23</div>
                    <div className="desc">Pending & completed</div>
                </div>
                <div className="dashboard-card">
                    <h4>✅ Verification</h4>
                    <div className="stat">✓</div>
                    <div className="desc">Your listings are verified</div>
                </div>
            </div>
        </div>
    );
}

export default ProviderDashboard;