import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWithMarker = () => {
  const position = [34.0522, -118.2437]; // Los Angeles coordinates
  
  console.log('MapWithMarker component rendering');

  return (
    <div style={styles.container}>
      <MapContainer
        center={position}
        zoom={13}
        style={styles.map}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={position}>
          <Popup>
            <strong>Los Angeles</strong>
            <p>Downtown LA</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    width: '100%',
    position: 'relative',
    zIndex: 1
  },
  map: {
    height: '100%',
    width: '100%'
  }
};

export default MapWithMarker;