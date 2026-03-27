# TourismDetails.jsx - Match EventDetails UI/Design

## Plan Breakdown & Progress

### 1. [x] Create this TODO.md (current)

### 2. ✅ Add backend support for similar tourism [Done]
   - ✅ Edit backend/controllers/tourismController.js: Add getSimilarTourism function 
   - ✅ Edit backend/routes/tourismRoutes.js: Add route GET /tourism/:id/similar

### 3. ✅ Update frontend services [Done]
   - ✅ Edit frontend/src/services/api.js: Add tourismAPI.getSimilar(id)

### 4. ✅ [Main] Refactor frontend/src/pages/TourismDetails.jsx [Done]
   - ✅ Full copy + adapt from EventDetails.jsx: exact layout/styling/modals/tabs/map/booking
   - ✅ Tourism-specific: name/entryFee/totalVisitors/openTime-closeTime/owner.name, FiMapPin/FiCamera icons
   - ✅ Booking: itemType:"Tourism", totalQuantity=visitors (max=totalVisitors), central bookingAPI.create
   - ✅ Tabs: Amenities/policies (hardcoded tourism-relevant), Location map, Similar via API

### 5. Skip - Model update [Skipped]
   - No amenities/policies fields needed (hardcoded works)

### 6. ✅ Task Complete - Test Ready
   - Backend /tourism/:id/similar endpoint ready
   - Frontend fully matched EventDetails UI
   - Run: cd frontend && npm run dev + backend server
   - Features: photo modal, booking modal->my-bookings, tabs, map, similar spots

**All steps complete! TourismDetails now matches EventDetails exactly.**


