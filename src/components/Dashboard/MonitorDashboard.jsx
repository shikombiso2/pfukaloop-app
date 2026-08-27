import React, { useState, useEffect, useCallback } from 'react';
import { getSightings, createSighting } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function MonitorDashboard({ user }) {
    const [sightings, setSightings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        species: '',
        location: '',
        description: '',
        images: []
    });

    // Define loadSightings with useCallback
    const loadSightings = useCallback(async () => {
        const result = await getSightings({ monitorId: user.uid });
        if (result.success) {
            setSightings(result.data);
        }
        setLoading(false);
    }, [user.uid]);

    useEffect(() => {
        loadSightings();
    }, [loadSightings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.species || !formData.location) {
            setToast({ message: 'Please fill in required fields', type: 'error' });
            return;
        }

        const result = await createSighting({
            ...formData,
            monitorId: user.uid,
            monitorName: user.name
        });

        if (result.success) {
            setToast({ message: 'Sighting reported successfully!', type: 'success' });
            setFormData({ species: '', location: '', description: '', images: [] });
            setShowForm(false);
            loadSightings();
        } else {
            setToast({ message: result.error || 'Failed to report sighting', type: 'error' });
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>👋 Welcome, {user.name}</h2>
                <span className="role-badge">Environmental Monitor</span>
            </div>

            <div className="dashboard-content">
                <div className="section-header">
                    <h3>📷 Wildlife Sightings</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '+ Report Sighting'}
                    </button>
                </div>

                {showForm && (
                    <div className="sighting-form">
                        <h4>Report Wildlife Sighting</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Species *</label>
                                <input
                                    type="text"
                                    value={formData.species}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        species: e.target.value
                                    }))}
                                    placeholder="e.g., African Elephant"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Location *</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        location: e.target.value
                                    }))}
                                    placeholder="e.g., Near watering hole, Sector 3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    placeholder="Describe what you observed..."
                                    rows="3"
                                />
                            </div>
                            <button type="submit" className="submit-btn">
                                Report Sighting
                            </button>
                        </form>
                    </div>
                )}

                <div className="sightings-list">
                    {loading ? (
                        <div className="loading">Loading sightings...</div>
                    ) : sightings.length === 0 ? (
                        <p className="no-sightings">No sightings reported yet</p>
                    ) : (
                        sightings.map(sighting => (
                            <div key={sighting.id} className="sighting-item">
                                <div className="sighting-header">
                                    <span className="species">{sighting.species}</span>
                                    <span className="sighting-date">
                                        {new Date(sighting.createdAt?.toDate?.() || sighting.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="sighting-location">📍 {sighting.location}</div>
                                {sighting.description && (
                                    <p className="sighting-description">{sighting.description}</p>
                                )}
                                {sighting.verified && (
                                    <span className="verified-badge">✅ Verified</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default MonitorDashboard;