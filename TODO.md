# CityPortal - Hourly Booking MUI TimePicker Implementation

## Plan Summary
- Update HotelDetails.jsx: For hourly bookings, replace datetime-local with separate MUI DatePicker + TimePicker.
- Ensure compatibility with Booking.js model (separate date/time fields).
- Add MUI date picker dependencies.

Status: 🚀 In Progress

## Steps

### 1. [✅ COMPLETED] Check/install MUI DatePicker dependencies in frontend
   - Check frontend/package.json for @mui/x-date-pickers, @mui/material, date-fns.
   - Install: `cd frontend && npm i @mui/x-date-pickers @mui/material @emotion/react @emotion/styled date-fns @date-io/date-fns`

### 2. [✅ COMPLETED] Update HotelDetails.jsx with MUI TimePicker/DatePicker
   - Add MUI imports and LocalizationProvider.
   - Hourly section: separate state for checkInDate (Date), checkInTime (Date).
   - Use DatePicker for date, TimePicker for time.
   - Combine for API: new Date(date, time) -> ISO strings.
   - Update useEffect for checkOut calc.

### 3. [✅ COMPLETED] Verify Backend Booking.js model
   - Model supports separate fields; frontend sends ISO to Date fields (backend parses OK, time strings optional).

### 4. [PENDING] Test
   - Toggle hourly/nightly.
   - Pick date + time, submit.
   - Check MyBookings display.

### 5. [COMPLETED] Run `npm run dev` to test.
