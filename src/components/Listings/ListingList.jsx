import React, { useState, useEffect } from 'react';
import { getListings, subscribeToCollection } from '../../services/firebaseServices';
import ListingCard from './ListingCard';
import './Listing.css';

function ListingList({ filters = {}, showCreate = false }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToCollection(
            'listings',
            (result) => {
                if (result.success) {
                    setListings(result.data);
                    setLoading(false);
                } else {
                    setError(result.error);
                    setLoading(false);
                }
            },
            filters
        );

        return () => unsubscribe();
    }, [filters]);

    if (loading) {
        return <div className="loading">Loading listings...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (listings.length === 0) {
        return <div className="no-listings">No listings found</div>;
    }

    return (
        <div className="listing-list">
            {listings.map(listing => (
                <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    onUpdate={() => {
                        // Refresh listings
                        setLoading(true);
                        getListings(filters).then(result => {
                            if (result.success) {
                                setListings(result.data);
                            }
                            setLoading(false);
                        });
                    }}
                />
            ))}
        </div>
    );
}

export default ListingList;