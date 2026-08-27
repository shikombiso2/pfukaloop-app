import React from 'react';
import WasteDashboard from '../Waste/WasteDashboard';
import './Dashboard.css';

function WasteSorterDashboard({ user }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Waste Sorter</span>
            </div>
            <WasteDashboard />
        </div>
    );
}

export default WasteSorterDashboard;