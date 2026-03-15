# CityPortal Admin/Client TODO - ViewItems Implementation

## Plan Breakdown (Approved: Client-side only)
**Types**: hotel, event
**Route**: `/client/view-items/:type/:id` (ProtectedRoute client)
**FaEye**: Update MyHotels.jsx, MyEvents.jsx buttons to Link

### Steps (In Progress)
- [x] 1. Create this TODO.md
- [x] 2. Create ViewItems.jsx (read-only EditItems clone)
- [x] 3. Add route to App.jsx  
- [x] 4. Update MyHotels.jsx FaEye → Link to `/client/view-items/hotel/${id}`
- [x] 5. Update MyEvents.jsx FaEye → Link to `/client/view-items/event/${id}`
- [x] 6. Test: `cd admin && npm run dev`, client login → my-hotels → FaEye
- [x] 7. Mark complete

**Notes**: Uses existing api (hotelAPI/eventAPI.getById), no new deps. Back to my-hotels/my-events.

