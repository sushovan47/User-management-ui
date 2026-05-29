import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { loginUser } from '../../service/login/loginService';
import LoadingOverlay from '../common/LoadingOverlay';
import { useAuth } from "../../AuthContext";
import { React } from 'react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

    const roleRoutes = {
        ROLE_ADMIN: "/admin-dashboard",
        ROLE_MANAGER: "/manager-dashboard",
        ROLE_USER: "/user-dashboard"
    };


    const validateForm = () => {
        const newErrors = {};

        if (!userId.trim()) {
            newErrors.userId = 'User ID is required';
        } else if (userId.trim().length < 3) {
            newErrors.userId = 'User ID must be at least 3 characters';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.trim().length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            setApiMessage({ type: '', text: '' });

            try {
                const result = await loginUser(userId, password);

                if (result.success || (result.data != undefined && result.data.success)) {
                    // setApiMessage({ type: 'success', text: result.data.message });
                    // Clear form
                    setUserId('');
                    setPassword('');
                    setShowPassword(false);

                    // Show loading overlay and redirect to dashboard after 1.5 seconds
                    setIsLoading(true); // show overlay
                    setTimeout(() => {
                        login(result); // Update auth context with user data
                        navigate(roleRoutes[result.data.userRole]);
                        // navigate('/dashboard');
                        setIsLoading(false);
                    }, 1500);
                } else {
                    setIsLoading(false);
                    setApiMessage({ type: 'error', text: result.message });
                }
            } catch (error) {
                setIsLoading(false);
                setApiMessage({ type: 'error', text: 'An unexpected error occurred' });
            } finally {
                // setIsLoading(false);
            }
        } else {
            setErrors(newErrors);
            setTouched({ userId: true, password: true });
        }
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const newErrors = validateForm();
        setErrors(newErrors);
    };

    const handleChange = (field, value) => {
        if (field === 'userId') {
            setUserId(value);
        } else {
            setPassword(value);
        }

        if (touched[field]) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <p>Sign in to your account to continue</p>
                {isLoading && <LoadingOverlay />}
                <form onSubmit={handleSubmit}>
                    <div className="form-group-login">
                        <label htmlFor="userId">User ID</label>
                        <input
                            id="userId"
                            type="text"
                            placeholder="Enter your User ID"
                            value={userId}
                            onChange={(e) => handleChange('userId', e.target.value)}
                            onBlur={() => handleBlur('userId')}
                            className={errors.userId && touched.userId ? 'input-error' : ''}
                        />
                        {errors.userId && touched.userId && (
                            <span className="error-message">{errors.userId}</span>
                        )}
                    </div>
                    <div className="form-group-login">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your Password"
                                value={password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                className={errors.password && touched.password ? 'input-error' : ''}
                            />
                            <button
                                type="button"
                                className="eye-icon-btn"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                                title="Hold to reveal password"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && touched.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                    </div>

                    {apiMessage.text && (
                        <div
                            className={`api-message api-message-${apiMessage.type}`}
                            dangerouslySetInnerHTML={{ __html: apiMessage.text }}
                        />
                    )}

                    <div className="form-group form-actions">
                        <button
                            type="submit"
                            className="login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    {/* <span className="loader"></span> */}
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>
                </form>
                <div className="auth-links">
                    <div className="forgot-password-link">
                        <a
                            className={`forgot-password-text ${userId.trim() ? 'enabled' : 'disabled'}`}
                            onClick={(e) => {
                                if (!userId.trim()) {
                                    e.preventDefault();
                                }
                                else if (userId.trim()) {
                                    navigate("/forgot-password", { state: { userId } });
                                }

                            }}
                        >
                            Forgot Password?
                        </a>
                    </div>
                    <div className="signup-link">
                        <span>New User? </span>
                        <a href="/signup" className="signup-text">Sign up</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
