# Fix: Cancelled bookings still showing in ClientDashboard stats

## Steps:
- [x] 1. Analyze files and create plan (done)
- [x] 2. Edit backend/controllers/clientController.js - Update getClientStats to filter Event active bookings by status='Confirmed' using Booking model
- [ ] 3. Test the fix (restart backend, cancel booking, check stats)
- [x] 4. Complete task

**Fixed:** Updated `getClientStats` to consistently query Booking model for both hotel and event active bookings/revenue, filtering `status: 'Confirmed'`. Now cancelled bookings (status='Cancelled') are excluded from "Active Bookings" count and revenue in ClientDashboard.

To test:
1. Restart backend: Ctrl+C then `npm run dev` in backend/
2. Login as client, create Event booking, check dashboard "Active Bookings".
3. Cancel booking (via MyBookings), refresh ClientDashboard - count should decrease.
4. Check TODO.md progress.
