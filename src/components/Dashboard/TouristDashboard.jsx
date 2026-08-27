import React from 'react';
import './Dashboard.css';

function TouristDashboard({ user }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Tourist</span>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>🌍 Book a Stay</h4>
                    <div className="stat">12</div>
                    <div className="desc">Lodges available in your area</div>
                </div>
                <div className="dashboard-card">
                    <h4>🧭 Guided Tours</h4>
                    <div className="stat">8</div>
                    <div className="desc">Experiences ready to book</div>
                </div>
                <div className="dashboard-card">
                    <h4>⭐ My Reviews</h4>
                    <div className="stat">4.8</div>
                    <div className="desc">Average rating you've given</div>
                </div>
                <div className="dashboard-card">
                    <h4>🌿 My Bookings</h4>
                    <div className="stat">3</div>
                    <div className="desc">Upcoming experiences</div>
                </div>
            </div>
        </div>
    );
}

export default TouristDashboard;