# Fix ClientDashboard Chart Hover Data Issue

## Plan Overview
Fix mismatch between backend analytics data and frontend tooltip expectations. Add separate `hotelBookings`/`eventBookings` fields.

## Steps:
- [x] **Step 1:** Edit `backend/controllers/clientController.js` ✓ Added `hotelBookings`, `eventBookings`.
- [x] **Step 2:** Edit `admin/src/pages/Client/ClientDashboard.jsx` ✓ Added event Line, removed duplicate func.
- [x] **Step 1:** Edit backend ✓
- [x] **Step 2:** Edit frontend ✓ Added Lines, tooltip, refetch.
- [x] **Step 2.5:** Fixed TS errors, tooltip vars, duplicate Lines.
- [x] **Step 3:** Backend restarted.
- [ ] **Step 4:** Test in admin ClientDashboard - hover on charts shows real data from actual bookings.
**Progress:** Ready for test! Navigate to ClientDashboard, login as client, check charts.
