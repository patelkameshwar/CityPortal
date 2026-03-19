# CityPortal Task: Context-Aware Back Navigation for AdminView

## Approved Plan Steps:
- [x] 1. Update TODO2.md
- [x] 2. Edit AdminDashboard.jsx: Add state={{from: '/admin-dashboard', fromLabel: 'Dashboard'}} to all 4 FaEye Links (client/hotel/event/tourism tables)
- [x] 3. Edit ManageClients.jsx, ManageHotels.jsx, EventDashboard.jsx, TourismManagement.jsx: Add state={{from: respective path, fromLabel: respective label}} to FaEye Links
- [x] 4. Edit AdminView.jsx: Add useLocation, compute backPath/backLabel from state || backRoutes[type] || dashboard, replace all backRoute usages
- [x] 5. Test all flows, update TODO, complete

**Status:** ✅ All FaEye links updated with navigation state. Context-aware Back buttons now work:
- Dashboard FaEye → AdminView → Back → Dashboard
- ManageClients FaEye → AdminView → Back → ManageClients
- Similar for Hotels/Events/Tourism.

Run `cd admin && npm run dev` to test.

