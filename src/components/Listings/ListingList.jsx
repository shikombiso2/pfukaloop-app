import React, { useState, useEffect } from 'react';
import { getListings } from '../../services/firebaseServices';
import ListingCard from './ListingCard';
import './Listing.css';

function ListingList({ filters = {}, key, hideBookButton = false, hideOwnListing = false, currentUserId = null }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadListings();
    }, [filters.providerId, key]);

    const loadListings = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getListings({});
            
            if (result.success) {
                let filteredData = result.data;
                
                // Apply provider filter
                if (filters.providerId) {
                    filteredData = filteredData.filter(
                        listing => listing.providerId === filters.providerId
                    );
                }
                
                // Hide own listings when browsing (for providers)
                if (hideOwnListing && currentUserId) {
                    filteredData = filteredData.filter(
                        listing => listing.providerId !== currentUserId
                    );
                }
                
                setListings(filteredData);
            } else {
                setError(result.error || 'Failed to load listings');
            }
        } catch (error) {
            console.error('Error loading listings:', error);
            setError('Failed to load listings. Please try again.');
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="loading">Loading listings...</div>;
    }

    if (error) {
        return (
            <div className="error-container" style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
            }}>
                <p style={{ color: '#856404', marginBottom: '12px' }}>
                    ⚠️ {error}
                </p>
                <button 
                    className="btn-primary" 
                    onClick={loadListings}
                    style={{ marginTop: '8px' }}
                >
                    🔄 Retry
                </button>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="no-listings" style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: '#5a7a6a'
            }}>
                <p style={{ fontSize: '16px' }}>No listings found</p>
                {!hideBookButton && (
                    <p style={{ fontSize: '14px', color: '#95a5a6', marginTop: '8px' }}>
                        Create your first listing to get started!
                    </p>
                )}
                <button 
                    className="btn-primary" 
                    onClick={loadListings}
                    style={{ marginTop: '16px' }}
                >
                    🔄 Refresh
                </button>
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
                    hideBookButton={hideBookButton}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}

export default ListingList;