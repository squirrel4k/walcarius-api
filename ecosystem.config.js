module.exports = {
  apps : [{
    name: 'wal_prod',
    script: 'dist/main.js',
    exec_mode: 'cluster',
    instances: 4,
    autorestart: true,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}
