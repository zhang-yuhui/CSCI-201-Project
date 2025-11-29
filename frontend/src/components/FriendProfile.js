import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';

const FriendProfile = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFriendProfile();
  }, [friendId]);

  const fetchFriendProfile = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${friendId}/profile`, {
        headers: AuthService.getAuthHeader()
      });
      
      setFriend(res.data.user);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error loading friend profile:", err);
      setError(err.response?.data?.error || "Failed to load friend's profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.backBtn} onClick={() => navigate('/social')}>
            ← Back to Social
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate('/social')}>
          ← Back to Social
        </button>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatarCircle}>
            {friend?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <h2 style={styles.username}>{friend?.username || 'Unknown User'}</h2>
          <p style={styles.email}>{friend?.email}</p>
          <div style={styles.statBadge}>
            <span style={styles.statNumber}>{reviews.length}</span>
            <span style={styles.statLabel}>Café Reviews</span>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={styles.reviewsSection}>
          <h3 style={styles.sectionTitle}>☕ Rated Cafés</h3>
          
          {reviews.length === 0 ? (
            <div style={styles.emptyState}>
              <p>This user hasn't rated any cafés yet.</p>
            </div>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.map((review, index) => (
                <div key={review.id || index} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.cafeInfo}>
                      <strong style={styles.cafeName}>{review.cafeName}</strong>
                      {review.cafeAddress && (
                        <p style={styles.cafeAddress}>{review.cafeAddress}</p>
                      )}
                    </div>
                    <div style={styles.ratingBadge}>
                      <span style={styles.starIcon}>⭐</span>
                      <span style={styles.ratingValue}>{review.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p style={styles.reviewComment}>"{review.comment}"</p>
                  )}
                  {review.createdAt && (
                    <p style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  )}
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
  container: {
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f8f5f2',
    padding: '20px'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  errorText: {
    color: '#dc3545',
    marginBottom: '20px'
  },
  backBtn: {
    backgroundColor: 'transparent',
    color: '#6F4E37',
    border: '2px solid #6F4E37',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '20px',
    transition: 'all 0.2s'
  },
  profileCard: {
    backgroundColor: '#6F4E37',
    color: 'white',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(111, 78, 55, 0.3)'
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'white',
    color: '#6F4E37',
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px'
  },
  username: {
    margin: '10px 0 5px',
    fontSize: '1.8rem'
  },
  email: {
    margin: '5px 0 15px',
    opacity: 0.8,
    fontSize: '0.95rem'
  },
  statBadge: {
    display: 'inline-flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '10px 25px',
    borderRadius: '20px',
    marginTop: '10px'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: '0.85rem',
    opacity: 0.9
  },
  reviewsSection: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  sectionTitle: {
    margin: '0 0 20px',
    color: '#6F4E37',
    borderBottom: '2px solid #f0e6db',
    paddingBottom: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px',
    color: '#888'
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  reviewCard: {
    backgroundColor: '#faf8f5',
    padding: '15px',
    borderRadius: '10px',
    borderLeft: '4px solid #6F4E37'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  cafeInfo: {
    flex: 1
  },
  cafeName: {
    fontSize: '1.1rem',
    color: '#333'
  },
  cafeAddress: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '5px 0 0'
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#6F4E37',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '15px',
    fontWeight: 'bold'
  },
  starIcon: {
    fontSize: '1rem'
  },
  ratingValue: {
    fontSize: '1rem'
  },
  reviewComment: {
    fontStyle: 'italic',
    color: '#555',
    margin: '10px 0',
    lineHeight: '1.5'
  },
  reviewDate: {
    fontSize: '0.8rem',
    color: '#999',
    margin: '5px 0 0',
    textAlign: 'right'
  }
};

export default FriendProfile;
