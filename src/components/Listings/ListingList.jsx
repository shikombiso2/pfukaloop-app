import React, { useState, useEffect } from 'react';
import { getListings } from '../../services/firebaseServices';
import ListingCard from './ListingCard';
import './Listing.css';

function ListingList({ filters = {} }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadListings();
    }, [filters]);

    const loadListings = async () => {
        setLoading(true);
        setError(null);
        const result = await getListings(filters);
        
        if (result.success) {
            setListings(result.data);
        } else {
            setError(result.error || 'Failed to load listings');
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="loading">Loading your listings...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error: {error}</p>
                <button className="btn-primary" onClick={loadListings}>Retry</button>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="no-listings">
                <p>No listings found. Create your first listing!</p>
                <button className="btn-primary" onClick={loadListings}>Refresh</button>
            </div>
        );
    }

    return (
        <div className="listing-list">
            {listings.map(listing => (
                <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    onUpdate={loadListings}
                />
            ))}
        </div>
    );
}

export default ListingList;