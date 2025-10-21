# 🚀 Complete Deployment Guide for HealthyConnect

This guide will help you deploy your HealthyConnect app step by step. We'll use **Railway** for the backend (easiest option) and **GitHub Pages** for the frontend.

## 📋 Prerequisites

- GitHub account (you already have this)
- Railway account (we'll create this)
- Your code is already in your repository: [ranyafazai/healthconnect](https://github.com/ranyafazai/healthconnect)

---

## 🎯 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub account

### 1.2 Create New Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your repository: **`ranyafazai/healthconnect`**
4. Click **"Deploy Now"**

### 1.3 Configure Backend Service
1. Railway will detect your project structure
2. Click on the service that was created
3. Go to **"Settings"** tab
4. Set **"Root Directory"** to: `Backend`
5. Set **"Build Command"** to: `npm install && npm run build`
6. Set **"Start Command"** to: `npm start`

### 1.4 Add Environment Variables
1. In your Railway service, go to **"Variables"** tab
2. Add these variables (click **"New Variable"** for each):

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
DATABASE_URL=your-database-url-here
FRONTEND_URL=https://ranyafazai.github.io/healthconnect
FRONTEND_URLS=https://ranyafazai.github.io/healthconnect
```

**For DATABASE_URL:**
- Railway provides a free PostgreSQL database
- Go to **"Data"** tab → **"New"** → **"Database"** → **"Add PostgreSQL"**
- Copy the DATABASE_URL from the database service

### 1.5 Deploy Backend
1. Railway will automatically deploy when you save settings
2. Wait for deployment to complete (green checkmark)
3. Click on your service → **"Settings"** → **"Domains"**
4. Copy your backend URL (e.g., `https://your-app-name.railway.app`)

---

## 🎯 Step 2: Deploy Frontend to GitHub Pages

### 2.1 Enable GitHub Pages
1. Go to your repository: [ranyafazai/healthconnect](https://github.com/ranyafazai/healthconnect)
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section
4. Under **"Source"**, select **"GitHub Actions"**
5. Save the settings

### 2.2 Add Environment Variables to GitHub
1. In your repository, go to **"Settings"** → **"Secrets and variables"** → **"Actions"**
2. Click **"New repository secret"** and add these:

**Secret 1:**
- Name: `VITE_API_URL`
- Value: `https://your-backend-url.railway.app/api` (replace with your actual Railway URL)

**Secret 2:**
- Name: `VITE_SOCKET_URL`
- Value: `https://your-backend-url.railway.app` (replace with your actual Railway URL)

**Secret 3:**
- Name: `VITE_BASE_URL`
- Value: `https://your-backend-url.railway.app` (replace with your actual Railway URL)

### 2.3 Trigger Frontend Deployment
1. Go to your repository's **"Actions"** tab
2. You should see a workflow called **"Deploy to GitHub Pages"**
3. If it's not running, make a small change to trigger it:
   - Edit any file (like README.md)
   - Commit and push the change

---

## 🎯 Step 3: Set Up Database

### 3.1 Run Database Migrations
1. In Railway, go to your backend service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Go to **"Logs"** tab
5. You should see Prisma migrations running automatically

### 3.2 Seed Database (Optional)
If you want sample data:
1. In Railway, go to your backend service
2. Click **"Settings"** → **"Variables"**
3. Add: `SEED_DATABASE=true`
4. Redeploy the service

---

## 🎯 Step 4: Test Your Deployment

### 4.1 Test Backend
1. Visit your Railway backend URL: `https://your-app-name.railway.app/api`
2. You should see API documentation or a health check response

### 4.2 Test Frontend
1. Visit: [https://ranyafazai.github.io/healthconnect/](https://ranyafazai.github.io/healthconnect/)
2. Your HealthyConnect app should load directly
3. Try registering a new account to test the connection

---

## 🎯 Step 5: Final Configuration

### 5.1 Update CORS Settings
1. In Railway, go to your backend service
2. **"Variables"** tab
3. Make sure `FRONTEND_URLS` includes your GitHub Pages URL:
   ```
   FRONTEND_URLS=https://ranyafazai.github.io/healthconnect
   ```

### 5.2 Test Full Functionality
1. **Register** a new account (Patient or Doctor)
2. **Login** with your credentials
3. **Navigate** through the app features
4. **Test messaging** and other features

---

## 🆘 Troubleshooting

### Backend Issues
- **Deployment fails**: Check Railway logs in the "Deployments" tab
- **Database connection error**: Verify DATABASE_URL is correct
- **CORS errors**: Check FRONTEND_URLS variable

### Frontend Issues
- **App doesn't load**: Check GitHub Actions workflow status
- **API connection fails**: Verify VITE_API_URL secret is correct
- **Build fails**: Check the Actions logs for errors

### Common Solutions
1. **Clear browser cache** and try again
2. **Check all environment variables** are set correctly
3. **Wait 2-3 minutes** after deployment for changes to take effect
4. **Check Railway and GitHub logs** for specific error messages

---

## 🎉 Success!

Once everything is working:
- **Frontend**: [https://ranyafazai.github.io/healthconnect/](https://ranyafazai.github.io/healthconnect/)
- **Backend API**: `https://your-app-name.railway.app/api`
- **Your app is live and fully functional!**

---

## 📞 Need Help?

If you encounter any issues:
1. Check the logs in Railway (backend) and GitHub Actions (frontend)
2. Verify all environment variables are set correctly
3. Make sure both services are deployed successfully
4. Test each component separately (backend API, then frontend)

**Your HealthyConnect telehealth platform is now live! 🏥✨**
