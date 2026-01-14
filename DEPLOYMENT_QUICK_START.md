# Deployment Quick Start Guide

This is a quick reference for deploying the Premium LMS System. For detailed instructions, see `docs/DEPLOYMENT_GUIDE.md`.

## Prerequisites

- Node.js 18+
- MongoDB database
- Razorpay account
- Domain name (optional)

## Quick Deployment Steps

### 1. Environment Setup (5 minutes)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and set these REQUIRED variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=generate_with_command_below
# JWT_REFRESH_SECRET=generate_with_command_below
# NEXT_PUBLIC_API_URL=https://yourdomain.com
# RAZORPAY_KEY_ID=your_razorpay_key
# RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Install & Build (2 minutes)

```bash
pnpm install
pnpm run build
```

### 3. Pre-Deployment Check (1 minute)

```bash
pnpm run pre-deploy
```

Fix any critical issues before proceeding.

### 4. Deploy

#### Option A: Vercel (Easiest - 5 minutes)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login and deploy
vercel login
pnpm run deploy:vercel
```

Then add environment variables in Vercel dashboard.

#### Option B: Docker (10 minutes)

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### Option C: VPS (20 minutes)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

Then configure Nginx using `nginx.conf.example`.

### 5. Verify Deployment (2 minutes)

```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Should return: {"status":"healthy",...}
```

Test these flows:
- [ ] User registration
- [ ] User login
- [ ] Course enrollment
- [ ] Book purchase
- [ ] Payment processing

## Common Issues

### Build Fails
```bash
rm -rf .next node_modules
pnpm install
pnpm run build
```

### Database Connection Error
- Check `MONGODB_URI` is correct
- Verify network access in MongoDB Atlas
- Test connection: `mongosh "your_connection_string"`

### Payment Not Working
- Verify Razorpay keys are correct
- Check webhook URL is configured
- Ensure HTTPS is enabled

## Important Commands

```bash
# Health check
pnpm run health-check

# Pre-deployment validation
pnpm run pre-deploy

# Build for production
pnpm run build

# Start production server
pnpm start

# Run tests
pnpm run test:ci

# View PM2 logs (VPS)
pm2 logs premium-lms

# Restart application (VPS)
pm2 restart premium-lms
```

## Security Checklist

Before going live:
- [ ] Strong JWT secrets set
- [ ] HTTPS enabled
- [ ] Database authentication configured
- [ ] `.env.local` in `.gitignore`
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Support

- **Detailed Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Checklist**: `docs/PRODUCTION_CHECKLIST.md`
- **Architecture**: `docs/SYSTEM_ARCHITECTURE.md`
- **Health Check**: `pnpm run health-check`

## Deployment Time Estimates

- **Vercel**: ~15 minutes (easiest)
- **Docker**: ~20 minutes (flexible)
- **VPS**: ~30 minutes (full control)

---

**Need Help?** Check `docs/DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
