# ⚡ Quick Setup Checklist

## 🎯 Backend Deployment (Railway)

### Step 1: Railway Setup
- [ ] Go to [railway.app](https://railway.app) and login with GitHub
- [ ] Create new project from GitHub repo: `ranyafazai/healthconnect`
- [ ] Set root directory to: `Backend`
- [ ] Add PostgreSQL database in Railway

### Step 2: Environment Variables (Add these in Railway)
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
DATABASE_URL=[Copy from Railway PostgreSQL service]
FRONTEND_URL=https://ranyafazai.github.io/healthconnect
FRONTEND_URLS=https://ranyafazai.github.io/healthconnect
```

### Step 3: Get Backend URL
- [ ] Copy your Railway backend URL (e.g., `https://your-app-name.railway.app`)

---

## 🎯 Frontend Deployment (GitHub Pages)

### Step 1: Enable GitHub Pages
- [ ] Go to [ranyafazai/healthconnect](https://github.com/ranyafazai/healthconnect)
- [ ] Settings → Pages → Source: "GitHub Actions"

### Step 2: Add GitHub Secrets
Go to Settings → Secrets and variables → Actions → New repository secret:

- [ ] **VITE_API_URL**: `https://your-backend-url.railway.app/api`
- [ ] **VITE_SOCKET_URL**: `https://your-backend-url.railway.app`
- [ ] **VITE_BASE_URL**: `https://your-backend-url.railway.app`

### Step 3: Trigger Deployment
- [ ] Make a small commit to trigger GitHub Actions
- [ ] Wait for deployment to complete

---

## 🎯 Test Your App

- [ ] Visit: [https://ranyafazai.github.io/healthconnect/](https://ranyafazai.github.io/healthconnect/)
- [ ] Try registering a new account
- [ ] Test login functionality
- [ ] Navigate through the app

---

## 🆘 Quick Fixes

**If frontend shows errors:**
- Check GitHub Actions workflow status
- Verify all secrets are set correctly

**If backend shows errors:**
- Check Railway deployment logs
- Verify DATABASE_URL is correct

**If app doesn't connect:**
- Check CORS settings in Railway
- Verify FRONTEND_URLS includes your GitHub Pages URL

---

## 🎉 You're Done!

Your HealthyConnect app should now be live at:
**https://ranyafazai.github.io/healthconnect/**

🏥✨ **Congratulations! Your telehealth platform is deployed!**
