# Precise lat/lng for Hotels - Steps
- [x] 1. Edit backend/models/Hotel.js - Add coordinates: { lat: Number, lng: Number }
- [x] 2. Edit admin/src/pages/Client/AddHotel.jsx - Add lat/lng inputs + geocode button  
- [x] 3. Edit backend/controllers/hotelController.js - Save coordinates in create/update

- [x] 4. Edit frontend/src/pages/HotelDetails.jsx - Use hotel.coordinates if available
- [ ] 5. Backend restart + test create hotel with coords

