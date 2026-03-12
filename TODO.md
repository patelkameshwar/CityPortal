# Fix MulterError: Allow 50 Images for Hotel/Event/Tourism Uploads

## Plan Steps (Completed: ~~strikethrough~~)

### 1. ~~Create this TODO.md~~ (Done)

### 2. Update Routes (increase limit to 50) ✅
- ✅ backend/routes/hotelRoutes.js (POST /, PUT /:id)
- ✅ backend/routes/eventRoutes.js (POST /, PUT /:id)
- ✅ backend/routes/tourismRoutes.js (POST /, PUT /:id)

### 3. Add Validation & Logging to Controllers ✅
- ✅ backend/controllers/hotelController.js (createHotel, updateHotel)
- ✅ backend/controllers/eventController.js (createEvent, updateEvent) 
- ✅ backend/controllers/tourismController.js (createTourism, updateTourism)

### 4. Update api.js for Multipart Support
- [ ] frontend/src/services/api.js (add createHotelWithImages etc.)

### 5. Create Frontend Admin Forms
- [ ] frontend/src/pages/AddHotel.jsx
- [ ] Add to Navbar for admin/client

### 6. Test
- [ ] Restart backend: `cd backend && npm start`
- [ ] Postman POST /api/hotels with 50+ images field="images"
- [ ] Frontend form test
