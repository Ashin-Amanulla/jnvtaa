# JNVTAA Deployment Guide

Complete guide for deploying the JNVTAA alumni website to production.

## Prerequisites

- Node.js v16+ installed
- MongoDB Atlas account (for production database)
- Domain name (optional but recommended)
- Hosting accounts (see options below)

## Production Environment Setup

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create a Cluster**
   - Choose AWS/GCP/Azure
   - Select region closest to your users (Asia for India)
   - Create cluster (takes 3-5 minutes)

3. **Configure Database Access**
   - Database Access → Add Database User
   - Create username and strong password
   - Save credentials securely

4. **Configure Network Access**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0` (for development)
   - Or add specific IPs for security

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jnvtaa`

### 2. Backend Deployment Options

#### Option A: Railway.app (Recommended - Easy & Free Tier)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project (in backend folder)
cd backend
railway init

# 4. Add environment variables via Railway dashboard
#    - All variables from .env
#    - Update MONGODB_URI to Atlas connection string
#    - Set NODE_ENV=production

# 5. Deploy
railway up

# 6. Get deployment URL from Railway dashboard
```

#### Option B: Heroku

```bash
# 1. Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app (in backend folder)
cd backend
heroku create jnvtaa-api

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-atlas-connection-string
heroku config:set JWT_SECRET=your-production-secret
heroku config:set JWT_REFRESH_SECRET=your-production-refresh-secret
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com

# 5. Deploy
git push heroku main

# 6. Seed database (optional)
heroku run npm run seed
```

#### Option C: DigitalOcean/AWS/GCP (Advanced)

1. Create a Droplet/EC2/Compute Engine instance
2. SSH into server
3. Install Node.js and MongoDB
4. Clone repository
5. Install dependencies
6. Set up PM2 for process management
7. Configure Nginx as reverse proxy
8. Set up SSL with Let's Encrypt

```bash
# On server
cd backend
npm install
npm install -g pm2

# Start with PM2
pm2 start app.js --name jnvtaa-api
pm2 startup
pm2 save

# Nginx configuration
sudo nano /etc/nginx/sites-available/jnvtaa

# Add:
# server {
#   listen 80;
#   server_name api.jnvtaa.org;
#   
#   location / {
#     proxy_pass http://localhost:5000;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
#   }
# }

# Enable site
sudo ln -s /etc/nginx/sites-available/jnvtaa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d api.jnvtaa.org
```

### 3. Frontend Deployment Options

#### Option A: Vercel (Recommended - Best for React)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (in frontend folder)
cd frontend
vercel

# 3. Follow prompts
#    - Set build command: npm run build
#    - Set output directory: dist
#    - Add environment variable: VITE_API_URL=https://your-backend-url.com/api

# 4. Production deployment
vercel --prod
```

#### Option B: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
cd frontend
npm run build

# 3. Deploy
netlify deploy --dir=dist --prod

# 4. Set environment variables in Netlify dashboard
#    - VITE_API_URL=https://your-backend-url.com/api
```

#### Option C: Cloudflare Pages

1. Push code to GitHub
2. Go to Cloudflare Pages dashboard
3. Connect GitHub repository
4. Configure build:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
5. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
6. Deploy

### 4. Environment Variables

#### Backend Production Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jnvtaa

# JWT (Use strong secrets!)
JWT_SECRET=your-super-secure-production-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Your frontend URL)
CORS_ORIGIN=https://jnvtaa.vercel.app
FRONTEND_URL=https://jnvtaa.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Optional - for future email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@jnvtaa.org

# File Upload (Optional - Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend Production Variables

```env
VITE_API_URL=https://your-backend-url.com/api
```

### 5. Post-Deployment Tasks

#### A. Seed Production Database

```bash
# Option 1: Via Railway/Heroku CLI
railway run npm run seed  # Railway
heroku run npm run seed   # Heroku

# Option 2: Temporarily allow DB access from your IP
# Run seed script locally but pointing to production DB
```

#### B. Update CORS Settings

Ensure backend `.env` has correct frontend URL:
```env
CORS_ORIGIN=https://your-actual-frontend-domain.com
```

#### C. Test All Endpoints

```bash
# Test health check
curl https://your-backend-url.com/health

# Test API
curl https://your-backend-url.com/api/batches
```

#### D. Set up Custom Domain (Optional)

**For Backend:**
- Railway: Add custom domain in dashboard
- Heroku: `heroku domains:add api.jnvtaa.org`
- Configure DNS A/CNAME records

**For Frontend:**
- Vercel: Add custom domain in dashboard
- Netlify: Add custom domain in dashboard
- Add DNS records as instructed

### 6. Monitoring & Maintenance

#### Setup Monitoring

**Backend:**
```bash
# PM2 monitoring (if using own server)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs jnvtaa-api
```

**Uptime Monitoring:**
- Use UptimeRobot (free) - https://uptimerobot.com
- Monitor both frontend and backend
- Set up email alerts

#### Database Backups

**MongoDB Atlas:**
- Automated backups are included
- Configure backup schedule in Atlas dashboard
- Test restore procedure

#### Performance Monitoring

- Google Analytics for frontend
- LogRocket or Sentry for error tracking
- New Relic or DataDog for backend monitoring

### 7. Security Checklist

- [ ] Use strong JWT secrets (min 32 characters, random)
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS properly
- [ ] Set rate limiting appropriately
- [ ] Use environment variables (never commit secrets)
- [ ] Enable MongoDB IP whitelist
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### 8. Performance Optimization

**Backend:**
- [ ] Enable compression
- [ ] Use Redis for caching (optional)
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Use CDN for static assets

**Frontend:**
- [ ] Enable code splitting (already configured)
- [ ] Lazy load routes and images
- [ ] Optimize images (compress, webp)
- [ ] Use CDN for assets
- [ ] Enable service worker (PWA)
- [ ] Minify and bundle (Vite does this)

### 9. CI/CD Setup (Optional but Recommended)

**Using GitHub Actions:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd backend && npm install
      - run: cd backend && npm test
      # Add deployment steps for your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Deploy to Vercel/Netlify
```

### 10. Post-Launch Checklist

- [ ] Test all pages on production
- [ ] Test authentication flow
- [ ] Test RSVP functionality
- [ ] Test donations (with test mode)
- [ ] Verify email sending (if configured)
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Check SEO metadata
- [ ] Test payment gateway (if integrated)
- [ ] Monitor error logs for first 24 hours
- [ ] Set up Google Analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Announce launch to alumni community!

## Quick Deployment (Vercel + Railway)

This is the fastest way to get your site live:

### Step 1: Deploy Backend to Railway

```bash
cd backend
npm install -g @railway/cli
railway login
railway init
# Set environment variables in Railway dashboard
railway up
```

### Step 2: Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel
# Add VITE_API_URL in Vercel dashboard
vercel --prod
```

Done! Your site is live.

## Troubleshooting

### "CORS Error"
- Check CORS_ORIGIN in backend matches frontend URL exactly
- Include protocol (https://)
- No trailing slash

### "Database Connection Failed"
- Verify MongoDB Atlas connection string
- Check IP whitelist in Atlas
- Ensure username/password are correct
- Test connection locally first

### "Build Failed"
- Check Node.js version (v16+)
- Clear node_modules and reinstall
- Check for syntax errors
- Verify all dependencies are in package.json

### "Images Not Loading"
- Check image URLs are accessible
- Implement Cloudinary for production
- Verify CORS for image sources

## Scaling Considerations

### When to Scale

- **Backend**: > 1000 concurrent users
  - Add load balancer
  - Use Redis for sessions
  - Consider microservices

- **Database**: > 100,000 records
  - Add read replicas
  - Implement sharding
  - Optimize indexes

- **Frontend**: > 10,000 daily users
  - Use CDN (Cloudflare, CloudFront)
  - Implement caching strategies
  - Consider edge computing

## Cost Estimates

**Free Tier (Good for starting out):**
- MongoDB Atlas: Free (512MB)
- Railway: Free tier with limitations
- Vercel: Free for personal projects
- **Total: $0/month**

**Production (Recommended):**
- MongoDB Atlas: $9/month (Shared)
- Railway/Heroku: $7-25/month
- Vercel Pro: $20/month
- Domain: $12/year
- **Total: ~$30-50/month**

**Enterprise (High Traffic):**
- MongoDB Atlas: $57+/month
- DigitalOcean Droplet: $48/month
- Cloudflare Pro: $20/month
- CloudFront CDN: $varies
- **Total: $125+/month**

## Support

For deployment issues:
- Check documentation: README.md, QUICKSTART.md
- Review platform-specific docs
- Contact JNVTAA tech team
- Open GitHub issue

---

**Good luck with your deployment! 🚀**

