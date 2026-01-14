/**
 * PM2 Ecosystem Configuration
 * For production deployment on VPS/dedicated servers
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
    apps: [
        {
            name: 'premium-lms',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            instances: 'max', // Use all available CPU cores
            exec_mode: 'cluster', // Enable cluster mode for load balancing
            watch: false, // Disable watch in production
            max_memory_restart: '1G', // Restart if memory exceeds 1GB
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            listen_timeout: 10000,
            kill_timeout: 5000,
            wait_ready: true,

            // Graceful shutdown
            shutdown_with_message: true,

            // Environment-specific configurations
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            env_staging: {
                NODE_ENV: 'staging',
                PORT: 3001
            }
        }
    ],

    // Deployment configuration (optional)
    deploy: {
        production: {
            user: 'deploy',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'git@github.com:username/premium-lms.git',
            path: '/var/www/premium-lms',
            'pre-deploy-local': '',
            'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            'ssh_options': 'StrictHostKeyChecking=no'
        },
        staging: {
            user: 'deploy',
            host: 'your-staging-server-ip',
            ref: 'origin/develop',
            repo: 'git@github.com:username/premium-lms.git',
            path: '/var/www/premium-lms-staging',
            'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env staging',
            'ssh_options': 'StrictHostKeyChecking=no'
        }
    }
};
