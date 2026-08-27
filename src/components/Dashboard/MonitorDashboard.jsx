import React from 'react';
import './Dashboard.css';

function MonitorDashboard({ user }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Environmental Monitor</span>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>📷 Camera Traps</h4>
                    <div className="stat">6</div>
                    <div className="desc">Active in the field</div>
                </div>
                <div className="dashboard-card">
                    <h4>🐾 Wildlife Sightings</h4>
                    <div className="stat">43</div>
                    <div className="desc">Reported this month</div>
                </div>
            </div>

            <div className="waste-module">
                <h3>📷 Wildlife & Environment Monitoring</h3>
                <p style={{ color: '#5a7a6a', marginBottom: 16 }}>
                    Camera traps and community reporting tools.
                </p>
                <div className="camera-grid">
                    <div className="camera-card">
                        <div className="cam-icon">📸</div>
                        <div><strong>Cam #1</strong></div>
                        <div className="cam-status">🟢 Online</div>
                        <div style={{ fontSize: 12, color: '#5a7a6a' }}>Last: 2 min ago</div>
                    </div>
                    <div className="camera-card">
                        <div className="cam-icon">📸</div>
                        <div><strong>Cam #2</strong></div>
                        <div className="cam-status">🟡 Buffering</div>
                        <div style={{ fontSize: 12, color: '#5a7a6a' }}>Last: 15 min ago</div>
                    </div>
                    <div className="camera-card">
                        <div className="cam-icon">📸</div>
                        <div><strong>Cam #3</strong></div>
                        <div className="cam-status">🟢 Online</div>
                        <div style={{ fontSize: 12, color: '#5a7a6a' }}>Last: 1 min ago</div>
                    </div>
                    <div className="camera-card" style={{ background: 'var(--accent)' }}>
                        <div className="cam-icon">🐘</div>
                        <div><strong>Recent Sighting</strong></div>
                        <div className="cam-status">Elephant herd</div>
                        <div style={{ fontSize: 12, color: '#1a3b2e' }}>Reported by Musa</div>
                    </div>
                </div>
                <button className="btn-primary" style={{ marginTop: 8 }}>
                    Sync Camera Data
                </button>
            </div>
        </div>
    );
}

export default MonitorDashboard;