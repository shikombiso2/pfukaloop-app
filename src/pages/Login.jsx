import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Common/Toast';
import './Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const result = await login(email, password);
        
        if (result.success) {
            setToast({ 
                message: `Welcome back, ${result.user.name || 'User'}!`, 
                type: 'success' 
            });
            setTimeout(() => navigate('/dashboard'), 500);
        } else {
            setToast({ 
                message: result.error || 'Login failed. Please try again.', 
                type: 'error' 
            });
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="form-container">
                <h2>🌿 Welcome Back</h2>
                <p className="subtitle">
                    Sign in to book experiences or manage your listings.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <div className="form-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
                <div className="demo-hint">
                    <strong>Demo accounts:</strong><br />
                    <small>tourist@pfukaloop.com / pass123</small><br />
                    <small>lodge@pfukaloop.com / pass123</small>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default Login;