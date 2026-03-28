# Active Bookings Filter Task - TODO

## Plan Progress
✅ **Step 1**: Plan approved  
✅ **Step 2**: Create TODO.md  
✅ **Step 3**: Read controller file  
✅ **Step 4**: Edit backend/controllers/clientController.js - Added `bookingDate >= today` filter for Event bookings  

⏳ **Step 5**: Test API endpoint  
⏳ **Step 6**: Verify ClientDashboard stats card  

## Status
**Backend Fixed** ✅ Active Bookings now counts only **today + future** bookings (Hotels: `bookingToDate >= today`, Events: `bookingDate/bookingToDate >= today`)  
**Frontend** ✅ Auto-updates via `/client/stats` API  

**Next**: Run backend & test stats API

