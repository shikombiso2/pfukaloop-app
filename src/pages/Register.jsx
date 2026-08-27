import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Common/Toast';
import './Auth.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('tourist');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password) {
            setToast({ message: 'Please fill in all fields.', type: 'error' });
            return;
        }

        if (password.length < 6) {
            setToast({ message: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        setLoading(true);
        const result = await register(name, email, password, role);
        
        if (result.success) {
            setToast({ 
                message: `Account created! Welcome ${name}`, 
                type: 'success' 
            });
            setTimeout(() => navigate('/dashboard'), 500);
        } else {
            setToast({ 
                message: result.error || 'Registration failed. Please try again.', 
                type: 'error' 
            });
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="form-container">
                <h2>🌱 Join Pfukaloop</h2>
                <p className="subtitle">
                    Create your account and start your sustainable journey.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Thandi Mokoena"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
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
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>I am a...</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                        >
                            <option value="tourist">🌍 Tourist / Traveler</option>
                            <option value="provider">🏡 Lodge / Guide / Seller</option>
                            <option value="waste_sorter">♻️ Waste Sorter</option>
                            <option value="monitor">📷 Environmental Monitor</option>
                            <option value="admin">🛠️ Admin / Partner</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="form-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default Register;