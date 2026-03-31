# Google OAuth 2.0 Setup TODO

## Plan Summary
Implement Google OAuth using code flow: Frontend GoogleLogin (auth-code) -> sends code to backend /api/auth/google -> backend exchanges code for user info using google-auth-library -> creates/finds user -> returns JWT -> frontend logs in via AuthContext.

## Steps (Approved - Proceed)

### 1. Create frontend/.env with VITE_GOOGLE_CLIENT_ID
- User to add their public CLIENT_ID from Google Console.
- Content example:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.googleusercontent.com
```

### 2. Update backend/controllers/authController.js
- Add googleLogin function using OAuth2Client to exchange code, verify, get user info.
- Find/create user, generate JWT.

### 3. Update backend/routes/authRoutes.js
- Add POST /auth/google route.

### 4. Update frontend/src/services/api.js
- Add authAPI.googleLogin('/auth/google', data).

### 5. Update frontend/src/App.jsx
- Import GoogleOAuthProvider, wrap <AuthProvider> with it using VITE_GOOGLE_CLIENT_ID.

### 6. Update frontend/src/pages/Login.jsx
- Import GoogleLogin from '@react-oauth/google'.
- Add GoogleLogin button after email/password form.
- onSuccess: call authAPI.googleLogin({code}), then login().
- Handle errors with toast.

### 7. Test
- Restart frontend/backend servers.
- Go to /login, click Google button, authorize, check login/token set.

### 8. Optional: Add to Register.jsx or admin if needed.

**Progress: 6/8 complete** (backend, frontend api, App.jsx, Login.jsx updated)

Next steps:
1. Add to frontend/.env:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_from_google_console.apps.googleusercontent.com
```
(copy the CLIENT_ID value from your backend .env CLIENT_ID)

2. Restart frontend dev server (npm run dev in frontend/) to load VITE_GOOGLE_CLIENT_ID.

3. Restart backend (nodemon server.js or similar).

4. Test at http://localhost:5173/login - use Google button.

User model may need googleId field added to schema if not exists (optional, email used for unique).

