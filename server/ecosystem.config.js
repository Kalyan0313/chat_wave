module.exports = {
    apps: [{
        name: 'chat-wave-api',
        script: './index.js',
        instances: 'max', // Use all available CPU cores
        exec_mode: 'cluster', // Enable cluster mode
        watch: false, // Disable watch in production
        max_memory_restart: '500M', // Restart if memory exceeds 500MB
        env: {
            NODE_ENV: 'development',
            PORT: 3002
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3002
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        listen_timeout: 3000,
        kill_timeout: 5000
    }]
};
