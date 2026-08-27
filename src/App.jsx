import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import './styles/App.css';

function PrivateRoute({ children }) {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }
    
    return currentUser ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="app-container">
                <div className="loading-screen">
                    <h2>🌿 Loading Pfukaloop...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                {/* Add more routes as needed */}
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;