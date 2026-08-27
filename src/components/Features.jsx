import React from 'react';
import './Features.css';

function Features() {
    const features = [
        {
            icon: '🏡',
            title: 'Community Lodges',
            description: 'Book unique stays run by local communities. Every booking supports conservation.'
        },
        {
            icon: '🧭',
            title: 'Guided Experiences',
            description: 'Explore with local guides who know the land, wildlife, and culture best.'
        },
        {
            icon: '♻️',
            title: 'Waste Management',
            description: 'Track waste sorting, composting, and upcycling to keep hubs clean and green.'
        },
        {
            icon: '📷',
            title: 'Wildlife Monitoring',
            description: 'Camera traps and community reports protect biodiversity in real-time.'
        }
    ];

    return (
        <div className="features-grid">
            {features.map((feature, index) => (
                <div className="feature-card" key={index}>
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                </div>
            ))}
        </div>
    );
}

export default Features;