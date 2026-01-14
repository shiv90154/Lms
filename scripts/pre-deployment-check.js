/**
 * Pre-Deployment Check Script
 * Validates system is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

/**
 * Check production environment variables
 */
function checkProductionEnv() {
    log('\n🔐 Checking Production Environment...', 'cyan');

    const requiredEnvVars = {
        'MONGODB_URI': 'Database connection string',
        'JWT_SECRET': 'JWT secret key',
        'JWT_REFRESH_SECRET': 'JWT refresh secret key',
        'NEXT_PUBLIC_API_URL': 'Public API URL',
        'NODE_ENV': 'Node environment'
    };

    const productionEnvVars = {
        'RAZORPAY_KEY_ID': 'Razorpay key ID',
        'RAZORPAY_KEY_SECRET': 'Razorpay secret key',
        'EMAIL_HOST': 'Email server host',
        'EMAIL_USER': 'Email username',
        'EMAIL_PASSWORD': 'Email password'
    };

    // Check required variables
    Object.entries(requiredEnvVars).forEach(([key, description]) => {
        if (process.env[key]) {
            checks.passed.push(`${key} is configured`);
            log(`✓ ${key} is configured`, 'green');
        } else {
            checks.failed.push(`${key} is missing (${description})`);
            log(`✗ ${key} is missing (${description})`, 'red');
        }
    });

    // Check production variables
    Object.entries(productionEnvVars).forEach(([key, description]) => {
        if (process.env[key]) {
            checks.passed.push(`${key} is configured`);
            log(`✓ ${key} is configured`, 'green');
        } else {
            checks.warnings.push(`${key} is not configured (${description})`);
            log(`⚠ ${key} is not configured (${description})`, 'yellow');
        }
    });

    // Check NODE_ENV is production
    if (process.env.NODE_ENV === 'production') {
        checks.passed.push('NODE_ENV is set to production');
        log('✓ NODE_ENV is set to production', 'green');
    } else {
        checks.warnings.push('NODE_ENV is not set to production');
        log(`⚠ NODE_ENV is "${process.env.NODE_ENV}" (should be "production")`, 'yellow');
    }

    // Check for weak secrets
    const weakSecrets = ['secret', 'password', '123456', 'change-this'];
    ['JWT_SECRET', 'JWT_REFRESH_SECRET'].forEach(key => {
        if (process.env[key]) {
            const value = process.env[key].toLowerCase();
            const isWeak = weakSecrets.some(weak => value.includes(weak));
            if (isWeak) {
                checks.failed.push(`${key} appears to be weak or default`);
                log(`✗ ${key} appears to be weak or default`, 'red');
            } else if (process.env[key].length < 32) {
                checks.warnings.push(`${key} is shorter than recommended (32+ characters)`);
                log(`⚠ ${key} is shorter than recommended (32+ characters)`, 'yellow');
            }
        }
    });
}

/**
 * Check build output
 */
function checkBuildOutput() {
    log('\n🏗️  Checking Build Output...', 'cyan');

    const nextDir = path.join(process.cwd(), '.next');

    if (fs.existsSync(nextDir)) {
        checks.passed.push('.next directory exists');
        log('✓ .next directory exists', 'green');

        // Check for standalone output
        const standaloneDir = path.join(nextDir, 'standalone');
        if (fs.existsSync(standaloneDir)) {
            checks.passed.push('Standalone build exists');
            log('✓ Standalone build exists', 'green');
        } else {
            checks.warnings.push('Standalone build not found (may not be needed)');
            log('⚠ Standalone build not found', 'yellow');
        }

        // Check for static files
        const staticDir = path.join(nextDir, 'static');
        if (fs.existsSync(staticDir)) {
            checks.passed.push('Static files generated');
            log('✓ Static files generated', 'green');
        } else {
            checks.failed.push('Static files not found');
            log('✗ Static files not found', 'red');
        }
    } else {
        checks.failed.push('.next directory not found - run build first');
        log('✗ .next directory not found - run "pnpm run build" first', 'red');
    }
}

/**
 * Check security configurations
 */
function checkSecurity() {
    log('\n🔒 Checking Security Configurations...', 'cyan');

    // Check for .env.local in .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        if (gitignore.includes('.env.local') || gitignore.includes('.env*.local')) {
            checks.passed.push('.env.local is in .gitignore');
            log('✓ .env.local is in .gitignore', 'green');
        } else {
            checks.failed.push('.env.local is not in .gitignore');
            log('✗ .env.local is not in .gitignore', 'red');
        }
    }

    // Check for sensitive files
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    sensitiveFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            checks.warnings.push(`${file} exists - ensure it's not committed to git`);
            log(`⚠ ${file} exists - ensure it's not committed to git`, 'yellow');
        }
    });

    // Check HTTPS configuration
    if (process.env.NEXT_PUBLIC_API_URL) {
        if (process.env.NEXT_PUBLIC_API_URL.startsWith('https://')) {
            checks.passed.push('API URL uses HTTPS');
            log('✓ API URL uses HTTPS', 'green');
        } else if (process.env.NEXT_PUBLIC_API_URL.startsWith('http://localhost')) {
            checks.warnings.push('API URL is localhost (development mode)');
            log('⚠ API URL is localhost (development mode)', 'yellow');
        } else {
            checks.failed.push('API URL should use HTTPS in production');
            log('✗ API URL should use HTTPS in production', 'red');
        }
    }
}

/**
 * Check database configuration
 */
function checkDatabase() {
    log('\n🗄️  Checking Database Configuration...', 'cyan');

    if (process.env.MONGODB_URI) {
        const uri = process.env.MONGODB_URI;

        // Check for MongoDB Atlas
        if (uri.includes('mongodb+srv://')) {
            checks.passed.push('Using MongoDB Atlas (recommended)');
            log('✓ Using MongoDB Atlas (recommended)', 'green');
        } else if (uri.includes('mongodb://localhost')) {
            checks.warnings.push('Using local MongoDB (not recommended for production)');
            log('⚠ Using local MongoDB (not recommended for production)', 'yellow');
        } else {
            checks.passed.push('Using remote MongoDB');
            log('✓ Using remote MongoDB', 'green');
        }

        // Check for authentication
        if (uri.includes('@')) {
            checks.passed.push('Database authentication configured');
            log('✓ Database authentication configured', 'green');
        } else {
            checks.failed.push('Database authentication not configured');
            log('✗ Database authentication not configured', 'red');
        }

        // Check for SSL/TLS
        if (uri.includes('ssl=true') || uri.includes('tls=true') || uri.includes('mongodb+srv://')) {
            checks.passed.push('Database connection uses SSL/TLS');
            log('✓ Database connection uses SSL/TLS', 'green');
        } else {
            checks.warnings.push('Database connection may not use SSL/TLS');
            log('⚠ Database connection may not use SSL/TLS', 'yellow');
        }
    }
}

/**
 * Check dependencies
 */
function checkDependencies() {
    log('\n📦 Checking Dependencies...', 'cyan');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check for security vulnerabilities (simplified check)
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        checks.passed.push('Dependencies are installed');
        log('✓ Dependencies are installed', 'green');
        log('  ℹ Run "pnpm audit" to check for security vulnerabilities', 'cyan');
    } else {
        checks.failed.push('Dependencies not installed');
        log('✗ Dependencies not installed - run "pnpm install"', 'red');
    }

    // Check for production dependencies
    const criticalDeps = ['next', 'react', 'mongoose', 'jsonwebtoken', 'bcryptjs'];
    criticalDeps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
            checks.passed.push(`${dep} is installed`);
        } else {
            checks.failed.push(`${dep} is missing`);
            log(`✗ ${dep} is missing`, 'red');
        }
    });
}

/**
 * Check performance optimizations
 */
function checkPerformance() {
    log('\n⚡ Checking Performance Optimizations...', 'cyan');

    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
    if (fs.existsSync(nextConfigPath)) {
        const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

        // Check for image optimization
        if (nextConfig.includes('images')) {
            checks.passed.push('Image optimization configured');
            log('✓ Image optimization configured', 'green');
        } else {
            checks.warnings.push('Image optimization not explicitly configured');
            log('⚠ Image optimization not explicitly configured', 'yellow');
        }

        // Check for compression
        if (nextConfig.includes('compress')) {
            checks.passed.push('Compression enabled');
            log('✓ Compression enabled', 'green');
        }
    }
}

/**
 * Print deployment checklist
 */
function printChecklist() {
    log('\n' + '='.repeat(60), 'blue');
    log('DEPLOYMENT CHECKLIST', 'blue');
    log('='.repeat(60), 'blue');

    const checklist = [
        'Environment variables are configured',
        'Database is set up and accessible',
        'Application has been built successfully',
        'Security configurations are in place',
        'Payment gateway is configured',
        'Email service is configured',
        'SSL certificate is installed',
        'Domain is configured',
        'Backup strategy is in place',
        'Monitoring is set up'
    ];

    log('\nBefore deploying, ensure:', 'cyan');
    checklist.forEach((item, index) => {
        log(`  ${index + 1}. ${item}`);
    });
}

/**
 * Print summary
 */
function printSummary() {
    log('\n' + '='.repeat(60), 'blue');
    log('PRE-DEPLOYMENT CHECK SUMMARY', 'blue');
    log('='.repeat(60), 'blue');

    log(`\n✓ Passed: ${checks.passed.length}`, 'green');
    log(`⚠ Warnings: ${checks.warnings.length}`, 'yellow');
    log(`✗ Failed: ${checks.failed.length}`, 'red');

    if (checks.failed.length > 0) {
        log('\n❌ Critical Issues:', 'red');
        checks.failed.forEach(issue => {
            log(`   • ${issue}`, 'red');
        });
    }

    if (checks.warnings.length > 0) {
        log('\n⚠️  Warnings:', 'yellow');
        checks.warnings.forEach(warning => {
            log(`   • ${warning}`, 'yellow');
        });
    }

    log('\n' + '='.repeat(60), 'blue');

    if (checks.failed.length === 0) {
        log('\n✅ System is ready for deployment!', 'green');
        log('Review warnings and proceed with deployment.\n', 'green');
        printChecklist();
        process.exit(0);
    } else {
        log('\n❌ System is NOT ready for deployment!', 'red');
        log('Please fix the critical issues listed above.\n', 'red');
        process.exit(1);
    }
}

/**
 * Run all checks
 */
function runPreDeploymentCheck() {
    log('\n' + '='.repeat(60), 'blue');
    log('PRE-DEPLOYMENT CHECK', 'blue');
    log('='.repeat(60), 'blue');

    checkProductionEnv();
    checkBuildOutput();
    checkSecurity();
    checkDatabase();
    checkDependencies();
    checkPerformance();

    printSummary();
}

// Run the check
runPreDeploymentCheck();
