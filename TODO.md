# Remember Me Fix TODO

## Planned Steps:
1. [x] Create TODO.md with steps 
2. [x] Edit frontend/src/pages/Login.jsx - Pass rememberMe to login()
3. [x] Edit frontend/src/context/AuthContext.jsx - Implement conditional localStorage/sessionStorage based on rememberMe
4. [ ] Test login with rememberMe checked/unchecked, browser close/reopen
5. [ ] Verify protected pages (MyProfile, MyBookings) require login when unchecked
6. [ ] Complete task

## Current Progress: Edits complete. Test:
1. Login with rememberMe ✓ → close browser → /my-profile should show profile
2. Login with rememberMe ✗ → close browser → /my-profile should show 'Please Login'

Run `cd frontend && npm run dev` to test.

Ready for completion.

