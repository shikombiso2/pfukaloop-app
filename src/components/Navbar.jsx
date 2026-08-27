import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <span className="logo-icon">🌿</span>
                <span>Pfukaloop</span>
            </div>
            <div className="nav-links">
                {currentUser ? (
                    <>
                        <span className="welcome-msg">👤 {currentUser.name}</span>
                        <span className="role-badge">{currentUser.role}</span>
                        <button onClick={handleLogout} className="btn-danger">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Sign In</Link>
                        <Link to="/register" className="nav-link btn-primary">Join Now</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;