# Step-by-Step Guide: Deploying CityPortal Backend on Vercel

## Overview
This guide details deploying the **CityPortal backend** (Node.js/Express.js with MongoDB and Cloudinary) on [Vercel.com](https://vercel.com). Vercel excels at serverless deployments but requires adapting Express apps to **Vercel Serverless Functions** (API Routes). We'll create a `vercel.json` and entry point for seamless deployment.

**Key Differences from Render:**
- Vercel uses **serverless functions** (max 10s cold start on free tier).
- No persistent server; each request spawns a function.
- Auto-deploys from GitHub.

**Prerequisites:**
- Free [Vercel account](https://vercel.com) (GitHub login).
- Backend in GitHub repo (same as Render guide).
- MongoDB Atlas &amp; Cloudinary setup (same as Step 1 in Render guide).
- `.env` **never** committed.

## Step 1: External Services (Same as Render)
- MongoDB Atlas: Get `MONGO_URI`.
- Cloudinary: `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`.
- Generate `JWT_SECRET`, etc.

## Step 2: Adapt Backend for Vercel Serverless

Vercel doesn't run `server.js` directly. Create API routes under `/api`.

### Option 1: Full Restructure (Recommended for simplicity)
1. Create `backend/api/index.js` (single handler):
```js
// backend/api/index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require(&#39;cookie-parser&#39;);
const connectDB = require("../config/db");
// Import all models, middleware, routes...

module.exports = async (req, res) => {
  connectDB();  // DB connect
  
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_URL || &#39;http://localhost:5173&#39;, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  
  // Mount ALL your routes
  app.use("/auth", require("../routes/authRoutes"));
  app.use("/hotels", require("../routes/hotelRoutes"));
  app.use("/events", require("../routes/eventRoutes"));
  app.use("/tourism", require("../routes/tourismRoutes"));
  app.use("/bookings", require("../routes/bookingRoutes"));
  app.use("/admin", require("../routes/adminRoutes"));
  app.use("/blogs", require("../routes/blogRoutes"));
  
  app.get(&#39;/&#39;, (req, res) => res.json({ message: &#39;City Portal API Running&#39; }));
  
  // Handle the request
  return new Promise((resolve) => {
    app(req, res, resolve);
  });
};
```

2. **`backend/vercel.json`**:
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.js" },
    { "source": "/", "destination": "/api/index.js" }
  ]
}
```

### Option 2: vercel-express Package (Easier)
```
npm i vercel
```
Update `server.js`:
```js
// At bottom, replace app.listen with:
module.exports = app;
```
Add `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/server.js" }]
}
```

## Step 3: Deploy on Vercel

1. **CLI (Fastest)**:
   ```
   cd backend
   npm i -g vercel
   vercel login
   vercel
   ```
   - Sets env vars interactively.

2. **Dashboard**:
   - vercel.com → Add New → Project → Import Git repo.
   - **Root**: `./`
   - Override → Add `vercel.json`.

3. **Environment Variables** (Project Settings):
   ```
   MONGO_URI=your_atlas_url
   CLOUD_NAME=...
   CLOUD_API_KEY=...
   CLOUD_API_SECRET=...
   JWT_SECRET=...
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

## Step 4: Verify & Test

1. Deploy URL: `https://cityportal-backend-abc123.vercel.app`
2. Test: `curl https://your-app.vercel.app/api/`
3. Logs: Dashboard → Functions.

## Troubleshooting

| Error | Solution |
|-------|----------|
| Function timeout | Queries >10s? Optimize/paginate. Use mongoose caching. |
| DB connection | Add connection pooling: `mongoose.set(&#39;bufferCommands&#39;, false)` |
| Cold start slow | Normal free tier; upgrade Hobby ($20/mo). |
| Build error | `"engines": {"node": "18.x"}` in package.json |
| CORS | FRONTEND_URL env var. |
| Multer/Uploads | Direct to Cloudinary (Vercel body limit 4.5MB). |

**Free Limits**: 100 GB-hrs/mo functions, great for APIs.

**Pro Tips**:
- Deploy frontend to Vercel too (native Vite support).
- Use Vercel Speed Insights.
- Git push = instant redeploy.

Live in minutes! Docs: https://vercel.com/docs/functions
