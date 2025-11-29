import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/AuthService';

const EditProfile = () => {
    const currentUser = AuthService.getCurrentUser();
    const [username, setUsername] = useState(currentUser?.username || "");
    const [originalUsername] = useState(currentUser?.username || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const validateUsername = (name) => {
        if (!name || name.trim().length === 0) {
            return "Username cannot be empty";
        }
        if (name.trim().length < 3) {
            return "Username must be at least 3 characters";
        }
        if (name.trim().length > 50) {
            return "Username cannot exceed 50 characters";
        }
        if (!/^[a-zA-Z0-9_]+$/.test(name.trim())) {
            return "Username can only contain letters, numbers, and underscores";
        }
        return null;
    };

    const handleSave = async () => {
        // Reset messages
        setError("");
        setSuccess("");

        // Validate
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Check if no changes
        if (username.trim() === originalUsername) {
            setSuccess("No changes to save");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.put('http://localhost:8080/api/users/profile', 
                { username: username.trim() }, 
                { headers: AuthService.getAuthHeader() }
            );
            
            if (res.data.success) {
                // Update local storage with new username
                const updatedUser = { ...currentUser, username: res.data.newUsername || username.trim() };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                setSuccess(res.data.message || "Profile updated successfully!");
                
                // Navigate after a short delay to show success message
                setTimeout(() => {
                    navigate('/social');
                }, 1500);
            } else {
                setError(res.data.error || "Failed to update profile");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMsg = err.response?.data?.error || "Error updating profile. Please try again.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/social');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Edit Profile</h2>
                
                {/* Avatar */}
                <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>
                        {username.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div style={styles.successBox}>
                        {success}
                    </div>
                )}

                {/* Username Field */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError("");
                            setSuccess("");
                        }}
                        onKeyPress={handleKeyPress}
                        style={styles.input}
                        placeholder="Enter new username"
                        disabled={loading}
                        maxLength={50}
                    />
                    <small style={styles.hint}>
                        3-50 characters, letters, numbers, and underscores only
                    </small>
                </div>

                {/* Email Field (Read-only) */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input 
                        type="email" 
                        value={currentUser?.email || ""} 
                        style={{...styles.input, ...styles.readOnlyInput}}
                        disabled
                    />
                    <small style={styles.hint}>
                        Email cannot be changed
                    </small>
                </div>

                {/* Buttons */}
                <div style={styles.buttonGroup}>
                    <button 
                        onClick={handleSave}
                        style={{
                            ...styles.saveButton,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                        onClick={handleCancel}
                        style={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#f8f5f2',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 20px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    title: {
        textAlign: 'center',
        color: '#6F4E37',
        marginTop: 0,
        marginBottom: '30px'
    },
    avatarContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px'
    },
    avatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#6F4E37',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '42px',
        fontWeight: 'bold'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#333'
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '1rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    readOnlyInput: {
        backgroundColor: '#f5f5f5',
        color: '#888',
        cursor: 'not-allowed'
    },
    hint: {
        display: 'block',
        marginTop: '6px',
        fontSize: '0.8rem',
        color: '#888'
    },
    errorBox: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem'
    },
    successBox: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem'
    },
    buttonGroup: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px'
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#6F4E37',
        color: 'white',
        border: 'none',
        padding: '14px 20px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#666',
        border: '2px solid #ddd',
        padding: '14px 20px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'border-color 0.2s'
    }
};

export default EditProfile;
