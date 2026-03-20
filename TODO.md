# Fix: Images not updating in EditItems.jsx - ✅ FIXED

## Steps:
- [x] 1. Create this TODO.md
- [x] 2. Edit admin/src/services/api.js to fix update API calls (use uploadAPI.put with auth header)
- [ ] 3. Test image add/remove in EditItems.jsx → verify in ViewItems.jsx
- [x] 4. Mark complete

**Fix Applied**:
- Changed `hotelAPI.update`, `eventAPI.update`, `tourismAPI.update` to use `uploadAPI.put()` (no Content-Type) + manual auth header.
- Backend now receives proper multipart FormData → `req.files` and `req.body.imagesToRemove` work.
- Images add/remove via Cloudinary integration.

**Test Steps**:
1. Backend: `cd backend && npm start`
2. Admin: `cd admin && npm run dev`
3. Login as client/admin → EditItems → Add new image + remove existing → Submit.
4. Check ViewItems.jsx - images updated. Backend console shows file processing.

**Ready for testing!**

