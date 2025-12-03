import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CafeDetailModal from './CafeDetailModal';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWithMarker = ({ cafes = [] }) => {
  const center = [34.0522, -118.2437]; // Los Angeles

  return (
    <div style={styles.container}>
      <MapContainer center={center} zoom={13} style={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* One marker per café */}
        {cafes.map(cafe => (
          <Marker
            key={cafe.cafeId}
            position={[cafe.latitude, cafe.longitude]}
          >
            <Popup>
              <strong>{cafe.name}</strong><br />
              {cafe.address}<br />
              ⭐ {cafe.overallRating}<br />
              {"$".repeat(cafe.price)}<br />
              Tags: {cafe.tags}<br />
              <em>{cafe.aiSummary}</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
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