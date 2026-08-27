import React, { useState } from 'react';
import './Dashboard.css';

function WasteSorterDashboard({ user }) {
    const [wasteData, setWasteData] = useState({ organic: 240, plastic: 180, glass: 90, metal: 60 });

    const addWaste = (type, amount) => {
        setWasteData(prev => ({
            ...prev,
            [type]: prev[type] + amount
        }));
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Waste Sorter</span>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>♻️ Waste Collected</h4>
                    <div className="stat">570 kg</div>
                    <div className="desc">This week</div>
                </div>
                <div className="dashboard-card">
                    <h4>📦 Pickups</h4>
                    <div className="stat">14</div>
                    <div className="desc">Scheduled this week</div>
                </div>
            </div>

            <div className="waste-module">
                <h3>♻️ Waste Management Dashboard</h3>
                <p style={{ color: '#5a7a6a', marginBottom: 16 }}>
                    Log waste volumes and track compost/upcycling destinations.
                </p>
                <div className="waste-grid">
                    <div className="waste-item">
                        <div className="label">🌿 Organic</div>
                        <div className="value">{wasteData.organic} kg</div>
                    </div>
                    <div className="waste-item">
                        <div className="label">🧴 Plastic</div>
                        <div className="value">{wasteData.plastic} kg</div>
                    </div>
                    <div className="waste-item">
                        <div className="label">🍾 Glass</div>
                        <div className="value">{wasteData.glass} kg</div>
                    </div>
                    <div className="waste-item">
                        <div className="label">🔩 Metal</div>
                        <div className="value">{wasteData.metal} kg</div>
                    </div>
                </div>
                <div className="waste-actions">
                    <button 
                        className="btn-primary" 
                        onClick={() => addWaste('organic', 10 + Math.floor(Math.random() * 20))}
                    >
                        + Log Organic
                    </button>
                    <button 
                        className="btn-primary" 
                        style={{ background: 'var(--secondary)' }}
                        onClick={() => addWaste('plastic', 5 + Math.floor(Math.random() * 15))}
                    >
                        + Log Plastic
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WasteSorterDashboard;