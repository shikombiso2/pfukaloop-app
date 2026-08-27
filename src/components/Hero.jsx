import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
    return (
        <div className="hero">
            <div className="hero-content">
                <div className="hero-badge">🌍 Sustainable Tourism</div>
                <h1>Connect. Explore. Protect.</h1>
                <p>
                    Pfukaloop connects travelers directly with community-based lodges, guides,
                    and artisans. Book experiences, support local economies, and help monitor
                    wildlife &amp; environment — all in one platform.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="btn-primary">Get Started</Link>
                    <Link to="/login" className="btn-outline">Sign In</Link>
                </div>
            </div>
            <div className="hero-image">
                🌿🏝️🐘
            </div>
        </div>
    );
}

export default Hero;