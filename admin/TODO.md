# Task: Fix /admin/clients protection & backend API - COMPLETE

Changes:
- Protected frontend admin/client routes with ProtectedRoute → unauth redirect to /login immediately.
- Added backend/controllers/clientController.js: getAllClients() fetches users role='client'.
- Added backend/routes/adminRoutes.js: GET /api/admin/clients protected by auth/role middleware.

Test:
1. Ensure admin vite running: cd admin && npm run dev (port 5174)
2. Backend running: cd backend && npm start (port 5000)
3. No login → http://localhost:5174/admin/clients → redirects to /login
4. Login as admin → lists clients

See admin/TODO.md for details.
