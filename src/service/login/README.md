# Login Service API Documentation

## Overview
The `loginService.js` provides all authentication-related API calls for the login functionality.

## Available Functions

### 1. `loginUser(userId, password)`
Authenticates user and stores authentication token.

**Parameters:**
- `userId` (string): User's ID
- `password` (string): User's password

**Returns:** Promise with response object
```javascript
{
  success: true/false,
  data: { token, user, ...},
  message: "Success/Error message"
}
```

**Example:**
```javascript
import { loginUser } from '../service/login/loginService';

const result = await loginUser('user123', 'password123');
if (result.success) {
  console.log('Login successful:', result.data);
} else {
  console.log('Error:', result.message);
}
```

---

### 2. `logoutUser()`
Clears stored authentication data.

**Returns:** Object with success status

**Example:**
```javascript
import { logoutUser } from '../service/login/loginService';

logoutUser();
```

---

### 3. `getAuthToken()`
Retrieves stored authentication token.

**Returns:** Token string or null

**Example:**
```javascript
import { getAuthToken } from '../service/login/loginService';

const token = getAuthToken();
```

---

### 4. `getStoredUser()`
Retrieves stored user information.

**Returns:** User object or null

**Example:**
```javascript
import { getStoredUser } from '../service/login/loginService';

const user = getStoredUser();
```

---

### 5. `isUserAuthenticated()`
Checks if user is currently authenticated.

**Returns:** Boolean

**Example:**
```javascript
import { isUserAuthenticated } from '../service/login/loginService';

if (isUserAuthenticated()) {
  // User is logged in
}
```

---

### 6. `makeAuthenticatedRequest(endpoint, options)`
Makes authenticated API requests with token.

**Parameters:**
- `endpoint` (string): API endpoint path
- `options` (object): Fetch options (method, body, etc.)

**Returns:** Promise with response

**Example:**
```javascript
import { makeAuthenticatedRequest } from '../service/login/loginService';

const result = await makeAuthenticatedRequest('/user/profile', {
  method: 'GET'
});
```

---

### 7. `verifyUserExists(userId)`
Checks if a user exists in the system.

**Parameters:**
- `userId` (string): User ID to verify

**Returns:** Promise with verification result

**Example:**
```javascript
import { verifyUserExists } from '../service/login/loginService';

const result = await verifyUserExists('user123');
```

---

### 8. `requestPasswordReset(userId)`
Requests a password reset for a user.

**Parameters:**
- `userId` (string): User ID for reset

**Returns:** Promise with reset response

**Example:**
```javascript
import { requestPasswordReset } from '../service/login/loginService';

const result = await requestPasswordReset('user123');
```

---

## Configuration

### Backend URL
Set your backend API URL in the environment variable:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Or it defaults to: `http://localhost:5000/api`

---

## Expected Backend API Endpoints

```
POST   /api/auth/login              - User login
POST   /api/auth/verify-user        - Verify user exists
POST   /api/auth/forgot-password    - Request password reset
```

## Token Storage
- Token is automatically stored in `localStorage` as `authToken`
- User data is stored as `user` JSON string
- Token is automatically sent with authenticated requests in Authorization header

## Error Handling
- 401 Status: Session expired, user is logged out automatically
- Other errors: Returned in response with error message
