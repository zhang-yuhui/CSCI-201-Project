import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CafeMap from './components/CafeMap';   // <-- CORRECT IMPORT
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<CafeMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

// <Router>
    //   <Routes>
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/register" element={<Register />} />
    //     <Route
    //       path="/dashboard"
    //       element={
    //         <ProtectedRoute>
    //           <Dashboard />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route path="/" element={<Navigate to="/dashboard" replace />} />
    //   </Routes>
    // </Router>