module.exports = {
  apps : [{
    name: "grrrapp-api",
    script: "uvicorn",
    // We limit to 1 worker because 1GB RAM VM will struggle with multiple workers + DB traffic
    args: "backend.main:app --host 127.0.0.1 --port 8000 --workers 1",
    interpreter: "python3",
    cwd: "/var/www/grrrapp",
    env: {
      NODE_ENV: "production",
      // Python specific optimizations
      PYTHONUNBUFFERED: "1"
    },
    // PM2 Memory Limits
    max_memory_restart: "400M", // Restart if API consumes more than 400MB
    autorestart: true,
    watch: false,
    out_file: "/var/log/pm2/grrrapp-out.log",
    error_file: "/var/log/pm2/grrrapp-error.log",
    merge_logs: true
  }]
}
