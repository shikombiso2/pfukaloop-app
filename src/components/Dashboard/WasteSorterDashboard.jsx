import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getWasteLogs, createWasteLog } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Dashboard.css';

function WasteSorterDashboard({ user }) {
    const { userData } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        byType: {},
        thisWeek: 0,
        thisMonth: 0
    });
    const [formData, setFormData] = useState({
        wasteType: 'organic',
        quantity: '',
        unit: 'kg',
        destination: 'compost',
        location: '',
        description: ''
    });
    const [activeTab, setActiveTab] = useState('logs');

    const wasteTypes = ['organic', 'plastic', 'glass', 'metal', 'paper', 'e-waste', 'other'];
    const destinations = ['compost', 'recycling', 'upcycling', 'landfill', 'donation', 'incineration'];

    const loadLogs = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            // Get waste logs for this user
            const result = await getWasteLogs({ sorterId: userData.uid });
            
            if (result.success) {
                setLogs(result.data || []);
                calculateStats(result.data || []);
                setToast(null);
            } else {
                console.error('Failed to load waste logs:', result.error);
                // Don't show error toast for empty logs
                if (result.error !== 'No waste logs found') {
                    setToast({ message: 'Failed to load waste logs: ' + result.error, type: 'error' });
                }
                setLogs([]);
                setStats({
                    total: 0,
                    byType: {},
                    thisWeek: 0,
                    thisMonth: 0
                });
            }
        } catch (error) {
            console.error('Error loading waste logs:', error);
            setLogs([]);
            setStats({
                total: 0,
                byType: {},
                thisWeek: 0,
                thisMonth: 0
            });
        }
        setLoading(false);
    }, [userData]);

    useEffect(() => {
        if (userData) {
            loadLogs();
        } else {
            setLoading(false);
        }
    }, [userData, loadLogs]);

    const calculateStats = (data) => {
        const byType = {};
        let total = 0;
        let thisWeek = 0;
        let thisMonth = 0;
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        data.forEach(log => {
            const logDate = log.createdAt?.toDate?.() || new Date(log.createdAt);
            const quantity = parseFloat(log.quantity) || 0;
            
            byType[log.wasteType] = (byType[log.wasteType] || 0) + quantity;
            total += quantity;
            
            if (logDate >= weekAgo) thisWeek += quantity;
            if (logDate >= monthAgo) thisMonth += quantity;
        });

        setStats({ total, byType, thisWeek, thisMonth });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            setToast({ message: 'Please enter a valid quantity', type: 'error' });
            return;
        }

        if (!formData.location) {
            setToast({ message: 'Please enter a location', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const result = await createWasteLog({
                ...formData,
                quantity: parseFloat(formData.quantity),
                sorterName: userData?.name || 'Sorter'
            });

            if (result.success) {
                setToast({ message: '✅ Waste logged successfully!', type: 'success' });
                setFormData({
                    wasteType: 'organic',
                    quantity: '',
                    unit: 'kg',
                    destination: 'compost',
                    location: '',
                    description: ''
                });
                setShowForm(false);
                loadLogs();
            } else {
                setToast({ message: result.error || 'Failed to log waste', type: 'error' });
            }
        } catch (error) {
            console.error('Error creating waste log:', error);
            setToast({ message: 'Error logging waste. Please try again.', type: 'error' });
        }
        setLoading(false);
    };

    const getWasteTypeIcon = (type) => {
        const icons = {
            organic: '🌿',
            plastic: '🧴',
            glass: '🍾',
            metal: '🔩',
            paper: '📄',
            'e-waste': '💻',
            other: '📦'
        };
        return icons[type] || '📦';
    };

    const getDestinationIcon = (destination) => {
        const icons = {
            compost: '🌱',
            recycling: '♻️',
            upcycling: '🔄',
            landfill: '🗑️',
            donation: '🎁',
            incineration: '🔥'
        };
        return icons[destination] || '📍';
    };

    // If user is not a waste sorter, show message
    if (userData && userData.role !== 'waste_sorter') {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2>⚠️ Access Denied</h2>
                    <span className="role-badge">WASTE SORTER ONLY</span>
                </div>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p>This dashboard is only for Waste Sorters.</p>
                    <p style={{ color: '#95a5a6', marginTop: '8px' }}>
                        Please contact an administrator if you believe this is an error.
                    </p>
                </div>
            </div>
        );
    }

    if (loading && logs.length === 0) {
        return <div className="loading">Loading waste logs...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>♻️ Welcome, {user?.name || 'Sorter'}</h2>
                <span className="role-badge">WASTE SORTER</span>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Total Waste</h4>
                    <div className="stat-number">{stats.total.toFixed(1)} kg</div>
                </div>
                <div className="stat-card">
                    <h4>This Week</h4>
                    <div className="stat-number">{stats.thisWeek.toFixed(1)} kg</div>
                </div>
                <div className="stat-card">
                    <h4>This Month</h4>
                    <div className="stat-number">{stats.thisMonth.toFixed(1)} kg</div>
                </div>
                <div className="stat-card">
                    <h4>Total Logs</h4>
                    <div className="stat-number">{logs.length}</div>
                </div>
            </div>

            {/* Waste Type Breakdown */}
            <div className="waste-breakdown">
                <h4>📊 Waste Breakdown by Type</h4>
                <div className="breakdown-grid">
                    {Object.entries(stats.byType).map(([type, amount]) => (
                        <div key={type} className="breakdown-item">
                            <span className="breakdown-icon">{getWasteTypeIcon(type)}</span>
                            <span className="breakdown-type">{type}</span>
                            <span className="breakdown-amount">{amount.toFixed(1)} kg</span>
                        </div>
                    ))}
                    {Object.keys(stats.byType).length === 0 && (
                        <p className="no-data">No waste logged yet</p>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    📋 Waste Logs ({logs.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                    onClick={() => setActiveTab('add')}
                >
                    ➕ Log Waste
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'logs' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>📋 Recent Waste Logs</h3>
                            <button 
                                className="btn-primary"
                                onClick={() => setActiveTab('add')}
                            >
                                + Log Waste
                            </button>
                        </div>
                        {logs.length === 0 ? (
                            <div className="no-listings">
                                <p>No waste logs yet.</p>
                                <button 
                                    className="btn-primary" 
                                    onClick={loadLogs}
                                    style={{ marginTop: '16px' }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        ) : (
                            <div className="waste-logs-list">
                                {logs.slice(0, 20).map(log => (
                                    <div key={log.id} className="waste-log-item">
                                        <div className="log-header">
                                            <span className="log-type">
                                                {getWasteTypeIcon(log.wasteType)} {log.wasteType}
                                            </span>
                                            <span className="log-quantity">{log.quantity} {log.unit}</span>
                                            <span className="log-destination">
                                                {getDestinationIcon(log.destination)} {log.destination}
                                            </span>
                                        </div>
                                        <div className="log-details">
                                            <span className="log-location">📍 {log.location || 'N/A'}</span>
                                            {log.description && (
                                                <span className="log-description">{log.description}</span>
                                            )}
                                            <span className="log-date">
                                                {log.createdAt?.toDate?.() ? 
                                                    new Date(log.createdAt.toDate()).toLocaleDateString() : 
                                                    new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {logs.length > 20 && (
                                    <p style={{ textAlign: 'center', color: '#95a5a6', marginTop: '12px' }}>
                                        Showing last 20 logs
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="section">
                        <div className="waste-form-container">
                            <h3>♻️ Log New Waste</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Waste Type *</label>
                                    <select 
                                        value={formData.wasteType}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            wasteType: e.target.value
                                        }))}
                                        required
                                    >
                                        {wasteTypes.map(type => (
                                            <option key={type} value={type}>
                                                {getWasteTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quantity *</label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                quantity: e.target.value
                                            }))}
                                            placeholder="0.00"
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
                                            <option value="pieces">pieces</option>
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
                                                {getDestinationIcon(dest)} {dest.charAt(0).toUpperCase() + dest.slice(1)}
                                            </option>
                                        ))}
                                    </select>
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
                                        placeholder="e.g., Community Center, Market, etc."
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
                                        placeholder="Additional details about this waste..."
                                        rows="2"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setActiveTab('logs')}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Logging...' : '✅ Log Waste'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default WasteSorterDashboard;