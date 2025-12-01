import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login(username, password);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.icon}>☕</div>

        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Sign in to review and track your favorite cafes!</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email or Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="********"
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.signup}>
          Don’t have an account? <a href="/register" style={styles.signupLink}>Sign Up</a>
        </p>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(to bottom, #b18a60, #6d4b33)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },

  card: {
    backgroundColor: 'white',
    width: '360px',
    padding: '35px 30px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.2)',
    transform: 'translateX(-26px)'
  },

  icon: {
    fontSize: '40px',
    marginBottom: '10px'
  },

  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 600,
    color: '#333'
  },

  subtitle: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#777'
  },

  form: {
    marginTop: '20px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column'
  },

  label: {
    fontSize: '13px',
    marginBottom: '6px',
    color: '#444'
  },

  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '15px',
    fontSize: '15px'
  },

  forgot: {
    display: 'block',
    textAlign: 'right',
    fontSize: '12px',
    color: '#6d4b33',
    textDecoration: 'none',
    marginBottom: '12px'
  },

  button: {
    padding: '12px',
    backgroundColor: '#6d4b33',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },

  signup: {
    marginTop: '20px',
    fontSize: '13px',
    color: '#777'
  },

  signupLink: {
    color: '#6d4b33',
    fontWeight: '600',
    textDecoration: 'none'
  },

  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  }
};

export default Login;
