import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setIsAuthenticated(!!user);
  }, [location]);

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Cafe Finder
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link 
              to="/dashboard" 
              className={`navbar-link ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/map" 
              className={`navbar-link ${location.pathname === '/map' ? 'active' : ''}`}
            >
              Map
            </Link>
          </li>
          {!isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link 
                  to="/login" 
                  className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link 
                  to="/register" 
                  className={`navbar-link ${location.pathname === '/register' ? 'active' : ''}`}
                >
                  Register
                </Link>
              </li>
            </>
          ) : (
            <li className="navbar-item">
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

