import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, clearAuthStatus, setLogoutSuccess } from '../store/slices/authSlice';

const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, success } = useAppSelector((state) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        // Check for success messages from routing state (e.g. logout success)
        if (location.state?.successMessage) {
            dispatch(setLogoutSuccess(location.state.successMessage));
            // clear state history so refresh doesn't show it again
            window.history.replaceState({}, document.title);
            setTimeout(() => {
                dispatch(clearAuthStatus());
            }, 4000);
        } else {
            dispatch(clearAuthStatus());
        }

        // If already logged in, redirect to dashboard
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate, location, dispatch]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError('');
        dispatch(clearAuthStatus());

        if (!username.trim() || !password) {
            setValidationError('Please fill in all fields');
            return;
        }

        const result = await dispatch(loginUser({ username, password }));
        if (loginUser.fulfilled.match(result)) {
            navigate('/dashboard', { state: { successMessage: 'Login successful! Welcome back.' } });
        }
    };

    return (
        <div className="auth-page">
            <div className="glass-card animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 8px 24px var(--primary-glow)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18"></path>
                            <path d="M9 8h1"></path>
                            <path d="M9 12h1"></path>
                            <path d="M14 8h1"></path>
                            <path d="M14 12h1"></path>
                            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ fontSize: '0.9rem' }}>Sign in to manage your employee workspace</p>
                </div>

                {success && (
                    <div className="alert alert-success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                {(validationError || error) && (
                    <div className="alert alert-danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{validationError || error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Enter your username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                            disabled={loading}
                            required 
                        />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '28px' }}>
                        <label className="form-label">Password</label>
                        <div className="password-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control" 
                                placeholder="Enter your password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={loading}
                                required 
                            />
                            <button 
                                type="button" 
                                className={`password-toggle-btn ${showPassword ? 'slashed' : ''}`}
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '14px' }}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner"></div> : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;