# CityPortal Admin Hotel Edit Fix TODO

**Completed:**
- [x] Diagnose issue: Frontend form keys (title, price, capacity) not mapped to backend keys (name, pricePerNight, totalRooms) in AdminEdit.jsx handleSubmit.
- [x] Create edit plan with hotel-specific FormData.set().
- [x] User approved plan.
- [x] Edit admin/src/pages/Admin/AdminEdit.jsx: Added hotel if-block with submitData.set('name', formData.title), ('pricePerNight', formData.price), ('totalRooms', formData.capacity); removed capacity exclusion; cleaned event code.

**Remaining:**
- [ ] Test: Edit a hotel in admin panel, update name/price/rooms, verify success & backend data changed.
- [ ] Run `cd admin && npm run dev` if server not active.


