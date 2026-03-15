# Fix Image Removal in EditItems.jsx

## Steps:
- [x] Step 1: Create backend/controllers/utils/cloudinaryUtils.js with deleteImages function
- [x] Step 2: Update backend/controllers/hotelController.js - fix updateHotel image logic + use cloudinaryUtils  
- [x] Step 3: Update backend/controllers/eventController.js - fix updateEvent image logic + use cloudinaryUtils  
- [ ] Step 4: Test - restart backend (`cd backend && npm run dev`), use EditItems.jsx, remove image, submit, verify DB
- [ ] Step 5: Mark complete

**Status: Backend fixes complete. Ready for testing**
