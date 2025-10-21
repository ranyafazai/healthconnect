# 🔧 Environment Variables Setup

## For Railway Backend

Copy and paste these into Railway → Your Service → Variables:

```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=healthyconnect-super-secret-jwt-key-2024
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://ranyafazai.github.io/healthconnect
FRONTEND_URLS=https://ranyafazai.github.io/healthconnect
```

**Important:** Replace `DATABASE_URL` with the one from your Railway PostgreSQL service.

## For GitHub Frontend Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret:

### Secret 1:
- **Name:** `VITE_API_URL`
- **Value:** `https://YOUR-RAILWAY-APP-NAME.railway.app/api`

### Secret 2:
- **Name:** `VITE_SOCKET_URL`
- **Value:** `https://YOUR-RAILWAY-APP-NAME.railway.app`

### Secret 3:
- **Name:** `VITE_BASE_URL`
- **Value:** `https://YOUR-RAILWAY-APP-NAME.railway.app`

**Replace `YOUR-RAILWAY-APP-NAME` with your actual Railway app name!**

## Example with Real URLs

If your Railway app is named `healthyconnect-backend-abc123`, then:

```bash
VITE_API_URL=https://healthyconnect-backend-abc123.railway.app/api
VITE_SOCKET_URL=https://healthyconnect-backend-abc123.railway.app
VITE_BASE_URL=https://healthyconnect-backend-abc123.railway.app
```

## How to Find Your Railway App Name

1. Go to Railway dashboard
2. Click on your deployed service
3. Go to Settings → Domains
4. Copy the domain (e.g., `healthyconnect-backend-abc123.railway.app`)
5. Use this in your GitHub secrets
