import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Common/Toast';
import './Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(email, password);
        if (result.success) {
            setToast({ message: `Welcome back, ${result.user.name}!`, type: 'success' });
            setTimeout(() => navigate('/dashboard'), 500);
        } else {
            setToast({ message: result.error, type: 'error' });
        }
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
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        Sign In
                    </button>
                </form>
                <div className="form-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
                <div className="demo-hint">
                    <strong>Demo accounts:</strong> any email + pass123
                    <br />
                    <small>tourist@pfukaloop.com / pass123</small>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default Login;