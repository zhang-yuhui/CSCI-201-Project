import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const testProtectedEndpoint = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.get('http://localhost:8080/api/test/protected', {
        headers: AuthService.getAuthHeader()
      });
      setMessage(response.data);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || 'Failed to access protected endpoint'));
    } finally {
      setLoading(false);
    }
  };
  const testPublicEndpoint = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.get('http://localhost:8080/api/test/public');
      setMessage(response.data);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || 'Failed to access public endpoint'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Dashboard</h2>
        <p style={styles.welcome}>Welcome, {currentUser?.username}!</p>
        <p style={styles.info}>You are successfully authenticated.</p>
        
        <div style={styles.buttonGroup}>
          <button onClick={testProtectedEndpoint} disabled={loading} style={styles.button}>
            {loading ? 'Testing...' : 'Test Protected Endpoint'}
          </button>
          <button onClick={testPublicEndpoint} disabled={loading} style={styles.button}>
            {loading ? 'Testing...' : 'Test Public Endpoint'}
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
    fontSize: '28px'
  },
  welcome: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
    marginBottom: '10px'
  },
  info: {
    textAlign: 'center',
    color: '#888',
    marginBottom: '30px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  logoutButton: {
    padding: '12px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  message: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    textAlign: 'center'
  }
};

export default Dashboard;

