# Backend API Integration Guide

## Project Structure
```
src/
├── service/
│   └── login/
│       ├── loginService.js    (API client)
│       └── README.md          (API documentation)
├── components/
│   └── login/
│       ├── Login.jsx          (Updated with API integration)
│       └── Login.css
```

## Frontend to Backend Communication

The login service is now fully connected to your frontend. When a user submits the login form:

1. **Form Validation** → Client-side validation occurs first
2. **API Call** → If validation passes, `loginUser()` sends POST request to backend
3. **Authentication** → Backend verifies credentials and returns token
4. **Token Storage** → Token is stored in `localStorage`
5. **UI Feedback** → Success/error messages are displayed
6. **Auto Redirect** → On success, page redirects after 1.5 seconds

---

## Expected Backend Endpoints

### 1. Login Endpoint
**URL:** `POST /api/auth/login`

**Request Body:**
```json
{
  "userId": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "123",
    "userId": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401/400):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 2. Verify User Endpoint (Optional)
**URL:** `POST /api/auth/verify-user`

**Request Body:**
```json
{
  "userId": "user@example.com"
}
```

**Success Response:**
```json
{
  "exists": true,
  "message": "User found"
}
```

---

### 3. Forgot Password Endpoint (Optional)
**URL:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "userId": "user@example.com"
}
```

**Success Response:**
```json
{
  "message": "Password reset link sent to email",
  "email": "us****@example.com"
}
```

---

## Backend Implementation Example (Node.js/Express)

```javascript
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    // TODO: Query database for user
    // TODO: Verify password (use bcrypt)
    
    // Example user data (replace with DB query)
    const user = {
      id: '123',
      userId: userId,
      name: 'John Doe'
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: token,
      user: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

---

## Environment Setup

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_secret_key_here
DB_URL=mongodb://localhost/myapp
```

---

## Testing the Integration

### 1. Start Backend Server
```bash
node server.js
# Server should be running on http://localhost:5000
```

### 2. Start Frontend Development Server
```bash
npm run dev
# React app will run on http://localhost:5173
```

### 3. Test Login Form
- Navigate to login page
- Enter valid credentials
- Success message should appear and token should be stored in localStorage
- Check browser DevTools → Application → LocalStorage to verify token

### 4. Check API Calls
- Open DevTools → Network tab
- Submit login form
- Look for POST request to `/api/auth/login`
- Verify request/response payloads

---

## Error Handling

The frontend handles these error scenarios:

1. **Network Error** → "An unexpected error occurred"
2. **Invalid Credentials** → Backend message displayed
3. **Validation Error** → Client-side validation messages
4. **Expired Token** → Auto-logout and redirect to login
5. **Server Error (5xx)** → Generic error message

---

## Token Management

### Token Storage
- Stored in: `localStorage` as `authToken`
- Automatically included in API requests via Authorization header
- Expires based on backend JWT configuration (default: 24h)

### Token Removal
- User logout: Automatically removed
- Token expiration: User auto-logged out
- Page refresh: Token persists (kept in localStorage)

---

## Next Steps

1. ✅ Frontend form with validation - DONE
2. ✅ API service layer - DONE
3. ⏳ Create backend API endpoints
4. ⏳ Set up JWT authentication
5. ⏳ Create database models for users
6. ⏳ Add password hashing (bcrypt)
7. ⏳ Test end-to-end login flow
8. ⏳ Add refresh token mechanism
9. ⏳ Create protected routes

---

## Support Files

- **loginService.js** - API client functions
- **Login.jsx** - Updated React component
- **Login.css** - UI styles with loader
- **.env.example** - Environment configuration template
