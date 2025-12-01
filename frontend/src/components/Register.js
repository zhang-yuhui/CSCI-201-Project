import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

    // --- Frontend validation ---
    const newErrors = {};

    // Username: min 3 chars, only letters/numbers/underscore
    if (!username || username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username =
        'Username can only contain letters, numbers, or underscores.';
    }

    // Simple email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation: 6+ chars, uppercase, lowercase, number, special char
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

    // Confirm password check
    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
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
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                ...styles.input,
                borderColor: errors.confirmPassword ? '#c0392b' : '#e0e0e0',
              }}
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <div style={styles.fieldError}>{errors.confirmPassword}</div>
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

// ============ STYLES (Cindy's UI + your extras blended) ============
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
  passwordWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  showPasswordBtn: {
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f5f0ea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6a4d33',
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
