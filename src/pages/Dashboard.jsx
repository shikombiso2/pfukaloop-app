import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TouristDashboard from '../components/Dashboard/TouristDashboard';
import ProviderDashboard from '../components/Dashboard/ProviderDashboard';
import WasteSorterDashboard from '../components/Dashboard/WasteSorterDashboard';
import MonitorDashboard from '../components/Dashboard/MonitorDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import './Dashboard.css';

function Dashboard() {
    const { currentUser, userData, loading } = useAuth();

    if (loading) {
        return (
            <div className="dashboard-loading">
                <h2>Loading your dashboard...</h2>
            </div>
        );
    }

    if (!currentUser || !userData) {
        return (
            <div className="dashboard-error">
                <h2>Please log in to access your dashboard</h2>
            </div>
        );
    }

    const renderDashboard = () => {
        const role = userData.role || 'tourist';
        
        switch (role) {
            case 'admin':
                return <AdminDashboard user={userData} />;
            case 'provider':
                return <ProviderDashboard user={userData} />;
            case 'waste_sorter':
                return <WasteSorterDashboard user={userData} />;
            case 'monitor':
                return <MonitorDashboard user={userData} />;
            case 'tourist':
            default:
                return <TouristDashboard user={userData} />;
        }
    };

    return (
        <div className="dashboard-page">
            {renderDashboard()}
        </div>
    );
}

export default Dashboard;