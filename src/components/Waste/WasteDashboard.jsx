import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getWasteLogs, createWasteLog } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Waste.css';

function WasteDashboard() {
    const { userData } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        byType: {}
    });
    const [formData, setFormData] = useState({
        wasteType: 'organic',
        quantity: '',
        unit: 'kg',
        destination: 'compost'
    });

    // Define loadLogs with useCallback
    const loadLogs = useCallback(async () => {
        const result = await getWasteLogs({ sorterId: userData?.uid });
        if (result.success) {
            setLogs(result.data);
            calculateStats(result.data);
        }
        setLoading(false);
    }, [userData?.uid]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const calculateStats = (data) => {
        const byType = {};
        let total = 0;
        data.forEach(log => {
            byType[log.wasteType] = (byType[log.wasteType] || 0) + parseFloat(log.quantity);
            total += parseFloat(log.quantity);
        });
        setStats({ total, byType });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            setToast({ message: 'Please enter a valid quantity', type: 'error' });
            return;
        }

        const result = await createWasteLog({
            ...formData,
            quantity: parseFloat(formData.quantity)
        });

        if (result.success) {
            setToast({ message: 'Waste logged successfully!', type: 'success' });
            setFormData({ wasteType: 'organic', quantity: '', unit: 'kg', destination: 'compost' });
            setShowForm(false);
            loadLogs();
        } else {
            setToast({ message: result.error || 'Failed to log waste', type: 'error' });
        }
    };

    const wasteTypes = ['organic', 'plastic', 'glass', 'metal', 'paper', 'other'];
    const destinations = ['compost', 'recycling', 'upcycling', 'landfill', 'donation'];

    if (loading) return <div className="loading">Loading waste data...</div>;

    return (
        <div className="waste-dashboard">
            <div className="waste-header">
                <h2>♻️ Waste Management</h2>
                <button 
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Log Waste'}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Total Waste</h4>
                    <div className="stat-number">{stats.total} kg</div>
                </div>
                {Object.entries(stats.byType).map(([type, amount]) => (
                    <div key={type} className="stat-card">
                        <h4>{type}</h4>
                        <div className="stat-number">{amount} kg</div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="waste-form">
                    <h3>Log New Waste</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Waste Type</label>
                            <select 
                                value={formData.wasteType}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    wasteType: e.target.value
                                }))}
                            >
                                {wasteTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        quantity: e.target.value
                                    }))}
                                    placeholder="0"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        unit: e.target.value
                                    }))}
                                >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="tonnes">tonnes</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Destination</label>
                            <select
                                value={formData.destination}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    destination: e.target.value
                                }))}
                            >
                                {destinations.map(dest => (
                                    <option key={dest} value={dest}>
                                        {dest.charAt(0).toUpperCase() + dest.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="submit-btn">
                            Log Waste
                        </button>
                    </form>
                </div>
            )}

            <div className="waste-logs">
                <h3>Recent Logs</h3>
                {logs.length === 0 ? (
                    <p className="no-logs">No waste logs yet</p>
                ) : (
                    <div className="logs-list">
                        {logs.slice(0, 10).map(log => (
                            <div key={log.id} className="log-item">
                                <span className="log-type">{log.wasteType}</span>
                                <span className="log-quantity">{log.quantity} {log.unit}</span>
                                <span className="log-destination">→ {log.destination}</span>
                                <span className="log-date">
                                    {new Date(log.createdAt?.toDate?.() || log.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default WasteDashboard;