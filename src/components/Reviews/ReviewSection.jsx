import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReviews, createReview } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Review.css';

function ReviewSection({ listingId }) {
    const { currentUser, userData } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: '',
        listingId: listingId
    });

    useEffect(() => {
        loadReviews();
    }, [listingId]);

    const loadReviews = async () => {
        const result = await getReviews(listingId);
        if (result.success) {
            setReviews(result.data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setToast({ message: 'Please login to review', type: 'error' });
            return;
        }

        if (!reviewData.comment.trim()) {
            setToast({ message: 'Please write a comment', type: 'error' });
            return;
        }

        const result = await createReview({
            ...reviewData,
            reviewerName: userData?.name || 'Anonymous',
            listingId: listingId
        });

        if (result.success) {
            setToast({ message: 'Review submitted successfully!', type: 'success' });
            setReviewData({ rating: 5, comment: '', listingId: listingId });
            setShowForm(false);
            loadReviews();
        } else {
            setToast({ message: result.error || 'Failed to submit review', type: 'error' });
        }
    };

    if (loading) return <div className="loading">Loading reviews...</div>;

    return (
        <div className="review-section">
            <div className="review-header">
                <h3>Reviews ({reviews.length})</h3>
                {currentUser && (
                    <button 
                        className="write-review-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : 'Write a Review'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="review-form">
                    <h4>Write Your Review</h4>
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
                                rows="4"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            Submit Review
                        </button>
                    </form>
                </div>
            )}

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-item">
                            <div className="review-header-item">
                                <span className="reviewer-name">{review.reviewerName}</span>
                                <span className="review-rating">
                                    {'⭐'.repeat(Math.round(review.rating))}
                                    <span className="rating-number">{review.rating}/5</span>
                                </span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <span className="review-date">
                                {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default ReviewSection;