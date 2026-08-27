import React from 'react';
import './Dashboard.css';

function AdminDashboard({ user }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Admin</span>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>👥 Users</h4>
                    <div className="stat">45</div>
                    <div className="desc">Active platform users</div>
                </div>
                <div className="dashboard-card">
                    <h4>🏡 Listings</h4>
                    <div className="stat">32</div>
                    <div className="desc">Total experiences</div>
                </div>
                <div className="dashboard-card">
                    <h4>📊 Revenue</h4>
                    <div className="stat">R 84,200</div>
                    <div className="desc">Total platform earnings</div>
                </div>
                <div className="dashboard-card">
                    <h4>✅ Verifications</h4>
                    <div className="stat">28</div>
                    <div className="desc">Verified providers</div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;