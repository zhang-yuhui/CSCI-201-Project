import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CafeDetailModal from './CafeDetailModal';
import axios from 'axios';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWithMarker = () => {
    const [cafes, setCafes] = useState([]);
    const [cafeReviewCounts, setCafeReviewCounts] = useState({});
    const [selectedCafe, setSelectedCafe] = useState(null);
    const center = [34.0522, -118.2437]; // Los Angeles

    useEffect(() => {
        fetchCafesWithReviews();
    }, []);

    const fetchCafesWithReviews = async () => {
        try {
            // Fetch all cafes (now returns calculated average ratings)
            const cafesRes = await fetch('http://localhost:8080/api/cafes');
            const cafesData = await cafesRes.json();
            console.log("Fetched cafes:", cafesData);
            setCafes(cafesData);

            // Fetch review counts for each cafe
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
        } catch (err) {
            console.error("Error fetching cafes:", err);
        }
    };

    const handleMarkerClick = (cafe) => {
        setSelectedCafe(cafe);
    };

    const handleCloseModal = () => {
        setSelectedCafe(null);
        // Refresh cafés to get updated ratings after modal closes (in case user added a review)
        fetchCafesWithReviews();
    };

    return (
        <div style={styles.container}>
            <MapContainer center={center} zoom={13} style={styles.map}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* One marker per café */}
                {cafes.map(cafe => {
                    const reviewCount = cafeReviewCounts[cafe.cafeId] || 0;
                    const hasReviews = reviewCount > 0;
                    const ratingDisplay = hasReviews
                        ? `⭐ ${cafe.overallRating.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
                        : '⭐ No reviews yet';

                    return (
                        <Marker
                            key={cafe.cafeId}
                            position={[cafe.latitude, cafe.longitude]}
                            eventHandlers={{
                                click: () => handleMarkerClick(cafe)
                            }}
                        >
                            <Popup>
                                <div style={styles.popupContent}>
                                    <strong style={styles.popupTitle}>{cafe.name}</strong><br />
                                    <span style={styles.popupText}>{cafe.address}</span><br />
                                    <span style={styles.popupRating}>{ratingDisplay}</span><br />
                                    <span style={styles.popupPrice}>{"$".repeat(cafe.price)}</span><br />
                                    {cafe.tags && (
                                        <><span style={styles.popupTags}>Tags: {cafe.tags}</span><br /></>
                                    )}
                                    {cafe.aiSummary && (
                                        <em style={styles.popupSummary}>{cafe.aiSummary}</em>
                                    )}
                                    <button
                                        onClick={() => handleMarkerClick(cafe)}
                                        style={styles.viewDetailsBtn}
                                    >
                                        View Details & Reviews
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Cafe Detail Modal */}
            {selectedCafe && (
                <CafeDetailModal
                    cafe={selectedCafe}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        width: '100%',
        position: 'relative',
        zIndex: 1
    },
    map: {
        height: '100%',
        width: '100%'
    },
    popupContent: {
        minWidth: '200px'
    },
    popupTitle: {
        fontSize: '1.1rem',
        color: '#6F4E37'
    },
    popupText: {
        fontSize: '0.9rem',
        color: '#666'
    },
    popupRating: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#6F4E37'
    },
    popupPrice: {
        fontSize: '1rem',
        color: '#6F4E37',
        fontWeight: 'bold'
    },
    popupTags: {
        fontSize: '0.85rem',
        color: '#888'
    },
    popupSummary: {
        fontSize: '0.85rem',
        color: '#555',
        display: 'block',
        marginTop: '8px',
        marginBottom: '8px'
    },
    viewDetailsBtn: {
        marginTop: '10px',
        padding: '8px 12px',
        backgroundColor: '#6F4E37',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        width: '100%'
    }
};

export default MapWithMarker;
