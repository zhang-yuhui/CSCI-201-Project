import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';

const SocialPage = () => {
    const [friends, setFriends] = useState([]);
    const [trendingCafes, setTrendingCafes] = useState([]);
    const [cafeReviewCounts, setCafeReviewCounts] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchMessage, setSearchMessage] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

    const currentUser = AuthService.getCurrentUser();
    const navigate = useNavigate();

    // Fetch friends and trending cafes on load
    useEffect(() => {
        // Redirect to login if not authenticated
        if (!currentUser || !currentUser.token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        const header = AuthService.getAuthHeader();

        // If no auth header, force re-login to avoid 401s
        if (!header.Authorization) {
            navigate('/login');
            return;
        }

        try {
            // Fetch cafes, filter rating > 4.0, and sort by rating for "Trending"
            const cafesRes = await axios.get('http://localhost:8080/api/cafes/trending');
            const cafesData = cafesRes.data || [];
            setTrendingCafes(cafesData);

            // Fetch review counts for each trending cafe
            const reviewCounts = {};
            for (const cafe of cafesData) {
                try {
                    const reviewRes = await axios.get(`http://localhost:8080/api/reviews/cafe/${cafe.cafeId}`);
                    reviewCounts[cafe.cafeId] = reviewRes.data.reviewCount || 0;
                } catch (err) {
                    console.error(`Error fetching reviews for cafe ${cafe.cafeId}:`, err);
                    reviewCounts[cafe.cafeId] = 0;
                }
            }
            setCafeReviewCounts(reviewCounts);

            // Fetch friends
            const friendsRes = await axios.get('http://localhost:8080/api/users/friends', { headers: header });
            setFriends(friendsRes.data.friends || []);
        } catch (err) {
            console.error("Error loading social data", err);
            setError("Failed to load social data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchMessage("Please enter a username to search");
            setSearchResults([]);
            return;
        }

        setSearchMessage("");

        try {
            const res = await axios.get(`http://localhost:8080/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: AuthService.getAuthHeader()
            });

            const users = res.data.users || [];
            setSearchResults(users);

            if (users.length === 0) {
                setSearchMessage(res.data.message || `No users found matching "${searchQuery}"`);
            } else {
                setSearchMessage("");
            }
        } catch (err) {
            console.error(err);
            setSearchMessage("Error searching for users. Please try again.");
            setSearchResults([]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const addFriend = async (friendId, friendUsername) => {
        try {
            const authHeader = AuthService.getAuthHeader();
            if (!authHeader.Authorization) {
                setActionMessage({ type: "error", text: "Please log in again." });
                navigate('/login');
                return;
            }

            const res = await axios.post(`http://localhost:8080/api/users/add-friend/${friendId}`, {}, {
                headers: authHeader
            });

            if (res.data.success) {
                setActionMessage({ type: "success", text: res.data.message || `Added ${friendUsername} as friend!` });
                // Refresh friends list
                fetchData();
                // Remove from search results
                setSearchResults(prev => prev.filter(u => u.id !== friendId));
            } else {
                setActionMessage({ type: "error", text: res.data.error || "Failed to add friend" });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Failed to add friend. Please try again.";
            setActionMessage({ type: "error", text: errorMsg });
        }

        // Clear message after 3 seconds
        setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    };

    const removeFriend = async (friendId, friendUsername) => {
        if (!window.confirm(`Are you sure you want to remove ${friendUsername} from your friends?`)) {
            return;
        }

        try {
            const authHeader = AuthService.getAuthHeader();
            if (!authHeader.Authorization) {
                setActionMessage({ type: "error", text: "Please log in again." });
                navigate('/login');
                return;
            }

            const res = await axios.delete(`http://localhost:8080/api/users/remove-friend/${friendId}`, {
                headers: authHeader
            });

            if (res.data.success) {
                setActionMessage({ type: "success", text: res.data.message || `Removed ${friendUsername} from friends` });
                // Refresh friends list
                fetchData();
            } else {
                setActionMessage({ type: "error", text: res.data.error || "Failed to remove friend" });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Failed to remove friend. Please try again.";
            setActionMessage({ type: "error", text: errorMsg });
        }

        setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setSearchMessage("");
    };

    // Check if a user is already a friend
    const isFriend = (userId) => {
        return friends.some(f => f.id === userId);
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

    return (
        <div style={styles.container}>
            {/* Action Message Toast */}
            {actionMessage.text && (
                <div style={{
                    ...styles.toast,
                    backgroundColor: actionMessage.type === "success" ? "#28a745" : "#dc3545"
                }}>
                    {actionMessage.text}
                </div>
            )}

            {/* Search Overlay */}
            {isSearchOpen && (
                <div style={styles.overlay}>
                    <div style={styles.searchPanel}>
                        <h3 style={{ marginTop: 0 }}>Find Friends</h3>
                        <div style={styles.searchInputContainer}>
                            <input
                                style={styles.input}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search by username..."
                                autoFocus
                            />
                            <button style={styles.button} onClick={handleSearch}>Search</button>
                            <button style={{...styles.button, backgroundColor: '#dc3545'}} onClick={closeSearch}>Close</button>
                        </div>

                        {searchMessage && (
                            <p style={styles.searchMessage}>{searchMessage}</p>
                        )}

                        <ul style={styles.list}>
                            {searchResults.map(u => (
                                <li key={u.id} style={styles.listItem}>
                                    <div>
                                        <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                                        <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '10px' }}>{u.email}</span>
                                    </div>
                                    {isFriend(u.id) ? (
                                        <span style={styles.alreadyFriendBadge}>Already Friends</span>
                                    ) : (
                                        <button style={styles.smallBtn} onClick={() => addFriend(u.id, u.username)}>
                                            + Add Friend
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={styles.errorBanner}>
                    {error}
                    <button onClick={fetchData} style={styles.retryBtn}>Retry</button>
                </div>
            )}

            {/* Main Grid */}
            <div style={styles.grid}>

                {/* Left Column: Profile & Friends */}
                <div style={styles.leftCol}>
                    <div style={styles.profileCard}>
                        <div style={styles.avatarCircle}>
                            {currentUser?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <h3 style={{ margin: '10px 0 5px' }}>{currentUser?.username || 'Guest'}</h3>
                        <p style={{ margin: '5px 0', opacity: 0.9 }}>Coffee Enthusiast ☕</p>
                        <button style={styles.editProfileBtn} onClick={() => navigate('/profile/edit')}>
                            Edit Profile
                        </button>
                        <div style={styles.stats}>
                            <div><strong>{friends.length}</strong> Friends</div>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h3 style={{ margin: 0 }}>Friends</h3>
                            <button style={styles.smallBtn} onClick={() => setIsSearchOpen(true)}>
                                + Find Friends
                            </button>
                        </div>

                        {friends.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p>No friends yet.</p>
                                <p style={{ fontSize: '0.9rem', color: '#888' }}>
                                    Click "Find Friends" to search and add friends!
                                </p>
                            </div>
                        ) : (
                            <ul style={styles.list}>
                                {friends.map(f => (
                                    <li key={f.id} style={styles.friendItem}>
                                        <div
                                            style={styles.friendInfoClickable}
                                            onClick={() => navigate(`/friend/${f.id}`)}
                                            title="View profile"
                                        >
                                            <div style={styles.friendAvatar}>
                                                {f.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span style={styles.friendName}>{f.username}</span>
                                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>{f.email}</span>
                                            </div>
                                        </div>
                                        <button
                                            style={styles.removeFriendBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFriend(f.id, f.username);
                                            }}
                                            title="Remove friend"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Trending Cafés */}
                <div style={styles.rightCol}>
                    <div style={styles.trendingHeader}>
                        <h3 style={{ margin: 0, color: '#6F4E37' }}>🔥 Trending Cafés</h3>
                        <span style={styles.cafeCount}>{trendingCafes.length} cafés</span>
                    </div>

                    {trendingCafes.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No trending cafés at the moment.</p>
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>
                                Cafés with ratings ≥ 4.0 will appear here!
                            </p>
                        </div>
                    ) : (
                        <div style={styles.scrollableList}>
                            {trendingCafes.map((cafe, index) => {
                                const reviewCount = cafeReviewCounts[cafe.cafeId] || 0;
                                const tags = cafe.tags ? cafe.tags.split(',') : [];

                                return (
                                    <div key={cafe.cafeId} style={styles.cafeCard}>
                                        <div style={styles.cafeHeader}>
                                            <div style={styles.cafeRank}>#{index + 1}</div>
                                            <div style={styles.cafeInfo}>
                                                <strong style={{ fontSize: '1.1rem', color: '#333' }}>{cafe.name}</strong>
                                                <p style={styles.cafeAddress}>{cafe.address}</p>
                                                <div style={styles.cafeRating}>
                                                    <span style={styles.starIcon}>⭐</span>
                                                    <span>{cafe.overallRating.toFixed(1)}</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#888', marginLeft: '5px' }}>
                            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                          </span>
                                                </div>
                                                {tags.length > 0 && (
                                                    <div style={styles.tagContainer}>
                                                        {tags.map((tag, idx) => (
                                                            <span key={idx} style={styles.tag}>{tag.trim()}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {cafe.aiSummary && (
                                                    <p style={styles.cafeSummary}>{cafe.aiSummary}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
        padding: '20px',
        position: 'relative'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
    },
    toast: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        fontWeight: '500'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    },
    searchPanel: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    searchInputContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    searchMessage: {
        color: '#888',
        fontStyle: 'italic',
        marginBottom: '15px',
        textAlign: 'center'
    },
    errorBanner: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    retryBtn: {
        backgroundColor: '#721c24',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    grid: {
        display: 'flex',
        gap: '20px',
        alignItems: 'stretch',
        height: 'calc(100vh - 100px)'
    },
    leftCol: {
        flex: '1',
        minWidth: '300px',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column'
    },
    rightCol: {
        flex: '1.5',
        minWidth: '350px',
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
    },
    trendingHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
    },
    cafeCount: {
        backgroundColor: '#f0e6db',
        color: '#6F4E37',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '500'
    },
    scrollableList: {
        flex: 1,
        overflowY: 'auto',
        paddingRight: '10px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#6F4E37 #f0e6db'
    },
    profileCard: {
        backgroundColor: '#6F4E37',
        color: 'white',
        padding: '20px',
        borderRadius: '15px',
        textAlign: 'center',
        marginBottom: '15px',
        boxShadow: '0 4px 15px rgba(111, 78, 55, 0.3)'
    },
    avatarCircle: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'white',
        color: '#6F4E37',
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 10px'
    },
    editProfileBtn: {
        backgroundColor: 'white',
        color: '#6F4E37',
        border: 'none',
        padding: '10px 25px',
        borderRadius: '20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'transform 0.2s'
    },
    stats: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid rgba(255,255,255,0.2)'
    },
    section: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
    },
    emptyState: {
        textAlign: 'center',
        padding: '20px',
        color: '#666'
    },
    cafeCard: {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        borderLeft: '4px solid #6F4E37',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s'
    },
    cafeHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px'
    },
    cafeRank: {
        backgroundColor: '#6F4E37',
        color: 'white',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        flexShrink: 0
    },
    cafeInfo: {
        flex: 1
    },
    cafeAddress: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '5px 0 0'
    },
    cafeRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#6F4E37',
        marginTop: '8px'
    },
    starIcon: {
        fontSize: '1.2rem'
    },
    tagContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px'
    },
    tag: {
        backgroundColor: '#f0e6db',
        color: '#6F4E37',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem'
    },
    cafeSummary: {
        fontSize: '0.9rem',
        color: '#555',
        marginTop: '10px',
        fontStyle: 'italic'
    },
    button: {
        backgroundColor: '#6F4E37',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    smallBtn: {
        backgroundColor: '#6F4E37',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500'
    },
    alreadyFriendBadge: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '0.8rem'
    },
    input: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        flex: 1,
        fontSize: '1rem'
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        flex: 1,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#6F4E37 #f0e6db'
    },
    listItem: {
        padding: '12px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    friendItem: {
        padding: '12px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    friendInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    friendInfoClickable: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        flex: 1,
        padding: '5px',
        borderRadius: '8px',
        transition: 'background-color 0.2s'
    },
    friendName: {
        fontWeight: 'bold',
        color: '#6F4E37'
    },
    friendAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#6F4E37',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    removeFriendBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #dc3545',
        color: '#dc3545',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

export default SocialPage;
