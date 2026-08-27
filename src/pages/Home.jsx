import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import './Home.css';

function Home() {
    return (
        <div className="home-page">
            <Hero />
            <Features />
        </div>
    );
}

export default Home;