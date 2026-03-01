// PM2 Ecosystem Configuration for RentCar
// Bu fayl PM2 bilan backend va frontend ni boshqarish uchun

module.exports = {
  apps: [
    {
      name: 'rentcar-backend',
      script: '/var/www/rentcar/venv/bin/gunicorn',
      args: '--workers 4 --bind 127.0.0.1:5000 --timeout 120 --worker-class sync app:app',
      cwd: '/var/www/rentcar',
      interpreter: 'none',
      env: {
        FLASK_ENV: 'production',
        PYTHONPATH: '/var/www/rentcar',
        PATH: '/var/www/rentcar/venv/bin:/usr/local/bin:/usr/bin:/bin'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/www/rentcar/logs/backend-error.log',
      out_file: '/var/www/rentcar/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    },
    {
      name: 'rentcar-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/rentcar/frontend',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/www/rentcar/logs/frontend-error.log',
      out_file: '/var/www/rentcar/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
