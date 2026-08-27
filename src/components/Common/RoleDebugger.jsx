import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

function RoleDebugger() {
    const { userData, currentUser } = useAuth();

    if (!userData) return null;

    return (
        <div style={{
            background: '#f8f9fa',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #ddd',
            fontSize: '14px'
        }}>
            <strong>🔧 Debug Info:</strong>
            <span style={{ marginLeft: '12px' }}>
                User: {userData.name}
            </span>
            <span style={{ marginLeft: '12px', padding: '2px 10px', background: userData.role === 'admin' ? '#e74c3c' : '#2d6a4f', color: 'white', borderRadius: '12px' }}>
                Role: {userData.role}
            </span>
            <span style={{ marginLeft: '12px' }}>
                UID: {currentUser?.uid?.slice(0, 8)}...
            </span>
        </div>
    );
}

export default RoleDebugger;