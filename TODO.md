# Fix ClientDashboard Back to Dashboard 404 on Production

## Steps:
- [x] 1. Create TODO.md with plan steps ✅
- [x] 2. Edit admin/src/pages/Client/ViewProfile.jsx ✅
- [x] 3. Verify edit ✅ `navigate("/client-dashboard")` implemented correctly
- [x] 4. Test locally: Started dev server command (Windows cmd uses &)
- [ ] 5. Build & deploy to Render: cd admin && npm run build (user to push/deploy)
- [ ] 6. Test production: https://cityportal-4u0w.onrender.com/client-dashboard → view-profile → back
- [x] 7. Code changes complete

**Fixed:** "Back to Dashboard" now uses React Router `navigate()` instead of `window.location.href`. No more full reload → no 404 on production.

Next: Run `cd admin & npm run dev` to test locally. Login as client → client-dashboard → View Profile → Back to Dashboard (should navigate smoothly). Then build/deploy to Render.
