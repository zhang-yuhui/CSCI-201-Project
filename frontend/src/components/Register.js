import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    try {
      await AuthService.register(username, email, password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        setErrors(errorData);
      } else {
        setErrors({ general: errorData || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        {errors.general && <div style={styles.error}>{errors.general}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              style={{...styles.input, borderColor: errors.username ? '#dc3545' : '#ddd'}}
              placeholder="Enter your username (min 3 characters)"
            />
            {errors.username && <div style={styles.fieldError}>{errors.username}</div>}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{...styles.input, borderColor: errors.email ? '#dc3545' : '#ddd'}}
              placeholder="Enter your email"
            />
            {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="Enter your password (min 6 characters)"
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account? <a href="/login" style={styles.linkAnchor}>Login here</a>
        </p>
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
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontSize: '28px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  fieldError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '6px',
    fontSize: '14px'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666'
  },
  linkAnchor: {
    color: '#007bff',
    textDecoration: 'none'
  }
};

export default Register;

