# Fix ClientDashboard Event Active Booking Count

## Plan Steps
- [x] 1. Update backend/controllers/clientController.js to expose `activeEventBookings` in `/client/stats`
- [ ] 2. Update admin/src/pages/Client/ClientDashboard.jsx to add 'Event Active Bookings' stat card using `statsData.activeEventBookings`
- [ ] 3. Test changes: Restart backend, refresh client dashboard
- [ ] 4. Verify count matches Confirmed future event bookings

**Status:** Starting implementation...

