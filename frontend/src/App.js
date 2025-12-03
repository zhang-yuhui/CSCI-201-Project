import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MapWithMarker from './components/MapWithMarker';
import 'leaflet/dist/leaflet.css';
import CafeMap from './components/CafeMap';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SocialPage from './components/SocialPage';
import EditProfile from './components/EditProfile';
import FriendProfile from './components/FriendProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route path="/map" element={<CafeMap />} />


        <Route path="/dashboard" element={<Navigate to="/map" replace />} />

        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <SocialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friend/:friendId"
          element={
            <ProtectedRoute>
              <FriendProfile />
            </ProtectedRoute>
          }
        />

        {/* Root also goes to /map now */}
        <Route path="/" element={<Navigate to="/map" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
