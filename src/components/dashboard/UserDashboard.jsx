import { useEffect, useState, React, act } from 'react';
import './UserDashboard.css';
import { getStoredUser, logoutUser, updateUser, fetchUserById } from '../../service/login/loginService';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { FaEdit } from "react-icons/fa"; // react-icons for edit icon
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
            }
            else if (mobile != undefined && actualMobile.trim().length < 10) {
                returnMsg.push('Mobile number must be 10 digits');
            }
        }
        else if (mobile === undefined) {
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
        } else if (field === 'userRole') {
            setUserRole(value);
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
                const exactUserRole = exactUserDataSet.userCredentials[0]?.role || 'N/A';
                setUserRole(exactUserRole);
                setApiMessage({ type: 'success', text: result.data.message });

            } else {
                setApiMessage({ type: 'error', text: result.message });
            }
        }
        catch (error) {
            setApiMessage({ type: 'error', text: result.message });
        }
        finally {
            setIsLoading(false);
        }
    }
    const onSaveUser = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            var newDob = dob.split('-');
            newDob = `${newDob[1]}/${newDob[2]}/${newDob[0]}`;
            updateUser(userLoginId, userId, userFirstName, userLastName, userEmail, mobile, newDob, gender, userRole).then(result => {
                if (result.success || (result.data != undefined && result.data.iSuccess)) {
                    setApiMessage({ type: 'success', text: result.data.message });
                    // fetchUserData(userId);
                    setIsEditing(false);
                } else {
                    setApiMessage({ type: 'error', text: result.message });
                }
            }).catch(error => {
                setApiMessage({ type: 'error', text: error.message || 'An error occurred while updating user information' });
            });
        }
        else {
            setApiMessage({ type: 'error', text: newErrors });
            setTouched({ userId: true, userFirstName: true, userLastName: true, userEmail: true, mobile: true, dob: true, gender: true, userRole: true });
        }

    }

    const handleToggleRole = () => {
        setUserRole(prev => !prev);
    };

    useEffect(() => {
        const userData = getStoredUser();
        setIsLoading(true);
        fetchUserData(userData?.userId);
    }, []);

    useEffect(() => {
        // Only start a timer if a message is actually being displayed
        if (apiMessage.text) {
            const timer = setTimeout(() => {
                setApiMessage({ type: '', text: '' });
            }, 4000); // 4000 milliseconds = 4 seconds
            return () => clearTimeout(timer);
        }
    }, [apiMessage.text]);


    const handleLogout = () => {
        logoutUser();
        window.location.href = '/';
    };

    return (
        <>{isLoading && <LoadingOverlay />}
            <Header />
            {!isLoading && (<div className="dashboard-container">
                <div className="dashboard-content">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <div className="card-icon">📊</div>
                            <h3>Analytics</h3>
                            <p>View your analytics and performance metrics</p>
                            <button className="card-btn">View</button>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-icon">👤</div>
                            <h3>Profile</h3>
                            <p>Manage your profile information</p>
                            <button className="card-btn">Manage</button>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-icon">⚙️</div>
                            <h3>Settings</h3>
                            <p>Configure your preferences</p>
                            <button className="card-btn">Configure</button>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-icon">📝</div>
                            <h3>Reports</h3>
                            <p>Generate and view reports</p>
                            <button className="card-btn">Generate</button>
                        </div>
                    </div>

                    <div className="user-info-section">
                        <div className="info-card">
                            <div className="card-header">
                                <h3>User Information</h3>
                                <div className="edit-icon-wrapper">
                                    <FaEdit
                                        className={`edit-icon ${isEditing ? "active" : ""}`}
                                        onClick={() => setIsEditing(!isEditing)}
                                    />
                                    <span className="tooltip-text">Edit User Information</span>
                                </div>
                            </div>
                            <div className="info-grid">
                                <div className="info-item-user-id">
                                    <label>User ID:</label>
                                    {isEditing ? (
                                        <input
                                            className="user-id-dashboard-input"
                                            type="text"
                                            name="userId"
                                            value={userId}
                                            onChange={(e) => handleChange('userId', e.target.value)}
                                        />

                                    ) : (
                                        <span>{userId || "N/A"}</span>
                                    )}
                                    <span className="tooltip-text">For editing user ID click the edit icon</span>
                                </div>
                                <div className="info-item-user-id">
                                    <label>User First Name:</label>
                                    {isEditing ? (
                                        <input
                                            className="user-id-dashboard-input"
                                            type="text"
                                            name="userFirstName"
                                            value={userFirstName}
                                            onChange={(e) => handleChange('userFirstName', e.target.value)}
                                        />

                                    ) : (
                                        <span>{userFirstName || "N/A"}</span>
                                    )}

                                </div>
                                <div className="info-item-user-id">
                                    <label>User Last Name:</label>
                                    {isEditing ? (
                                        <input
                                            className="user-id-dashboard-input"
                                            type="text"
                                            name="userLastName"
                                            value={userLastName}
                                            onChange={(e) => handleChange('userLastName', e.target.value)}
                                        />

                                    ) : (
                                        <span>{userLastName || "N/A"}</span>
                                    )}
                                </div>
                                <div className="info-item-user-id">
                                    <label>User Email:</label>
                                    {isEditing ? (
                                        <input
                                            className="user-id-dashboard-input"
                                            type="text"
                                            name="userEmail"
                                            value={userEmail}
                                            onChange={(e) => handleChange('userEmail', e.target.value)}
                                        />

                                    ) : (
                                        <span>{userEmail || "N/A"}</span>
                                    )}
                                </div>
                                <div className="info-item-user-id">
                                    <label>User Mobile No:</label>
                                    {isEditing ? (

                                        <PhoneInput
                                            defaultCountry='IN'
                                            className="user-id-dashboard-input"
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
                                        <span>{mobile || "N/A"}</span>
                                    )}
                                    {errors.mobile && touched.mobile && (
                                        <span className="error-message">{errors.mobile}</span>
                                    )}
                                </div>
                                <div className="info-item-user-id">
                                    <label>Date of Birth:</label>
                                    {isEditing ? (
                                        <input
                                            id="dob"
                                            type="date"
                                            placeholder="Enter your Date of Birth"
                                            value={dob}
                                            onChange={(e) => handleChange('dob', e.target.value)}
                                            // onBlur={() => handleBlur('dob')}
                                            className={errors.dob && touched.dob ? 'input-error' : ''}
                                        />) : (

                                        <span>{dob || "N/A"}</span>)}
                                    {errors.dob && touched.dob && (
                                        <span className="error-message">{errors.dob}</span>
                                    )}
                                </div>
                                <div className="info-item-user-gender">
                                    <label>Role:</label>
                                    <button
                                        type="button"
                                        onClick={handleToggleRole}
                                        className={`modern-toggle-track ${userRole ? "on" : "off"}`}
                                        aria-pressed={userRole}
                                        onChange={(e) => handleChange('userRole', e.target.value)}
                                        // onBlur={() => handleBlur('userRole')}
                                        disabled={isLoading}
                                    >
                                        {/* This is the sliding circle */}
                                        <span className="modern-toggle-thumb" />
                                    </button>
                                    <span className="role-text">{userRole ? "User" : "Admin"}</span>
                                </div>
                                <div className="info-item-user-gender">
                                    <label>Gender</label>
                                    <label>
                                        M
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={gender === 'male'}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                        // onBlur={() => handleBlur('gender')}
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
                                        // onBlur={() => handleBlur('gender')}
                                        />
                                    </label>
                                    <label>
                                        O
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="other"
                                            checked={gender === 'other' || gender === null || gender === ''}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                        // onBlur={() => handleBlur('gender')}
                                        />
                                    </label>

                                    {errors.gender && touched.gender && (
                                        <span className="error-message">{errors.gender}</span>
                                    )}
                                </div>
                                {user?.tokenExpiration && (
                                    <div className="info-item-session-expiration">
                                        <label>Session Expires:</label>
                                        <span>{new Date(user.tokenExpiration).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {apiMessage.text && (
                                <div className={`dashboard-toast toast-${apiMessage.type}`}>
                                    <div className="toast-icon">
                                        {apiMessage.type === 'success' ? '✓' : '⚠'}

                                    </div>
                                    <div className="toast-content">
                                        <p className="toast-text"
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
                            <div className="submit-container">
                                <button type="submit" className="submit-btn" onClick={() => onSaveUser()} disabled={!isEditing}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            )
            }
            <Footer />
        </>

    );
}
