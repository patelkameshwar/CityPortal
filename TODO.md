# Fix Similar Events Not Displaying in EventDetails.jsx

## Plan Overview
- **Root cause**: Missing backend `/events/:id/similar` endpoint.
- **Solution**: Add route + controller to return similar events (match location/artist, exclude self, limit 8).
- **Files**: backend/routes/eventRoutes.js, backend/controllers/eventController.js.

## Steps to Complete
- [x] Step 1: Edit backend/routes/eventRoutes.js - Add GET /:id/similar route (public).
- [x] Step 2: Edit backend/controllers/eventController.js - Add getSimilarEvents function.
- [ ] Step 3: Restart backend server (if running).
- [ ] Step 4: Test EventDetails similar events tab.
- [ ] Step 5: attempt_completion.

Progress: Starting Step 1.
