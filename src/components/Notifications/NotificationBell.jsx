import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/firebaseServices';
import './Notification.css';

function NotificationBell() {
    const { userData } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            loadNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userData]);

    const loadNotifications = async () => {
        if (!userData) return;
        setLoading(true);
        const result = await getNotifications(userData.uid);
        if (result.success) {
            setNotifications(result.data);
            setUnreadCount(result.data.filter(n => !n.read).length);
        }
        setLoading(false);
    };

    const handleNotificationClick = async (notificationId) => {
        await markNotificationRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(userData.uid);
        loadNotifications();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking': return '📅';
            case 'message': return '💬';
            case 'review': return '⭐';
            case 'alert': return '🔔';
            default: return '📌';
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="notification-container">
            <button 
                className="notification-bell"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                🔔 {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <button 
                                className="mark-all-read"
                                onClick={handleMarkAllRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">No notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification.id)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">
                                            {getTimeAgo(notification.createdAt?.toDate?.() || notification.createdAt)}
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div className="notification-dot"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;