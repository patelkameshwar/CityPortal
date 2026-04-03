# Step-by-Step Guide: Deploying CityPortal Backend on Render

## Overview
This guide provides detailed instructions to deploy the **CityPortal backend** (Node.js/Express.js with MongoDB and Cloudinary) on [Render.com](https://render.com), a free platform for deploying web services. Render auto-detects Node.js apps, handles builds, and provides environment variables for secrets.

**Prerequisites:**
- A free [Render account](https://render.com) (sign up with GitHub for easy repo linking).
- Your backend code pushed to a **GitHub repository** (public or private). If not, create one:
  1. `cd backend`
  2. `git init`
  3. `git add .`
  4. `git commit -m \"Initial backend commit\"`
  5. Create a new GitHub repo and push: `git remote add origin <your-repo-url> && git push -u origin main`
- MongoDB Atlas account (free tier) for the database.
- Cloudinary account (free tier) for image uploads.
- `.env` file with all secrets (do **not** commit it to Git!).

## Step 1: Set Up External Services

### 1.1 MongoDB Atlas (Database)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free cluster (M0 tier).
3. In **Database Access**, create a user (e.g., username: `cityportal`, password: generate strong one).
4. In **Network Access**, add `0.0.0.0/0` (allow all, restrict later).
5. Get your **connection string**:
   ```
   mongodb+srv://cityportal:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&amp;w=majority
   ```
6. Replace `<password>` with your user's password. **Save this as `MONGO_URI`.**

### 1.2 Cloudinary (Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com).
2. Go to **Dashboard** → copy:
   - `Cloud name`
   - `API Key`
   - `API Secret`
3. **Save these as `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`.**

### 1.3 Prepare `.env` Template
Create `backend/.env` (local dev only, add to `.gitignore`):
```
MONGO_URI=mongodb+srv://cityportal:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&amp;w=majority
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
EMAIL_USER=your_nodemailer_email
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_oauth_id
FRONTEND_URL=https://your-frontend-domain.com  # Update later
PORT=5000  # Optional, Render overrides
```
- Generate `JWT_SECRET` (use `openssl rand -base64 32`).
- Email/Google creds optional (from `authController.js`).

## Step 2: Prepare Backend for Production

1. **Verify `package.json`** (already good):
   ```
   "start": "node server.js"
   ```
   Render runs `npm install` then `npm start`.

2. **Update CORS** (in `backend/server.js`):
   Add your frontend URL later:
   ```js
   app.use(cors({
     origin: process.env.FRONTEND_URL || &#39;http://localhost:5173&#39;,
     credentials: true
   }));
   ```

3. **Procfile** (optional, Render auto-detects):
   Create `backend/Procfile`:
   ```
   web: node server.js
   ```

4. **Commit &amp; Push**:
   ```
   git add .gitignore Procfile  # Ensure .env is ignored
   git commit -m "Prepare for Render deploy"
   git push
   ```

## Step 3: Deploy on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New** → **Web Service**.
3. Connect your GitHub repo → select the **backend repo/branch** (e.g., `main`).
4. Configure:
   | Field | Value |
   |-------|-------|
   | Name | `cityportal-backend` |
   | Environment | `Node` |
   | Region | Closest to you |
   | Branch | `main` |
   | Build Command | `npm install` (default) |
   | Start Command | `npm start` (default) |

5. **Environment Variables** (critical!):
   Click **Advanced** → **Environment**:
   - `MONGO_URI` ← From Atlas
   - `CLOUD_NAME` ← From Cloudinary
   - `CLOUD_API_KEY`
   - `CLOUD_API_SECRET`
   - `JWT_SECRET`
   - `EMAIL_USER` (if used)
   - `EMAIL_PASS`
   - `GOOGLE_CLIENT_ID` (if used)
   - `FRONTEND_URL` ← Your frontend URL (e.g., `https://cityportal-frontend.onrender.com`)

6. Click **Create Web Service**.

## Step 4: Verify Deployment

1. Render builds → deploys (logs show `npm install`, `MongoDB Connected`, `Server running on port 10000`).
2. Get your **API URL**: `https://cityportal-backend.onrender.com`
3. Test:
   ```
   curl https://your-backend.onrender.com/
   ```
   Expected: `"City Portal API Running"`

4. **Logs**: Check Render dashboard → Logs for errors (e.g., DB connection).

## Step 5: Post-Deployment

### Auto-Deploys
- Push to GitHub → Render auto-builds/deploys.

### Custom Domain (Optional)
1. Render Dashboard → Settings → Custom Domains → Add domain.
2. Update DNS (CNAME to `cname.render.com`).

### Scaling &amp; Free Tier Limits
- Free tier: 750 hours/month, sleeps after 15min inactivity (wakes on request).
- Upgrade to Starter ($7/mo) for always-on.

### Update Frontend
In frontend `api.js`, update base URL:
```js
const API_BASE_URL = import.meta.env.VITE_API_URL || &#39;https://your-backend.onrender.com/api&#39;;
```

### Troubleshooting
| Issue | Fix |
|-------|-----|
| `Cannot connect to MongoDB` | Check `MONGO_URI` (IP whitelist in Atlas). |
| `Cloudinary config error` | Verify env vars (no quotes). |
| Build fails | Check `package.json` deps. |
| 500 on upload | Cloudinary creds wrong. |
| CORS error | Set `FRONTEND_URL` in env vars. |
| App sleeps | Normal on free tier; upgrade or ping. |

## Security Best Practices
- **Never commit `.env`** (use `.env.example`).
- Rotate secrets regularly.
- MongoDB: Restrict network to Render&#39;s IP (find in Atlas Network Access).
- Use Render&#39;s **Private Networking** for services.

Your backend is now live! Repeat for frontend. Questions? Check Render docs: https://render.com/docs/deploy-node-express-app.

```
To test locally: cd backend &amp;&amp; npm run dev
API Endpoints: /api/auth/register, /api/hotels, etc.
