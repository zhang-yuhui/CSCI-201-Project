import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        setErrors(errorData);
      } else {
        setErrors({
          general: errorData || 'Registration failed. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>
        <p style={styles.subtitle}>Join us and discover your next favorite cafe</p>

        {errors.general && <div style={styles.error}>{errors.general}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* USERNAME */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              style={{
                ...styles.input,
                borderColor: errors.username ? '#c0392b' : '#e0e0e0',
              }}
              placeholder="your_username"
            />
            {errors.username && (
              <div style={styles.fieldError}>{errors.username}</div>
            )}
          </div>

          {/* EMAIL */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                ...styles.input,
                borderColor: errors.email ? '#c0392b' : '#e0e0e0',
              }}
              placeholder="you@example.com"
            />
            {errors.email && (
              <div style={styles.fieldError}>{errors.email}</div>
            )}
          </div>

          {/* PASSWORD */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                ...styles.input,
                borderColor: errors.password ? '#c0392b' : '#e0e0e0',
              }}
              placeholder="At least 6 characters"
            />
            {errors.password && (
              <div style={styles.fieldError}>{errors.password}</div>
            )}
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Registering…' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

// ============ STYLES (styled to match your screenshot) ============
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #704e2e, #b58b59, #d0b084)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '18px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#3c2e1f',
  },
  subtitle: {
    marginBottom: '30px',
    color: '#7a6b5b',
    fontSize: '15px',
  },
  form: {
    textAlign: 'left',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#4a3b2f',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    backgroundColor: '#fafafa',
    fontSize: '15px',
    outline: 'none',
    transition: '0.2s',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    backgroundColor: '#6a4d33',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: '0.2s',
  },
  error: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  fieldError: {
    color: '#c0392b',
    fontSize: '13px',
    marginTop: '6px',
  },
  success: {
    backgroundColor: '#e9f7ef',
    color: '#1e8449',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  footerText: {
    marginTop: '25px',
    color: '#7d6a56',
    fontSize: '14px',
  },
  footerLink: {
    marginLeft: '4px',
    color: '#6a4d33',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Register;
