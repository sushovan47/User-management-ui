/**
 * Login Service - Handles all login-related API calls
 */

import { API_BASE_URL } from '../../config/apiConfig';

const TOKEN_KEY = 'authToken';
const USER_ID = 'userId';
const TOKEN_EXP = 'tokenExpiration';
const USER_ROLE = 'userRole';

export const getAuthToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
    const userId = localStorage.getItem(USER_ID);
    const userRole = localStorage.getItem(USER_ROLE);
    const tokenExpiration = localStorage.getItem(TOKEN_EXP);
    return userId && userRole ? { userId, userRole, tokenExpiration } : null;
};

export const isUserAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY);
};

export const isTokenExpired = () => {
    const expiry = localStorage.getItem(TOKEN_EXP); // stored at login
    if (!expiry) {
        return true;
    }
    const now = Date.now();
    return now > Number(expiry); // true if expired
}

/**
 * Authenticate user with userId and password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {Promise} - API response with user data and token
 */
const fetchWithRetry = async (url, options, retries = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options).catch(() => ({}));

            // For 5xx server errors, don't retry - throw immediately
            if (response.status === undefined) {
                throw new Error('An error occurred during login');
            }
            if (response.status >= 500 && response.status < 600) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message);
            }


            const data = await response.json();

            if (response.ok) {
                return { response, data };
            }

            lastError = new Error(data.message || 'Login failed. Please try again.');
            if (attempt < retries) {
                continue;
            }
        }
        catch (error) {
            lastError = error;
            if (attempt >= retries) {
                break;
            }
        }

        throw lastError;
    };
}

export const loginUser = async (userId, password) => {
    try {
        const { response, data } = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                userId: userId.trim(),
                password: password.trim(),
            }),
        }, 3);

        // Store token in localStorage
        if (data.token) {
            // const expiredtimeJwt = data.expirationTime; // Exactly 30 seconds for testing
            // const currentTime = Date.now();
            // const expirationTimestamp = Math.floor((currentTime + expiredtimeJwt) / 1000);
            localStorage.setItem(TOKEN_EXP, data.expirationTime.toString());
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_ID, data.userId);
            localStorage.setItem(USER_ROLE, data.userRole);
        }

        return {
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred during login',
            error: error,
        };
    }
};

export const saveUser = async (userId, firstName, lastName, email, mobile, dob, gender, password, userRole) => {
    try {
        const { response, data } = await fetchWithRetry(`${API_BASE_URL}/auth/saveUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                userId: userId.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                mobileNo: mobile.trim(),
                dob: dob.trim(),
                gender: gender.trim(),
                hashPwdCode: password.trim(),
                isUser: userRole === true ? true : false,
                isAdmin: userRole === false ? true : false
            }),
        }, 3);
        return {
            data: data,
            success: data.iSuccess,
            message: data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.message.toString().replace(';', '') || 'An error occurred during login',
            error: error,
        };
    }
};

export const fetchUserById = async (userId, callFromInd) => {
    return makeAuthenticatedRequest(`/auth/fetchUserById?searchParamKey=${userId}`, {
        method: 'GET'

    }, callFromInd);

};

export const fetchEmailByUserById = async (userId) => {
    try {
        const { response, data } = await fetchWithRetry(`${API_BASE_URL}/auth/getUserEmailByUserId?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }, 3);
        return {
            data: data,
            success: data.iSuccess,
            message: data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.message.toString().replace(';', '') || 'An error occurred during login',
            error: error,
        };
    }

};

export const updateUser = async (id, userId, firstName, lastName, email, mobile, dob, gender, userRole) => {

    return makeAuthenticatedRequest(`/user/updateUser/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            userId: userId.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            mobileNo: mobile.trim(),
            dob: dob.trim(),
            gender: gender.trim(),
            isUser: userRole === true ? true : false,
            isAdmin: userRole === false ? true : false
        }),
    }, 3);
};

export const generateOtpAndSendMail = async (userId, email) => {

    return makeAuthenticatedRequest(`/auth/generateOtpNSendMail`, {
        method: 'POST',
        body: JSON.stringify({
            userId: userId.trim(),
            email: email.trim()
        }),
    }, 3);
};

export const verifyOtp = async (userId, otp, email, userPkId) => {

    return makeAuthenticatedRequest(`/auth/verifyOtp`, {
        method: 'POST',
        body: JSON.stringify({
            userId: userId.trim(),
            otp: otp.trim(),
            email: email.trim(),
            userPkId: userPkId
        }),
    }, 3);
};

export const verifyLink = async (token, userPkId) => {

    return makeAuthenticatedRequest(`/auth/validLink`, {
        method: 'POST',
        body: JSON.stringify({
            token: token.trim(),
            userPkId: userPkId.trim(),
            hashCode: ''
        }),
    }, 3);
};

export const resetPassword = async (token, userPkId, hashCode) => {

    return makeAuthenticatedRequest(`/auth/resetPassword`, {
        method: 'POST',
        body: JSON.stringify({
            token: token.trim(),
            userPkId: userPkId.trim(),
            hashCode: encodeURIComponent(hashCode.trim())
        }),
    }, 3);
};

export const uploadImage = async (formData, userCrednId) => {
    try {
        const { response, data } = await fetchWithRetry(`${API_BASE_URL}/auth/uploadImage?userCrednId=${userCrednId}`, {
            method: 'POST',
            body: formData
            // headers: {
            //     Authorization: `Bearer ${getAuthToken()}`,
            // }
        }, 3);

        return {
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred during upload image',
            error: error,
        };
    }
};

export const fetchDownloadImage = async (userCrednid) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/downloadImage/${userCrednid}`, {
            method: 'GET'
            // headers: {
            //     Authorization: `Bearer ${getAuthToken()}`,
            // }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        var blobUrl = null
        if (blob.size > 0) {
            blobUrl = URL.createObjectURL(blob);
        }


        return { blobUrl };   // ✅ return blobUrl
    } catch (error) {
        return { error: error.message || 'Failed to fetch image' };
    }
};
/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
            isUser: userRole === true ? true : false,
            isAdmin: userRole === false ? true : false
        }),
    }, 3);
};

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - API response
 */
export const makeAuthenticatedRequest = async (endpoint, options = {}, callFromInd) => {
    try {
        const token = getAuthToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        };

        if (token && callFromInd != undefined && callFromInd != 'TKNR') {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {}),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                logoutUser();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.message || 'API request failed');
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred',
            error: error,
        };
    }
};

/**
 * Logout user - Clear stored credentials
 */
export const logoutUser = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_ID);
        localStorage.removeItem(USER_ROLE);
        localStorage.removeItem(TOKEN_EXP);
        return {
            success: true,
            message: 'Logout successful',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error during logout',
            error: error,
        };
    }
};


