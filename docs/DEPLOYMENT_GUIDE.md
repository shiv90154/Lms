# Deployment Guide - Premium LMS System

This guide provides comprehensive instructions for deploying the Premium LMS + Coaching Management System to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.x or higher
- MongoDB 6.0 or higher (or MongoDB Atlas account)
- Razorpay account (for payment processing)
- Email service credentials (Gmail, SendGrid, etc.)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd premium-lms-system
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your production values:

#### Required Variables

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/premium-lms?retryWrites=true&w=majority

# JWT Secrets (Generate strong random strings)
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# Application URL
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Razorpay
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-razorpay-key-id>
```

#### Optional Variables

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-specific-password>
EMAIL_FROM=noreply@yourdomain.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### 3. Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# For JWT_SECRET and JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Configuration

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Configure network access (add your server IP or use 0.0.0.0/0 for all IPs)
4. Create a database user with read/write permissions
5. Get your connection string and update `MONGODB_URI`

### Option 2: Self-Hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication and security
3. Create database and user:

```bash
mongosh
use premium-lms
db.createUser({
  user: "lmsuser",
  pwd: "secure-password",
  roles: [{ role: "readWrite", db: "premium-lms" }]
})
```

4. Update `MONGODB_URI` with your connection string

### Database Indexes

After deployment, create indexes for optimal performance:

```javascript
// Run this in MongoDB shell or through a migration script
db.users.createIndex({ email: 1 }, { unique: true })
db.courses.createIndex({ isActive: 1, category: 1 })
db.books.createIndex({ category: 1, isActive: 1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.testAttempts.createIndex({ userId: 1, testId: 1 })
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to your project settings on Vercel dashboard
   - Add all environment variables from `.env.local`
   - Redeploy if needed

#### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["bom1"],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret",
    "JWT_REFRESH_SECRET": "@jwt-refresh-secret"
  }
}
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm install -g pnpm && pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure-password
      - MONGO_INITDB_DATABASE=premium-lms
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Option 3: Traditional VPS (Ubuntu/Debian)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2
```

#### 2. Clone and Setup Application

```bash
cd /var/www
git clone <repository-url> premium-lms
cd premium-lms
pnpm install
pnpm run build
```

#### 3. Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'premium-lms',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/premium-lms`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/premium-lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Post-Deployment Steps

### 1. Run Health Check

```bash
node scripts/health-check.js
```

### 2. Seed Initial Data (Optional)

```bash
pnpm run seed
```

### 3. Create Admin User

Access your application and register the first user, then manually update their role in the database:

```javascript
db.users.updateOne(
  { email: "admin@yourdomain.com" },
  { $set: { role: "admin" } }
)
```

### 4. Configure Razorpay Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Save webhook secret in environment variables

### 5. Test Critical Flows

- User registration and login
- Course enrollment
- Book purchase and payment
- Mock test taking
- Admin operations

## Monitoring and Maintenance

### Application Monitoring

#### Using PM2 (VPS Deployment)

```bash
# View logs
pm2 logs premium-lms

# Monitor resources
pm2 monit

# Restart application
pm2 restart premium-lms

# View status
pm2 status
```

#### Using Vercel (Vercel Deployment)

- Monitor through Vercel Dashboard
- View real-time logs
- Check analytics and performance metrics

### Database Monitoring

#### MongoDB Atlas

- Use built-in monitoring dashboard
- Set up alerts for high CPU/memory usage
- Monitor slow queries

#### Self-Hosted MongoDB

```bash
# Check database status
mongosh --eval "db.serverStatus()"

# Monitor operations
mongosh --eval "db.currentOp()"

# Check database size
mongosh --eval "db.stats()"
```

### Backup Strategy

#### Automated Backups (MongoDB Atlas)

- Enable automatic backups in Atlas dashboard
- Configure backup retention policy
- Test restore procedures regularly

#### Manual Backups (Self-Hosted)

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/premium-lms" --out=/backups/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/premium-lms" /backups/20240115
```

### Performance Optimization

1. **Enable Caching**
   - Configure Redis for session storage
   - Enable ISR (Incremental Static Regeneration)
   - Use CDN for static assets

2. **Database Optimization**
   - Create appropriate indexes
   - Monitor slow queries
   - Implement connection pooling

3. **Image Optimization**
   - Use Next.js Image component
   - Configure Cloudinary for automatic optimization
   - Implement lazy loading

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem:** Cannot connect to MongoDB

**Solutions:**
- Check `MONGODB_URI` is correct
- Verify network access in MongoDB Atlas
- Check firewall rules
- Ensure database user has correct permissions

#### 2. Payment Integration Issues

**Problem:** Razorpay payments failing

**Solutions:**
- Verify Razorpay API keys are correct
- Check webhook configuration
- Review Razorpay dashboard for errors
- Ensure HTTPS is enabled for webhooks

#### 3. Authentication Errors

**Problem:** JWT token validation failing

**Solutions:**
- Verify `JWT_SECRET` is set correctly
- Check token expiration settings
- Clear browser cookies and try again
- Verify middleware is properly configured

#### 4. Build Errors

**Problem:** Next.js build failing

**Solutions:**
```bash
# Clear cache and rebuild
rm -rf .next
pnpm run build

# Check for TypeScript errors
pnpm run lint

# Verify all dependencies are installed
pnpm install
```

#### 5. Performance Issues

**Problem:** Slow page loads

**Solutions:**
- Enable ISR for static pages
- Implement database indexes
- Use CDN for static assets
- Enable compression in Nginx
- Monitor database query performance

### Getting Help

If you encounter issues not covered in this guide:

1. Check application logs
2. Review error messages carefully
3. Search existing issues in repository
4. Contact support team

## Security Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] JWT secrets are strong and unique
- [ ] HTTPS is enabled
- [ ] Database authentication is configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] File upload validation is in place
- [ ] Input sanitization is implemented
- [ ] Error messages don't expose sensitive information
- [ ] Backup strategy is in place
- [ ] Monitoring is configured

## Maintenance Schedule

### Daily
- Monitor application logs
- Check error rates
- Review payment transactions

### Weekly
- Review database performance
- Check disk space usage
- Update dependencies (if needed)

### Monthly
- Review security updates
- Analyze user feedback
- Optimize database queries
- Review backup integrity

## Conclusion

Following this deployment guide will help you successfully deploy the Premium LMS System to production. Remember to:

- Test thoroughly before going live
- Monitor application performance
- Keep dependencies updated
- Maintain regular backups
- Document any custom configurations

For additional support or questions, refer to the project documentation or contact the development team.
