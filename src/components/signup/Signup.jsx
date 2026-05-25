import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { saveUser } from '../../service/login/loginService';
import LoadingOverlay from '../common/LoadingOverlay';

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { parsePhoneNumber } from 'libphonenumber-js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';



export default function Signup() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [actualMobile, setActualMobile] = useState('');
    const [country, setCountry] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [userRole, setUserRole] = useState(true); // false for User, true for Admin
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSignupBtnDisabled, setSignupBtnDisabled] = useState(true);
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

    // useEffect(() => {
    //     if (apiMessage.text && apiMessage.type === "success") {
    //         const timer = setTimeout(() => {
    //             setApiMessage({ text: "", type: "" });
    //         }, 3000); // 3 seconds

    //         return () => clearTimeout(timer);
    //     }
    // }, [apiMessage.text, apiMessage.type]);

    const validateForm = () => {


        const newErrors = {};

        if (!userId.trim()) {
            newErrors.userId = 'User ID is required';
        } else if (userId.trim().length < 3) {
            newErrors.userId = 'User ID must be at least 3 characters';
        }
        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
            newErrors.email = 'Email is invalid';
        }
        if (mobile != undefined) {
            const phoneNumber = parsePhoneNumberFromString(mobile);

            if (phoneNumber) {
                setCountryCode(phoneNumber.countryCallingCode);
                setActualMobile(phoneNumber.nationalNumber);
                setCountry(phoneNumber.country);
            }
            if (!mobile.trim()) {
                newErrors.mobile = 'Mobile number is required';
            }
            else if (mobile != undefined && actualMobile.trim().length < 10) {
                newErrors.mobile = 'Mobile number must be 10 digits';
            }
        }
        if (!dob.trim()) {
            newErrors.dob = 'Date of birth is required';
        }

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            setSignupBtnDisabled(false);
            setApiMessage({ type: '', text: '' });

            try {
                var newDob = dob.split('-');
                newDob = `${newDob[1]}/${newDob[2]}/${newDob[0]}`;
                console.log('Formatted DOB:', newDob);
                const result = await saveUser(userId, firstName, lastName, email, '+' + countryCode + ' ' + actualMobile, newDob, gender, password, userRole);

                if (result.success || (result.data != undefined && result.data.iSuccess)) {
                    setApiMessage({ type: 'success', text: result.data.message });
                    // Clear form
                    setUserId('');
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setMobile('');
                    setDob('');
                    setGender('');
                    setPassword('');
                    setConfirmPassword('');
                    setShowPassword(false);
                    setUserRole(true);

                    setIsLoading(false);

                    // Show loading overlay and redirect to dashboard after 1.5 seconds
                    // setIsLoading(true); // show overlay
                    // setTimeout(() => {
                    //     navigate('/dashboard');
                    //     setIsLoading(false);
                    // }, 1500);
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
            setTouched({ userId: true, password: true, firstName: true, lastName: true, email: true, dob: true, confirmPassword: true });
        }
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {

            setSignupBtnDisabled(false);
        }
    };

    const handleToggleRole = () => {
        setUserRole(prev => !prev);
    };

    const handleChange = (field, value) => {
        if (field === 'userId') {
            setUserId(value);
        } else if (field === 'firstName') {
            setFirstName(value);
        } else if (field === 'lastName') {
            setLastName(value);
        } else if (field === 'email') {
            setEmail(value);
        } else if (field === 'mobile') {
            setMobile(value);
        } else if (field === 'dob') {
            setDob(value);
        } else if (field === 'gender') {
            setGender(value);
        } else if (field === 'confirmPassword') {
            setConfirmPassword(value);
        } else if (field === 'userRole') {
            setUserRole(value);
        } else {
            setPassword(value);
        }

        if (touched[field]) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <p>Sign up for a new account</p>
                {apiMessage.text && (
                    <div
                        className={`api-message api-message-${apiMessage.type}`}
                        dangerouslySetInnerHTML={{ __html: apiMessage.text }}
                    />
                )}
                {isLoading && <LoadingOverlay />}
                <form onSubmit={handleSubmit}>
                    <div className="form-group-signup">

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
                    <div className="form-group-signup">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            placeholder="Enter your First Name"
                            value={firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            onBlur={() => handleBlur('firstName')}
                            className={errors.firstName && touched.firstName ? 'input-error' : ''}
                        />
                        {errors.firstName && touched.firstName && (
                            <span className="error-message">{errors.firstName}</span>
                        )}
                    </div>
                    <div className="form-group-signup">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Enter your Last Name"
                            value={lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            onBlur={() => handleBlur('lastName')}
                            className={errors.lastName && touched.lastName ? 'input-error' : ''}
                        />
                        {errors.lastName && touched.lastName && (
                            <span className="error-message">{errors.lastName}</span>
                        )}
                    </div>
                    <div className="form-group-signup">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your Email"
                            value={email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className={errors.email && touched.email ? 'input-error' : ''}
                        />
                        {errors.email && touched.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>
                    <div className="form-group-signup">
                        <label htmlFor="mobile">Mobile</label>

                        <PhoneInput
                            defaultCountry='IN'
                            value={mobile}
                            placeholder="Enter your Mobile Number"
                            onChange={(value) => handleChange('mobile', value)}
                            onBlur={() => handleBlur('mobile')}
                            inputProps={{
                                name: 'mobile',
                                required: true,
                            }}
                            containerClass="mobile-container"
                            inputClass={`mobile-input ${errors.mobile && touched.mobile ? 'input-error' : ''}`}
                            buttonClass="mobile-flag"
                        />

                        {errors.mobile && touched.mobile && (
                            <span className="error-message">{errors.mobile}</span>
                        )}
                    </div>
                    <div className="form-group-signup-dob">
                        <div className="dob-field">
                            <label htmlFor="dob">Date of Birth</label>
                            <input
                                id="dob"
                                type="date"
                                placeholder="Enter your Date of Birth"
                                value={dob}
                                onChange={(e) => handleChange('dob', e.target.value)}
                                onBlur={() => handleBlur('dob')}
                                className={errors.dob && touched.dob ? 'input-error' : ''}
                            />
                            {errors.dob && touched.dob && (
                                <span className="error-message">{errors.dob}</span>
                            )}
                        </div>
                        <div className="gender-options">
                            <label>Gender</label>
                            <label>
                                M
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    onBlur={() => handleBlur('gender')}
                                />
                            </label>
                            <label>
                                F
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    onBlur={() => handleBlur('gender')}
                                />
                            </label>
                            <label>
                                O
                                <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    checked={gender === 'other'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    onBlur={() => handleBlur('gender')}
                                />
                            </label>

                            {errors.gender && touched.gender && (
                                <span className="error-message">{errors.gender}</span>
                            )}
                        </div>
                    </div>
                    <div className="form-group-signup">
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
                    <div className="form-group-signup">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your Password"
                            value={confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            onBlur={() => handleBlur('confirmPassword')}
                            className={errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword}</span>
                        )}
                    </div>
                    <div className="form-group-signup">
                        <div className="toggle-container">
                            <label className="role-label">User Role</label>
                            <button
                                type="button"
                                onClick={handleToggleRole}
                                className={`modern-toggle-track ${userRole ? "on" : "off"}`}
                                aria-pressed={userRole}
                                onChange={(e) => handleChange('userRole', e.target.value)}
                                onBlur={() => handleBlur('userRole')}
                                disabled={isLoading}
                            >
                                {/* This is the sliding circle */}
                                <span className="modern-toggle-thumb" />
                            </button>
                            <span className="role-text">{userRole ? "User" : "Admin"}</span>
                        </div>
                    </div>
                    <div className="form-group form-actions">
                        <button
                            type="submit"
                            className="signup-btn"
                            disabled={isSignupBtnDisabled || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    {/* <span className="loader"></span> */}
                                    Sign Up is in progress...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>
                    <div className="login-link">
                        <span>Back to </span>
                        <a href="/login" className="login-text">Login</a>
                    </div>
                </form>
            </div >
        </div >
    );
}