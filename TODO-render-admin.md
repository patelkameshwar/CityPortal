# Deploy Admin Panel to Render.com

## Step 1: Prepare Git Repository
- Ensure all changes committed/pushed to GitHub/GitLab (repo root: CityPortal with admin/ subdir).
- [ ] Done

## Step 2: Create Render Static Site
- Login to [render.com](https://render.com)
- New > Static Site > Connect repo
- Root Directory: `admin`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- [ ] Deployed, note URL (e.g., https://cityportal-admin.onrender.com)

## Step 3: Update API URL (if backend deployed separately)
- Edit `admin/src/services/api.js`: change `const API_BASE_URL = '/api';` to `const API_BASE_URL = 'https://YOUR-BACKEND-URL.onrender.com/api';`
- Commit/push → auto-redeploy
- [ ] Updated

## Step 4: Test Deployment
- Visit deployed URL
- Test login/register, dashboards, CRUD operations
- Verify API calls (check browser console/network)
- [ ] Fully working

## Step 5: Optional Production Polish
- Deploy backend to Render Web Service first (Node.js)
- Set env vars on Render (e.g., MONGO_URI, CLOUDINARY_URL)
- Custom domain via Render dashboard
- [ ] Completed

**Notes**: Free tier sleeps after inactivity. Auto-deploys on git push to connected branch.

**Backend deploy guide next if needed?**
