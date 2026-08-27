import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TouristDashboard from '../components/Dashboard/TouristDashboard';
import ProviderDashboard from '../components/Dashboard/ProviderDashboard';
import WasteSorterDashboard from '../components/Dashboard/WasteSorterDashboard';
import MonitorDashboard from '../components/Dashboard/MonitorDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import './Dashboard.css';

function Dashboard() {
    const { currentUser } = useAuth();

    const renderDashboard = () => {
        switch (currentUser?.role) {
            case 'tourist':
                return <TouristDashboard user={currentUser} />;
            case 'provider':
                return <ProviderDashboard user={currentUser} />;
            case 'waste_sorter':
                return <WasteSorterDashboard user={currentUser} />;
            case 'monitor':
                return <MonitorDashboard user={currentUser} />;
            case 'admin':
                return <AdminDashboard user={currentUser} />;
            default:
                return <TouristDashboard user={currentUser} />;
        }
    };

    return (
        <div className="dashboard-page">
            {renderDashboard()}
        </div>
    );
}

export default Dashboard;