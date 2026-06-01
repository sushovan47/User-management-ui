import { useEffect, useState } from 'react';
import './UserDashboard.css';
import {
    getStoredUser,
    logoutUser,
    updateUser,
    fetchUserById
} from '../../service/login/loginService';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { FaEdit } from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import LoadingOverlay from '../common/LoadingOverlay';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userId, setUserId] = useState('');
    const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
    const [userFirstName, setFirstName] = useState('');
    const [userLastName, setLastName] = useState('');
    const [userEmail, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userLoginId, setuserLoginId] = useState(0);
    const [countryCode, setCountryCode] = useState('');
    const [actualMobile, setActualMobile] = useState('');
    const [country, setCountry] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [appName, setAppName] = useState('');
    const validateForm = () => {
        const returnMsg = [];

        if (!userId.trim()) {
            returnMsg.push('User ID is required');
        } else if (userId.trim().length < 3) {
            returnMsg.push('User ID must be at least 3 characters');
        }

        if (!userFirstName.trim()) {
            returnMsg.push('First name is required');
        } else if (userFirstName.trim().length < 2) {
            returnMsg.push('First name must be at least 2 characters');
        }

        if (!userLastName.trim()) {
            returnMsg.push('Last name is required');
        } else if (userLastName.trim().length < 2) {
            returnMsg.push('Last name must be at least 2 characters');
        }

        if (!userEmail.trim()) {
            returnMsg.push('Email is required');
        } else if (!/\S+@\S+\.\S+/.test(userEmail.trim())) {
            returnMsg.push('Email is invalid');
        }

        if (mobile != undefined) {
            const phoneNumber = parsePhoneNumberFromString(mobile);

            if (phoneNumber) {
                setCountryCode(phoneNumber.countryCallingCode);
                setActualMobile(phoneNumber.nationalNumber);
                setCountry(phoneNumber.country);
            }

            if (!mobile.trim()) {
                returnMsg.push('Mobile number is required');
            } else if (mobile != undefined && actualMobile.trim().length < 10) {
                returnMsg.push('Mobile number must be 10 digits');
            }
        } else if (mobile === undefined) {
            returnMsg.push('Mobile number is required');
        }

        if (!dob.trim()) {
            returnMsg.push('Date of birth is required');
        }

        return returnMsg.join('<BR/> ');
    };

    const handleChange = (field, value) => {
        if (field === 'userId') {
            setUserId(value);
        } else if (field === 'userFirstName') {
            setFirstName(value);
        } else if (field === 'userLastName') {
            setLastName(value);
        } else if (field === 'userEmail') {
            setEmail(value);
        } else if (field === 'mobile') {
            setMobile(value);
        } else if (field === 'dob') {
            setDob(value);
        } else if (field === 'userRole') {
            setUserRole(value);
        } else if (field === 'gender') {
            setGender(value);
        }

        if (touched[field]) {
            const newErrors = validateForm();
            setErrors(newErrors);
        }
    };

    const fetchUserData = async (userId) => {
        try {
            const result = await fetchUserById(userId);
            if (result.success || (result.data != undefined && result.data.iSuccess)) {
                const userList = result.data.data || [];
                const exactUserDataSet = userList.find(user => String(user.userId) === String(userId));

                setUser(exactUserDataSet);
                setUserId(exactUserDataSet.userId || '');
                setFirstName(exactUserDataSet.firstName || '');
                setLastName(exactUserDataSet.lastName || '');
                setEmail(exactUserDataSet.email || '');
                setMobile(exactUserDataSet.mobileNo || '');
                setDob(exactUserDataSet.dob || '');
                setGender(exactUserDataSet.gender || '');
                setuserLoginId(exactUserDataSet.id || 0);
                setAppName(result.data.appName);

                const exactUserRole = exactUserDataSet.userCredentials[0]?.role || 'N/A';
                setUserRole(exactUserRole);
                setApiMessage({ type: 'success', text: result.data.message });
            } else {
                setApiMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setApiMessage({ type: 'error', text: result.message });
        } finally {
            setIsLoading(false);
        }
    };

    const onSaveUser = async () => {
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            var newDob = dob.split('-');
            newDob = `${newDob[1]}/${newDob[2]}/${newDob[0]}`;

            updateUser(userLoginId, userId, userFirstName, userLastName, userEmail, mobile, newDob, gender, userRole)
                .then(result => {
                    if (result.success || (result.data != undefined && result.data.iSuccess)) {
                        setApiMessage({ type: 'success', text: result.data.message });
                        setIsEditing(false);
                    } else {
                        setApiMessage({ type: 'error', text: result.message });
                    }
                })
                .catch(error => {
                    setApiMessage({
                        type: 'error',
                        text: error.message || 'An error occurred while updating user information'
                    });
                });
        } else {
            setApiMessage({ type: 'error', text: newErrors });
            setTouched({
                userId: true,
                userFirstName: true,
                userLastName: true,
                userEmail: true,
                mobile: true,
                dob: true,
                gender: true,
                userRole: true
            });
        }
    };

    const handleToggleRole = () => {
        setUserRole(prev => !prev);
    };

    useEffect(() => {
        const userData = getStoredUser();
        setIsLoading(true);
        fetchUserData(userData?.userId);
    }, []);

    useEffect(() => {
        if (apiMessage.text) {
            const timer = setTimeout(() => {
                setApiMessage({ type: '', text: '' });
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [apiMessage.text]);

    const handleLogout = () => {
        logoutUser();
        window.location.href = '/';
    };

    return (
        <>
            {isLoading && <LoadingOverlay />}
            <div className="dashboard-page">
                {/* <Header /> */}

                {!isLoading && (
                    <div className="dashboard-shell">
                        <aside className="dashboard-sidebar">
                            <div className="sidebar-brand">
                                <div className="sidebar-logo">A</div>
                                <div>
                                    <h2>{appName}</h2>
                                    <p>User Panel</p>
                                </div>
                            </div>

                            <nav className="sidebar-nav">
                                <a href="#" className="active">🏠 Home</a>
                                <a href="#">🖼️ My Profile</a>
                                <a href="#">🔒 Security</a>
                                <a href="#">🕒 Activity Logs</a>
                            </nav>

                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </aside>

                        <main className="dashboard-main">
                            <section className="welcome-banner">
                                <div>
                                    <h1>👋 Welcome back, {userFirstName || 'User'}!</h1>
                                    <p>Manage your profile information and security preferences.</p>
                                </div>
                            </section>

                            <section className="dashboard-cards-grid">
                                <div className="modern-card">
                                    <h3>🖼️ Profile Information</h3>

                                    <div className="profile-details">
                                        <div className="profile-row">
                                            <span className="label">User ID</span>
                                            {isEditing ? (
                                                <input
                                                    className="modern-input"
                                                    type="text"
                                                    name="userId"
                                                    value={userId}
                                                    onChange={(e) => handleChange('userId', e.target.value)}
                                                />
                                            ) : (
                                                <span className="value">{userId || 'N/A'}</span>
                                            )}
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">First Name</span>
                                            {isEditing ? (
                                                <input
                                                    className="modern-input"
                                                    type="text"
                                                    name="userFirstName"
                                                    value={userFirstName}
                                                    onChange={(e) => handleChange('userFirstName', e.target.value)}
                                                />
                                            ) : (
                                                <span className="value">{userFirstName || 'N/A'}</span>
                                            )}
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">Last Name</span>
                                            {isEditing ? (
                                                <input
                                                    className="modern-input"
                                                    type="text"
                                                    name="userLastName"
                                                    value={userLastName}
                                                    onChange={(e) => handleChange('userLastName', e.target.value)}
                                                />
                                            ) : (
                                                <span className="value">{userLastName || 'N/A'}</span>
                                            )}
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">Email</span>
                                            {isEditing ? (
                                                <input
                                                    className="modern-input"
                                                    type="text"
                                                    name="userEmail"
                                                    value={userEmail}
                                                    onChange={(e) => handleChange('userEmail', e.target.value)}
                                                />
                                            ) : (
                                                <span className="value">{userEmail || 'N/A'}</span>
                                            )}
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">Mobile No</span>
                                            {isEditing ? (
                                                <PhoneInput
                                                    defaultCountry="IN"
                                                    className="modern-phone-input"
                                                    value={mobile}
                                                    onChange={(value) => handleChange('mobile', value)}
                                                    inputProps={{
                                                        name: 'mobile',
                                                        required: true,
                                                        readOnly: isViewMode,
                                                    }}
                                                    containerClass="mobile-container"
                                                    inputClass={`mobile-input ${errors.mobile && touched.mobile ? 'input-error' : ''}`}
                                                    buttonClass="mobile-flag"
                                                    international={false}
                                                    withCountryCallingCode={false}
                                                />
                                            ) : (
                                                <span className="value">{mobile || 'N/A'}</span>
                                            )}
                                            {errors.mobile && touched.mobile && (
                                                <span className="error-message">{errors.mobile}</span>
                                            )}
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">Date of Birth</span>
                                            {isEditing ? (
                                                <input
                                                    id="dob"
                                                    type="date"
                                                    value={dob}
                                                    onChange={(e) => handleChange('dob', e.target.value)}
                                                    className={`modern-input ${errors.dob && touched.dob ? 'input-error' : ''}`}
                                                />
                                            ) : (
                                                <span className="value">{dob || 'N/A'}</span>
                                            )}
                                            {errors.dob && touched.dob && (
                                                <span className="error-message">{errors.dob}</span>
                                            )}
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">Role</span>
                                            <div className="role-control">
                                                <button
                                                    type="button"
                                                    onClick={handleToggleRole}
                                                    className={`modern-toggle-track ${userRole ? "on" : "off"}`}
                                                    aria-pressed={userRole}
                                                    disabled={isLoading}
                                                >
                                                    <span className="modern-toggle-thumb" />
                                                </button>
                                                <span className="role-text">{userRole ? "User" : "Admin"}</span>
                                            </div>
                                        </div>

                                        <div className="profile-row">
                                            <span className="label">Gender</span>
                                            <div className="gender-group">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="male"
                                                        checked={gender === 'male'}
                                                        onChange={(e) => handleChange('gender', e.target.value)}
                                                    />
                                                    Male
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="female"
                                                        checked={gender === 'female'}
                                                        onChange={(e) => handleChange('gender', e.target.value)}
                                                    />
                                                    Female
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="other"
                                                        checked={gender === 'other' || gender === null || gender === ''}
                                                        onChange={(e) => handleChange('gender', e.target.value)}
                                                    />
                                                    Other
                                                </label>
                                            </div>
                                        </div>

                                        {user?.tokenExpiration && (
                                            <div className="profile-row">
                                                <span className="label">Session Expires</span>
                                                <span className="value">
                                                    {new Date(user.tokenExpiration).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {apiMessage.text && (
                                        <div className={`dashboard-toast toast-${apiMessage.type}`}>
                                            <div className="toast-icon">
                                                {apiMessage.type === 'success' ? '✓' : '⚠'}
                                            </div>
                                            <div className="toast-content">
                                                <p
                                                    className="toast-text"
                                                    dangerouslySetInnerHTML={{ __html: apiMessage.text }}
                                                />
                                            </div>
                                            <button
                                                className="toast-close-btn"
                                                onClick={() => setApiMessage({ type: '', text: '' })}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    <div className="action-row">
                                        <button
                                            type="submit"
                                            className="submit-btn"
                                            onClick={() => onSaveUser()}
                                            disabled={!isEditing}
                                        >
                                            Save Changes
                                        </button>

                                        <button
                                            type="button"
                                            className="edit-toggle-btn"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            <FaEdit />
                                            {isEditing ? 'Editing' : 'Edit Profile'}
                                        </button>
                                    </div>
                                </div>

                                <div className="modern-card">
                                    <h3>🔒 Security Panel</h3>

                                    <div className="security-item">
                                        <label>Current Password</label>
                                        <input type="password" className="modern-input" placeholder="••••••••" />
                                    </div>

                                    <div className="security-item">
                                        <label>New Password</label>
                                        <input type="password" className="modern-input" placeholder="••••••••" />
                                    </div>

                                    <div className="password-strength">
                                        <div className="strength-bar" />
                                    </div>
                                    <div className="strength-text">Password Strength: Weak</div>

                                    <button className="submit-btn secondary-btn">Update Password</button>
                                </div>
                            </section>

                            <section className="modern-card activity-card">
                                <h3>🕒 Recent Activity Logs</h3>

                                <div className="activity-item">
                                    <div className="activity-dot" />
                                    <div>
                                        <div className="activity-meta">June 01 - 14:04</div>
                                        <div className="activity-text">Logged in successfully (Chrome / Windows)</div>
                                    </div>
                                </div>

                                <div className="activity-item">
                                    <div className="activity-dot" />
                                    <div>
                                        <div className="activity-meta">May 28 - 09:12</div>
                                        <div className="activity-text">Password changed successfully</div>
                                    </div>
                                </div>
                            </section>
                        </main>
                    </div>
                )}

                <Footer />
            </div>
        </>
    );
}