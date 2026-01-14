/**
 * System Health Check Script
 * Verifies all system components are properly configured and functional
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark() {
    return `${colors.green}✓${colors.reset}`;
}

function crossMark() {
    return `${colors.red}✗${colors.reset}`;
}

function warningMark() {
    return `${colors.yellow}⚠${colors.reset}`;
}

// Health check results
const results = {
    passed: [],
    failed: [],
    warnings: []
};

/**
 * Check if required environment variables are set
 */
function checkEnvironmentVariables() {
    log('\n📋 Checking Environment Variables...', 'cyan');

    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'NEXT_PUBLIC_API_URL'
    ];

    const optionalVars = [
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'EMAIL_HOST',
        'EMAIL_PORT',
        'EMAIL_USER',
        'EMAIL_PASSWORD'
    ];

    // Check .env.local file exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        results.warnings.push('No .env.local file found');
        log(`${warningMark()} .env.local file not found`, 'yellow');
    } else {
        results.passed.push('.env.local file exists');
        log(`${checkMark()} .env.local file exists`);
    }

    // Check required variables
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            results.passed.push(`${varName} is set`);
            log(`${checkMark()} ${varName} is set`);
        } else {
            results.failed.push(`${varName} is missing`);
            log(`${crossMark()} ${varName} is missing`, 'red');
        }
    });

    // Check optional variables
    optionalVars.forEach(varName => {
        if (process.env[varName]) {
            results.passed.push(`${varName} is set`);
            log(`${checkMark()} ${varName} is set`);
        } else {
            results.warnings.push(`${varName} is not set`);
            log(`${warningMark()} ${varName} is not set (optional)`, 'yellow');
        }
    });
}

/**
 * Check if required directories exist
 */
function checkDirectoryStructure() {
    log('\n📁 Checking Directory Structure...', 'cyan');

    const requiredDirs = [
        'src/app',
        'src/components',
        'src/lib',
        'src/models',
        'src/middleware',
        'public',
        'tests'
    ];

    requiredDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            results.passed.push(`${dir} directory exists`);
            log(`${checkMark()} ${dir} directory exists`);
        } else {
            results.failed.push(`${dir} directory missing`);
            log(`${crossMark()} ${dir} directory missing`, 'red');
        }
    });
}

/**
 * Check if required dependencies are installed
 */
function checkDependencies() {
    log('\n📦 Checking Dependencies...', 'cyan');

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        results.failed.push('package.json not found');
        log(`${crossMark()} package.json not found`, 'red');
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
        'next',
        'react',
        'react-dom',
        'mongoose',
        'jsonwebtoken',
        'bcryptjs',
        'razorpay',
        'tailwindcss'
    ];

    requiredDeps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
            results.passed.push(`${dep} is installed`);
            log(`${checkMark()} ${dep} is installed (${packageJson.dependencies[dep]})`);
        } else {
            results.failed.push(`${dep} is missing`);
            log(`${crossMark()} ${dep} is missing`, 'red');
        }
    });

    // Check node_modules exists
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        results.passed.push('node_modules directory exists');
        log(`${checkMark()} node_modules directory exists`);
    } else {
        results.failed.push('node_modules directory missing');
        log(`${crossMark()} node_modules directory missing - run npm install`, 'red');
    }
}

/**
 * Check if configuration files exist
 */
function checkConfigFiles() {
    log('\n⚙️  Checking Configuration Files...', 'cyan');

    const configFiles = [
        'next.config.mjs',
        'tailwind.config.js',
        'jest.config.js',
        'playwright.config.js',
        'package.json'
    ];

    configFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            results.passed.push(`${file} exists`);
            log(`${checkMark()} ${file} exists`);
        } else {
            results.warnings.push(`${file} not found`);
            log(`${warningMark()} ${file} not found`, 'yellow');
        }
    });
}

/**
 * Check if critical model files exist
 */
function checkModels() {
    log('\n🗄️  Checking Database Models...', 'cyan');

    const models = [
        'User.js',
        'Course.js',
        'Book.js',
        'Order.js',
        'Cart.js',
        'MockTest.js',
        'TestAttempt.js',
        'Enrollment.js',
        'StudyMaterial.js',
        'CurrentAffair.js',
        'Blog.js'
    ];

    models.forEach(model => {
        const modelPath = path.join(process.cwd(), 'src', 'models', model);
        if (fs.existsSync(modelPath)) {
            results.passed.push(`${model} model exists`);
            log(`${checkMark()} ${model} model exists`);
        } else {
            results.failed.push(`${model} model missing`);
            log(`${crossMark()} ${model} model missing`, 'red');
        }
    });
}

/**
 * Check if critical API routes exist
 */
function checkAPIRoutes() {
    log('\n🌐 Checking API Routes...', 'cyan');

    const routes = [
        'src/app/api/auth/login/route.js',
        'src/app/api/auth/register/route.js',
        'src/app/api/courses/[id]/enroll/route.js',
        'src/app/api/payments/create-order/route.js',
        'src/app/api/payments/verify/route.js',
        'src/app/api/tests/[id]/start/route.js',
        'src/app/api/books/route.js',
        'src/app/api/cart/route.js'
    ];

    routes.forEach(route => {
        const routePath = path.join(process.cwd(), route);
        if (fs.existsSync(routePath)) {
            results.passed.push(`${route} exists`);
            log(`${checkMark()} ${route.split('/').slice(-2).join('/')} exists`);
        } else {
            results.failed.push(`${route} missing`);
            log(`${crossMark()} ${route.split('/').slice(-2).join('/')} missing`, 'red');
        }
    });
}

/**
 * Check test setup
 */
function checkTestSetup() {
    log('\n🧪 Checking Test Setup...', 'cyan');

    const testFiles = [
        'jest.config.js',
        'jest.setup.js',
        'playwright.config.js'
    ];

    testFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            results.passed.push(`${file} exists`);
            log(`${checkMark()} ${file} exists`);
        } else {
            results.warnings.push(`${file} not found`);
            log(`${warningMark()} ${file} not found`, 'yellow');
        }
    });

    // Check if test directories exist
    const testDirs = ['tests/e2e', 'tests/utils', 'tests/seeds'];
    testDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            results.passed.push(`${dir} directory exists`);
            log(`${checkMark()} ${dir} directory exists`);
        } else {
            results.warnings.push(`${dir} directory not found`);
            log(`${warningMark()} ${dir} directory not found`, 'yellow');
        }
    });
}

/**
 * Print summary
 */
function printSummary() {
    log('\n' + '='.repeat(60), 'blue');
    log('HEALTH CHECK SUMMARY', 'blue');
    log('='.repeat(60), 'blue');

    log(`\n${checkMark()} Passed: ${results.passed.length}`, 'green');
    log(`${warningMark()} Warnings: ${results.warnings.length}`, 'yellow');
    log(`${crossMark()} Failed: ${results.failed.length}`, 'red');

    if (results.failed.length > 0) {
        log('\n❌ Critical Issues Found:', 'red');
        results.failed.forEach(issue => {
            log(`   • ${issue}`, 'red');
        });
    }

    if (results.warnings.length > 0) {
        log('\n⚠️  Warnings:', 'yellow');
        results.warnings.forEach(warning => {
            log(`   • ${warning}`, 'yellow');
        });
    }

    log('\n' + '='.repeat(60), 'blue');

    if (results.failed.length === 0) {
        log('\n✅ System health check passed!', 'green');
        log('All critical components are properly configured.\n', 'green');
        process.exit(0);
    } else {
        log('\n❌ System health check failed!', 'red');
        log('Please fix the critical issues listed above.\n', 'red');
        process.exit(1);
    }
}

/**
 * Run all health checks
 */
function runHealthCheck() {
    log('\n' + '='.repeat(60), 'blue');
    log('PREMIUM LMS SYSTEM HEALTH CHECK', 'blue');
    log('='.repeat(60), 'blue');

    checkEnvironmentVariables();
    checkDirectoryStructure();
    checkDependencies();
    checkConfigFiles();
    checkModels();
    checkAPIRoutes();
    checkTestSetup();

    printSummary();
}

// Run the health check
runHealthCheck();
