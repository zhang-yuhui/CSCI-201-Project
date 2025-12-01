import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    const newErrors = {};

    // Username validation
    if (!username || username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username =
        'Username can only contain letters, numbers, or underscores.';
    }

    // Email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    const passwordErrors = [];
    if (password.length < 6) {
      passwordErrors.push('at least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('one special character');
    }
    if (passwordErrors.length > 0) {
      newErrors.password =
        'Password must contain ' + passwordErrors.join(', ') + '.';
    }

    // Confirm password
    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // If any frontend validation errors, show banner like Login + field errors
    if (Object.keys(newErrors).length > 0) {
      const fieldMessages = Object.entries(newErrors)
        .filter(([key]) => key !== 'general')
        .map(([, msg]) => msg);
      newErrors.general = fieldMessages.join(' ');

      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await AuthService.register(username, email, password);
      setSuccess('Registration successful! Redirecting...');
      setErrors({});
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        // backend might send field errors — also mirror into .general
        const backendErrors = { ...errorData };
        if (!backendErrors.general) {
          const msgs = Object.values(backendErrors);
          if (msgs.length > 0 && typeof msgs[0] === 'string') {
            backendErrors.general = msgs.join(' ');
          } else {
            backendErrors.general = 'Registration failed. Please try again.';
          }
        }
        setErrors(backendErrors);
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
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            style={{
              ...styles.input,
              borderColor: errors.username ? '#c0392b' : '#ccc',
            }}
            placeholder="your_username"
          />
          {errors.username && (
            <div style={styles.fieldError}>{errors.username}</div>
          )}

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              ...styles.input,
              borderColor: errors.email ? '#c0392b' : '#ccc',
            }}
            placeholder="you@example.com"
          />
          {errors.email && (
            <div style={styles.fieldError}>{errors.email}</div>
          )}

          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                ...styles.input,
                borderColor: errors.password ? '#c0392b' : '#ccc',
              }}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showPasswordBtn}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <div style={styles.fieldError}>{errors.password}</div>
          )}

          <label style={styles.label}>Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              ...styles.input,
              borderColor: errors.confirmPassword ? '#c0392b' : '#ccc',
            }}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && (
            <div style={styles.fieldError}>{errors.confirmPassword}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={
              loading
                ? { ...styles.button, opacity: 0.8, cursor: 'not-allowed' }
                : styles.button
            }
          >
            {loading ? 'Registering…' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.signup}>
          Already have an account?{' '}
          <a href="/login" style={styles.signupLink}>Sign In</a>
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
    padding: '20px',
  },

  card: {
    backgroundColor: 'white',
    width: '360px',
    padding: '35px 30px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.2)',
    transform: 'translateX(-26px)',
  },

  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 600,
    color: '#333',
  },

  subtitle: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#777',
  },

  form: {
    marginTop: '20px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
  },

  label: {
    fontSize: '13px',
    marginBottom: '6px',
    color: '#444',
  },

  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '15px',
    fontSize: '15px',
    outline: 'none',
  },

  passwordWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
  },

  showPasswordBtn: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f1f1f1',
    cursor: 'pointer',
    fontSize: '13px',
  },

  button: {
    padding: '12px',
    backgroundColor: '#6d4b33',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '5px',
  },

  signup: {
    marginTop: '20px',
    fontSize: '13px',
    color: '#777',
  },

  signupLink: {
    color: '#6d4b33',
    fontWeight: '600',
    textDecoration: 'none',
  },

  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    marginTop: '15px',
    textAlign: 'center',
  },

  fieldError: {
    color: '#c0392b',
    fontSize: '12px',
    marginTop: '-8px',
    marginBottom: '10px',
  },

  success: {
    backgroundColor: '#e9f7ef',
    color: '#1e8449',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '15px',
    marginBottom: '10px',
    textAlign: 'center',
  },
};

export default Register;
