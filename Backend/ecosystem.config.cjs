module.exports = {
  apps: [
    {
      name: "aurameet-backend",
      script: "./src/app.js",
      instances: process.env.PM2_INSTANCES || "max", // Utilize all available CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      },
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      listen_timeout: 8000,
      kill_timeout: 5000,
      // Logging
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
