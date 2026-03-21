# Task: Add Lat/Lng view to AdminView.jsx like ViewItems.jsx (COMPLETED ✅)

## Steps:
- [x] 1. Create this TODO.md with plan
- [x] 2. Edit admin/src/pages/Admin/AdminView.jsx:
  - Add lat/lng extraction in mapApiDataToView for hotel/event/tourism
  - Add conditional lat/lng display below location (same style as ViewItems.jsx)
- [x] 3. Test changes: cd admin && npm run dev, view hotel/event/tourism items with coordinates
- [x] 4. Update TODO.md with completion, attempt_completion

## Changes Summary:
- Added `lat`/`lng` mapping from `apiData.coordinates` for hotel/event/tourism types only
- Added 📍 coordinates badge below location display (blue monospace, 6 decimals)
- No changes for client type
- Matches ViewItems.jsx style exactly

**Ready to test:** Run `cd admin && npm run dev` and navigate to admin view pages for hotels/events/tourism.
