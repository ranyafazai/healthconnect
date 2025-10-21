# 🚀 Deployment Setup Guide

## Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/YourTeam-dev/HealthyConnect
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the settings

## Step 2: Update the Redirect URL

1. Edit `index.html` in the root directory
2. Replace `https://your-app-url.com` with your actual deployed app URL
3. Update the GitHub Pages URL in the meta tags

## Step 3: Deploy Your Backend

Choose one of these options:

### Option A: Railway (Easiest)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your HealthyConnect repository
5. Set the root directory to `Backend`
6. Add environment variables from your `.env` file
7. Deploy!

### Option B: Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Create a new "Web Service"
4. Connect your repository
5. Set:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy!

### Option C: Heroku
1. Go to [Heroku.com](https://heroku.com)
2. Create a new app
3. Connect to GitHub
4. Set buildpacks and environment variables
5. Enable automatic deploys

## Step 4: Update Frontend Configuration

1. Get your backend URL from the deployment platform
2. Update `frontend/src/config/env.ts`:
   ```typescript
   export const config = {
     API_URL: 'https://your-backend-url.com/api',
     SOCKET_URL: 'https://your-backend-url.com',
     BASE_URL: 'https://your-backend-url.com',
     // ... rest of config
   };
   ```

## Step 5: Test the Setup

1. Push your changes to the main branch
2. Wait for GitHub Actions to deploy the frontend
3. Visit: https://yourteam-dev.github.io/HealthyConnect/
4. Verify the redirect works correctly

## Step 6: Custom Domain (Optional)

If you want to use a custom domain:

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. Add the domain to GitHub Pages settings
3. Update DNS records to point to GitHub Pages
4. Update the redirect URL in `index.html`

## Troubleshooting

### GitHub Pages not working?
- Check if GitHub Actions workflow completed successfully
- Verify the Pages source is set to "GitHub Actions"
- Check the Actions tab for any errors

### Backend not connecting?
- Verify environment variables are set correctly
- Check CORS settings in backend
- Ensure database is accessible from the deployment platform

### Redirect not working?
- Check the URL in `index.html`
- Verify the deployed app is accessible
- Clear browser cache and try again

## Need Help?

- Check the GitHub Actions logs
- Review the deployment platform logs
- Test API endpoints directly
- Verify environment variables
