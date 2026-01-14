# Production Deployment Checklist

Use this checklist to ensure your Premium LMS System is ready for production deployment.

## Pre-Deployment

### Environment Configuration

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `MONGODB_URI` with production database
- [ ] Generate and set strong `JWT_SECRET` (64+ characters)
- [ ] Generate and set strong `JWT_REFRESH_SECRET` (64+ characters)
- [ ] Set `NEXT_PUBLIC_API_URL` to production domain
- [ ] Configure Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- [ ] Configure email service credentials
- [ ] Set up Cloudinary for image uploads (optional)
- [ ] Verify all environment variables with `pnpm run health-check`

### Database Setup

- [ ] Create production MongoDB database
- [ ] Configure database authentication
- [ ] Set up database user with appropriate permissions
- [ ] Enable SSL/TLS for database connections
- [ ] Create database indexes for performance
- [ ] Set up automated backups
- [ ] Test database connection
- [ ] Configure connection pooling

### Security Configuration

- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Remove any hardcoded secrets from code
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set up firewall rules
- [ ] Enable database encryption at rest

### Application Build

- [ ] Run `pnpm install` to install dependencies
- [ ] Run `pnpm run lint` to check for code issues
- [ ] Run `pnpm run test:ci` to run all tests
- [ ] Run `pnpm run build` to create production build
- [ ] Verify build completed successfully
- [ ] Check for build warnings or errors
- [ ] Test production build locally with `pnpm start`

### Payment Integration

- [ ] Verify Razorpay account is activated
- [ ] Configure Razorpay webhook URL
- [ ] Test payment flow in test mode
- [ ] Switch to live mode keys
- [ ] Test live payment (small amount)
- [ ] Verify webhook signature validation
- [ ] Set up payment failure notifications

### Email Configuration

- [ ] Configure SMTP settings
- [ ] Test email sending
- [ ] Set up email templates
- [ ] Configure email rate limiting
- [ ] Set up bounce handling
- [ ] Test password reset emails
- [ ] Test order confirmation emails

## Deployment

### Platform Setup (Choose One)

#### Vercel Deployment

- [ ] Create Vercel account
- [ ] Install Vercel CLI: `pnpm add -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy: `pnpm run deploy:vercel`
- [ ] Verify deployment URL
- [ ] Configure custom domain
- [ ] Set up SSL certificate (automatic with Vercel)

#### VPS Deployment

- [ ] Provision VPS server (Ubuntu/Debian recommended)
- [ ] Install Node.js 18+
- [ ] Install pnpm
- [ ] Install PM2 for process management
- [ ] Clone repository to server
- [ ] Install dependencies
- [ ] Build application
- [ ] Configure PM2 ecosystem
- [ ] Start application with PM2
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL with Let's Encrypt
- [ ] Configure firewall (UFW)

#### Docker Deployment

- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Build Docker image
- [ ] Test container locally
- [ ] Push image to registry
- [ ] Deploy to production
- [ ] Configure volumes for persistence
- [ ] Set up container orchestration (if needed)

### Domain Configuration

- [ ] Purchase domain name
- [ ] Configure DNS records
- [ ] Point domain to server/platform
- [ ] Set up www redirect
- [ ] Configure SSL certificate
- [ ] Test domain resolution
- [ ] Set up CDN (optional)

## Post-Deployment

### Initial Setup

- [ ] Run health check: `pnpm run health-check`
- [ ] Access application via production URL
- [ ] Create first admin user
- [ ] Update admin user role in database
- [ ] Test user registration
- [ ] Test user login
- [ ] Seed initial data (if needed)

### Functionality Testing

- [ ] Test user authentication flow
- [ ] Test course enrollment
- [ ] Test book purchase flow
- [ ] Test payment processing
- [ ] Test mock test taking
- [ ] Test certificate generation
- [ ] Test admin dashboard
- [ ] Test email notifications
- [ ] Test file uploads
- [ ] Test search functionality

### Performance Testing

- [ ] Test page load times
- [ ] Check mobile responsiveness
- [ ] Test with slow network
- [ ] Verify image optimization
- [ ] Check database query performance
- [ ] Test concurrent users
- [ ] Monitor memory usage
- [ ] Check for memory leaks

### Monitoring Setup

- [ ] Set up application monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up performance monitoring
- [ ] Configure alerts for errors
- [ ] Set up database monitoring
- [ ] Configure backup monitoring

### Security Verification

- [ ] Run security audit: `pnpm audit`
- [ ] Test authentication security
- [ ] Verify HTTPS is enforced
- [ ] Test rate limiting
- [ ] Verify CORS configuration
- [ ] Test input validation
- [ ] Check for XSS vulnerabilities
- [ ] Test CSRF protection
- [ ] Verify file upload security

### Documentation

- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document environment variables
- [ ] Create backup/restore procedures
- [ ] Document monitoring setup
- [ ] Create incident response plan
- [ ] Document scaling procedures

## Ongoing Maintenance

### Daily Tasks

- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Review payment transactions
- [ ] Monitor server resources
- [ ] Check uptime status

### Weekly Tasks

- [ ] Review database performance
- [ ] Check disk space usage
- [ ] Review security logs
- [ ] Test backup restoration
- [ ] Update dependencies (if needed)
- [ ] Review user feedback

### Monthly Tasks

- [ ] Security audit
- [ ] Performance optimization review
- [ ] Database optimization
- [ ] Review and update documentation
- [ ] Analyze usage patterns
- [ ] Plan capacity upgrades
- [ ] Review and update dependencies

### Quarterly Tasks

- [ ] Comprehensive security review
- [ ] Disaster recovery drill
- [ ] Performance benchmarking
- [ ] Infrastructure review
- [ ] Cost optimization review
- [ ] User satisfaction survey

## Emergency Procedures

### Application Down

1. Check server status
2. Review application logs
3. Check database connectivity
4. Verify DNS resolution
5. Check SSL certificate
6. Restart application if needed
7. Notify users if extended downtime

### Database Issues

1. Check database connectivity
2. Review database logs
3. Check disk space
4. Verify backup integrity
5. Contact database support if needed
6. Restore from backup if necessary

### Payment Issues

1. Check Razorpay dashboard
2. Review payment logs
3. Verify webhook configuration
4. Check API key validity
5. Contact Razorpay support
6. Notify affected users

### Security Incident

1. Identify the issue
2. Isolate affected systems
3. Review security logs
4. Change compromised credentials
5. Patch vulnerabilities
6. Notify affected users
7. Document incident
8. Implement preventive measures

## Rollback Procedure

If deployment fails or critical issues are found:

1. Stop the application
2. Revert to previous version
3. Restore database backup (if needed)
4. Verify rollback successful
5. Investigate root cause
6. Fix issues
7. Test thoroughly
8. Redeploy

## Success Criteria

Deployment is considered successful when:

- [ ] Application is accessible via production URL
- [ ] All critical features are working
- [ ] No critical errors in logs
- [ ] Performance meets requirements
- [ ] Security checks pass
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] Team is trained on operations

## Sign-Off

- [ ] Development team approval
- [ ] QA team approval
- [ ] Security team approval
- [ ] Operations team approval
- [ ] Product owner approval

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Version:** _______________

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
