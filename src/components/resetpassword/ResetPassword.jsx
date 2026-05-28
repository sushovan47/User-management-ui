import { useEffect, useState } from 'react';
import './ResetPassword.css';
import { verifyLink } from '../../service/login/loginService';
import LoadingOverlay from '../common/LoadingOverlay';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
    const [linkInvalidMessage, setlinkInvalidMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isResetPasswordBtn, setIsResetPasswordBtn] = useState(true);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [userPkId, setUserPkId] = useState('');
    const [isPasswordFiled, setIsPasswordFiled] = useState(false);
    const [isConfirmPasswordFiled, setIsConfirmPasswordFiled] = useState(false);


    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        const rawUserPkId = searchParams.get('userId');

        // Safety check to ensure parameters exist before running logic
        if (!tokenFromUrl || !rawUserPkId) {
            setIsPasswordFiled(true);
            setIsConfirmPasswordFiled(true);
            setlinkInvalidMessage({ type: 'error', text: 'Link is not valid' });
            return;
        }

        // Fix the space issue caused by browser URL decoding
        const userPkId = rawUserPkId.replace(/ /g, '+');

        // Create an internal async function so we can use 'await' properly
        const checkTokenValidity = async () => {
            setIsLoading(true);
            try {
                // CRITICAL FIX: You MUST await your API call here
                const result = await verifyLink(tokenFromUrl, userPkId);

                // Double check if result and result.data exist before reading fields
                if (result && result.success && result.data && result.data.iSuccess) {
                    // TOKEN IS VALID: Allow them to change password
                    setApiMessage({ type: 'success', text: result.data.message || 'Link verified successfully!' });
                    setIsPasswordFiled(false); // Enable fields if they were disabled
                    setIsConfirmPasswordFiled(false);
                } else {
                    // TOKEN IS INVALID OR EXPIRED
                    setIsPasswordFiled(true);
                    setIsConfirmPasswordFiled(true);

                    const errorMsg = (result && result.data && result.data.message)
                        ? result.data.message
                        : 'The password reset link is invalid or has expired. Please request a new one.';

                    setlinkInvalidMessage({ type: 'error', text: errorMsg });
                }
            }
            catch (error) {
                // Crash protection if network fails entirely
                setIsPasswordFiled(true);
                setIsConfirmPasswordFiled(true);
                setlinkInvalidMessage({
                    type: 'error',
                    text: 'A network error occurred. Please try again later.'
                });
            }
            finally {
                setIsLoading(false);
            }
        };

        checkTokenValidity();

    }, [searchParams]);

    const handleResetPassword = async () => {
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {

            setIsResetPasswordBtn(false);
        }
    }
    const validateForm = () => {
        const newErrors = {};

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.trim().length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (confirmPassword.trim() !== password.trim()) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleChange = (field, value) => {
        if (field === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setPassword(value);
        }
        if (touched[field]) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    };

    return (
        <>
            {isLoading && <LoadingOverlay />}
            {linkInvalidMessage.text && (
                <div className="full-page-error-overlay">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <p>This page can only be accessed using a secure link sent to your email. If you already received one, the link may have expired (<b>valid for 2 minutes</b>). Please try requesting a new link from the fogot password page.</p>
                        <a href="/login" className="back-to-login-btn">Back to Login</a>
                    </div>
                </div>
            )}
            <div className={`reset-password-container ${linkInvalidMessage.text && linkInvalidMessage.type === 'error' ? 'blur-background' : ''}`}>

                <div className="reset-password-card">
                    <p>Reset Password ? retrieve from here</p>
                    <form>
                        {apiMessage.text && (
                            <div
                                className={`api-message api-message-${apiMessage.type}`}
                                dangerouslySetInnerHTML={{ __html: apiMessage.text }}
                            />
                        )}
                        <div className="form-group-signup">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your Password"
                                    value={password}
                                    disabled={isPasswordFiled || linkInvalidMessage.text} // Lock if link invalid
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
                                    disabled={linkInvalidMessage.text}
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
                        <div className="form-group-signup">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your Password"
                                value={confirmPassword}
                                disabled={isConfirmPasswordFiled || linkInvalidMessage.text} // Lock if link invalid
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                onBlur={() => handleBlur('confirmPassword')}
                                className={errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}
                            />
                            {errors.confirmPassword && touched.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>
                        <button
                            className="handle-reset-btn"
                            type="button"
                            onClick={handleResetPassword}
                            disabled={isResetPasswordBtn || linkInvalidMessage.text} // Lock if link invalid
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;
