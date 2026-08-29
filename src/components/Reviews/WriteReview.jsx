import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createReview, getBookings } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Review.css';

function WriteReview({ listingId, onReviewSubmitted }) {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: '',
        listingId: listingId
    });

    useEffect(() => {
        checkIfCanReview();
    }, [listingId, userData]);

    const checkIfCanReview = async () => {
        if (!userData || !listingId) return;
        
        // Check if user has a completed booking for this listing
        const result = await getBookings({ 
            touristId: userData.uid,
            listingId: listingId,
            status: 'completed'
        });
        
        if (result.success && result.data.length > 0) {
            setCanReview(true);
        } else {
            // Check if user has a booking that's past the end date
            const allBookings = await getBookings({ touristId: userData.uid });
            if (allBookings.success) {
                const hasPastBooking = allBookings.data.some(booking => {
                    if (booking.listingId !== listingId) return false;
                    const endDate = new Date(booking.endDate);
                    return endDate < new Date();
                });
                setCanReview(hasPastBooking);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userData) {
            setToast({ message: 'Please login to review', type: 'error' });
            return;
        }

        if (!reviewData.comment.trim()) {
            setToast({ message: 'Please write a comment', type: 'error' });
            return;
        }

        setLoading(true);
        const result = await createReview({
            ...reviewData,
            reviewerName: userData.name || 'Anonymous',
            listingId: listingId
        });

        if (result.success) {
            setToast({ message: '✅ Review submitted successfully!', type: 'success' });
            setReviewData({ rating: 5, comment: '', listingId: listingId });
            if (onReviewSubmitted) onReviewSubmitted();
        } else {
            setToast({ message: result.error || 'Failed to submit review', type: 'error' });
        }
        setLoading(false);
    };

    if (!canReview) {
        return (
            <div className="review-not-available">
                <p style={{ color: '#95a5a6' }}>
                    You can only review this listing after completing a booking.
                </p>
            </div>
        );
    }

    return (
        <div className="write-review">
            <h4>✍️ Write a Review</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Rating</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                className={`star ${star <= reviewData.rating ? 'active' : ''}`}
                                onClick={() => setReviewData(prev => ({
                                    ...prev,
                                    rating: star
                                }))}
                            >
                                {star <= reviewData.rating ? '⭐' : '☆'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label>Comment</label>
                    <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({
                            ...prev,
                            comment: e.target.value
                        }))}
                        placeholder="Share your experience..."
                        rows="3"
                        required
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default WriteReview;