import React from 'react';
import './Dashboard.css';

function MonitorDashboard({ user }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Monitor</span>
            </div>
            <div className="dashboard-content">
                <div className="section">
                    <h3>📋 Monitoring Dashboard</h3>
                    <p style={{ color: '#5a7a6a', padding: '20px 0' }}>
                        Wildlife monitoring features have been removed.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MonitorDashboard;