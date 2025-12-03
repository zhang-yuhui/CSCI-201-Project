import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, DollarSign, Tag } from 'lucide-react';
import axios from 'axios';
import AuthService from '../services/AuthService';

const CafeDetailModal = ({ cafe, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");

    const currentUser = AuthService.getCurrentUser();
    const isLoggedIn = !!currentUser;

    useEffect(() => {
        if (cafe?.cafeId) {
            fetchReviews();
        }
    }, [cafe]);

    const fetchReviews = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await axios.get(`http://localhost:8080/api/reviews/cafe/${cafe.cafeId}`);
            setReviews(res.data.reviews || []);
            setAverageRating(res.data.averageRating || 0);
            setReviewCount(res.data.reviewCount || 0);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError("");
        setSubmitSuccess("");

        try {
            const res = await axios.post(
                `http://localhost:8080/api/reviews/cafe/${cafe.cafeId}`,
                {
                    rating: newRating,
                    comment: newComment.trim()
                },
                {
                    headers: AuthService.getAuthHeader()
                }
            );

            if (res.data.success) {
                setSubmitSuccess("Review submitted successfully!");
                setNewRating(5);
                setNewComment("");
                setShowReviewForm(false);

                // Refresh reviews
                await fetchReviews();
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            setSubmitError(err.response?.data?.error || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
                headers: AuthService.getAuthHeader()
            });

            // Refresh reviews
            await fetchReviews();
        } catch (err) {
            console.error("Error deleting review:", err);
            alert(err.response?.data?.error || "Failed to delete review");
        }
    };

    // Check if current user has already reviewed
    const userHasReviewed = reviews.some(r => r.userId === currentUser?.id);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>{cafe.name}</h2>
                        <div style={styles.ratingBadge}>
                            <Star size={18} fill="#FFD700" color="#FFD700" />
                            <span style={styles.ratingText}>
                {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
              </span>
                            <span style={styles.reviewCountText}>({reviewCount} reviews)</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                {/* Cafe Info */}
                <div style={styles.cafeInfo}>
                    <div style={styles.infoRow}>
                        <MapPin size={16} color="#666" />
                        <span style={styles.infoText}>{cafe.address}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <DollarSign size={16} color="#666" />
                        <span style={styles.infoText}>{"$".repeat(cafe.price || 1)}</span>
                    </div>
                    {cafe.tags && (
                        <div style={styles.infoRow}>
                            <Tag size={16} color="#666" />
                            <span style={styles.infoText}>{cafe.tags}</span>
                        </div>
                    )}
                    {cafe.aiSummary && (
                        <p style={styles.summary}>{cafe.aiSummary}</p>
                    )}
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                    <div style={styles.successMessage}>{submitSuccess}</div>
                )}
                {submitError && (
                    <div style={styles.errorMessage}>{submitError}</div>
                )}

                {/* Add Review Button (only if logged in and hasn't reviewed) */}
                {isLoggedIn && !userHasReviewed && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        style={styles.addReviewButton}
                    >
                        ✍️ Write a Review
                    </button>
                )}

                {/* Review Form */}
                {showReviewForm && (
                    <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
                        <h3 style={styles.formTitle}>Write Your Review</h3>

                        <label style={styles.label}>
                            Rating: {newRating} stars
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.5"
                                value={newRating}
                                onChange={(e) => setNewRating(parseFloat(e.target.value))}
                                style={styles.rangeInput}
                            />
                            <div style={styles.starDisplay}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={24}
                                        fill={i < Math.floor(newRating) ? "#FFD700" : "none"}
                                        color="#FFD700"
                                    />
                                ))}
                            </div>
                        </label>

                        <label style={styles.label}>
                            Comment (optional):
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your experience..."
                                maxLength={1000}
                                style={styles.textarea}
                                rows={4}
                            />
                            <small style={styles.charCount}>
                                {newComment.length}/1000 characters
                            </small>
                        </label>

                        <div style={styles.formButtons}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={styles.submitButton}
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReviewForm(false);
                                    setSubmitError("");
                                    setNewComment("");
                                    setNewRating(5);
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Login prompt if not logged in */}
                {!isLoggedIn && (
                    <div style={styles.loginPrompt}>
                        <p>Please <a href="/login" style={styles.loginLink}>log in</a> to write a review</p>
                    </div>
                )}

                {/* Reviews List */}
                <div style={styles.reviewsSection}>
                    <h3 style={styles.sectionTitle}>Reviews</h3>

                    {loading ? (
                        <p style={styles.loadingText}>Loading reviews...</p>
                    ) : error ? (
                        <p style={styles.errorText}>{error}</p>
                    ) : reviews.length === 0 ? (
                        <p style={styles.emptyText}>No reviews yet. Be the first to review!</p>
                    ) : (
                        <div style={styles.reviewsList}>
                            {reviews.map((review) => (
                                <div key={review.id} style={styles.reviewCard}>
                                    <div style={styles.reviewHeader}>
                                        <div>
                                            <strong style={styles.reviewUsername}>{review.username}</strong>
                                            <div style={styles.reviewRating}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < Math.floor(review.rating) ? "#FFD700" : "none"}
                                                        color="#FFD700"
                                                    />
                                                ))}
                                                <span style={styles.ratingNumber}>{review.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        {currentUser?.id === review.userId && (
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                style={styles.deleteButton}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    {review.comment && (
                                        <p style={styles.reviewComment}>{review.comment}</p>
                                    )}
                                    <p style={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '25px',
        borderBottom: '2px solid #f0f0f0',
        backgroundColor: '#6F4E37',
        color: 'white',
        borderRadius: '15px 15px 0 0'
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '1.5rem'
    },
    ratingBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    ratingText: {
        fontSize: '1.1rem',
        fontWeight: 'bold'
    },
    reviewCountText: {
        fontSize: '0.9rem',
        opacity: 0.9
    },
    closeButton: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        transition: 'background 0.2s'
    },
    cafeInfo: {
        padding: '20px 25px',
        borderBottom: '1px solid #f0f0f0'
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px'
    },
    infoText: {
        color: '#666',
        fontSize: '0.95rem'
    },
    summary: {
        marginTop: '15px',
        fontStyle: 'italic',
        color: '#555',
        lineHeight: '1.5'
    },
    addReviewButton: {
        margin: '15px 25px',
        padding: '12px 20px',
        backgroundColor: '#6F4E37',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: 'calc(100% - 50px)',
        transition: 'background 0.2s'
    },
    loginPrompt: {
        padding: '15px 25px',
        textAlign: 'center',
        backgroundColor: '#f8f5f2',
        margin: '0 25px',
        borderRadius: '8px'
    },
    loginLink: {
        color: '#6F4E37',
        fontWeight: 'bold',
        textDecoration: 'none'
    },
    reviewForm: {
        padding: '20px 25px',
        backgroundColor: '#f8f5f2',
        margin: '0 25px 15px',
        borderRadius: '10px'
    },
    formTitle: {
        margin: '0 0 15px 0',
        color: '#6F4E37'
    },
    label: {
        display: 'block',
        marginBottom: '15px',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#333'
    },
    rangeInput: {
        width: '100%',
        marginTop: '8px',
        accentColor: '#6F4E37'
    },
    starDisplay: {
        display: 'flex',
        gap: '4px',
        marginTop: '8px'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginTop: '8px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
    },
    charCount: {
        display: 'block',
        marginTop: '4px',
        fontSize: '0.8rem',
        color: '#888',
        textAlign: 'right'
    },
    formButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
    },
    submitButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#6F4E37',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    },
    cancelButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: 'transparent',
        color: '#666',
        border: '2px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    },
    successMessage: {
        margin: '15px 25px',
        padding: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '8px',
        textAlign: 'center'
    },
    errorMessage: {
        margin: '15px 25px',
        padding: '12px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        textAlign: 'center'
    },
    reviewsSection: {
        padding: '20px 25px'
    },
    sectionTitle: {
        margin: '0 0 15px 0',
        color: '#6F4E37',
        fontSize: '1.2rem'
    },
    loadingText: {
        textAlign: 'center',
        color: '#888'
    },
    errorText: {
        textAlign: 'center',
        color: '#dc3545'
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontStyle: 'italic'
    },
    reviewsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    reviewCard: {
        padding: '15px',
        backgroundColor: '#faf8f5',
        borderRadius: '10px',
        borderLeft: '4px solid #6F4E37'
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
    },
    reviewUsername: {
        fontSize: '1rem',
        color: '#333'
    },
    reviewRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '5px'
    },
    ratingNumber: {
        fontSize: '0.85rem',
        color: '#666',
        marginLeft: '4px'
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        cursor: 'pointer'
    },
    reviewComment: {
        margin: '10px 0',
        color: '#555',
        lineHeight: '1.5'
    },
    reviewDate: {
        fontSize: '0.8rem',
        color: '#999',
        margin: '5px 0 0',
        textAlign: 'right'
    }
};

export default CafeDetailModal;