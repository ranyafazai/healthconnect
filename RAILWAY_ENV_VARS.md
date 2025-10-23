# 🔧 Complete Environment Variables for Railway

## Copy and Paste These Variables into Railway

### 1. DATABASE_URL
**Variable Name:** `DATABASE_URL`
**Value:** `mysql://root:NewHealthPass123@mysql:3306/healthyconnect`

### 2. JWT_SECRET
**Variable Name:** `JWT_SECRET`
**Value:** `healthyconnect-super-secret-jwt-key-2024`

### 3. NODE_ENV
**Variable Name:** `NODE_ENV`
**Value:** `production`

### 4. PORT
**Variable Name:** `PORT`
**Value:** `5000`

### 5. JWT_EXPIRES_IN
**Variable Name:** `JWT_EXPIRES_IN`
**Value:** `24h`

### 6. FRONTEND_URL
**Variable Name:** `FRONTEND_URL`
**Value:** `https://ranyafazai.github.io/healthconnect`

### 7. FRONTEND_URLS
**Variable Name:** `FRONTEND_URLS`
**Value:** `https://ranyafazai.github.io/healthconnect`

---

## 🚀 How to Add Each Variable in Railway:

1. **Go to your Railway service**
2. **Click "Variables" tab**
3. **For each variable above:**
   - Type the **Variable Name** in the first field
   - Type the **Value** in the second field
   - Click the purple **"Add"** button

## ✅ After Adding All Variables:

You should have 7 variables total in your Railway Variables tab:
- DATABASE_URL
- JWT_SECRET
- NODE_ENV
- PORT
- JWT_EXPIRES_IN
- FRONTEND_URL
- FRONTEND_URLS

## 🎯 Important Notes:

- **DATABASE_URL**: Make sure the port is `3306` (not `306`)
- **All variables**: Copy exactly as shown above
- **No extra spaces**: Don't add extra spaces before or after values
- **Case sensitive**: Variable names are case sensitive

Once you add all these variables, Railway will automatically redeploy your service! 🚀
