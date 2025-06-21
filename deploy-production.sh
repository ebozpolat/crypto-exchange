#!/bin/bash

# Xosmox Production Deployment Script
# Run this on your production server (Ubuntu/Debian)

set -e

echo "🚀 Starting Xosmox Production Deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install PM2 (process manager)
sudo npm install -g pm2

# Create xosmox user
sudo useradd -m -s /bin/bash xosmox || true

# Create application directory
sudo mkdir -p /opt/xosmox
sudo chown xosmox:xosmox /opt/xosmox

# Clone or copy your application
# sudo -u xosmox git clone <your-repo> /opt/xosmox
# Or copy files manually

cd /opt/xosmox

# Setup Backend
echo "📦 Setting up backend..."
cd xosmox-backend
sudo -u xosmox npm install --production

# Setup database
echo "🗄️ Setting up database..."
sudo -u postgres createdb xosmox || true
sudo -u postgres psql -d xosmox -f setup-db.sql

# Setup Frontend
echo "🎨 Building frontend..."
cd ../frontend
sudo -u xosmox npm install
sudo -u xosmox npm run build

# Create production environment file
cat > /opt/xosmox/xosmox-backend/.env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=xosmox
DB_USER=postgres
DB_PASSWORD=your_db_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=https://yourdomain.com
EOF

# Setup PM2 ecosystem
cat > /opt/xosmox/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'xosmox-backend',
    script: './xosmox-backend/src/server.js',
    cwd: '/opt/xosmox',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start application with PM2
sudo -u xosmox pm2 start ecosystem.config.js
sudo -u xosmox pm2 save
sudo pm2 startup

# Setup Nginx
cat > /etc/nginx/sites-available/xosmox << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /opt/xosmox/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket for real-time data
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/xosmox /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
# sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Xosmox deployment completed!"
echo "🌐 Your exchange should be available at: http://yourdomain.com"
echo "📝 Don't forget to:"
echo "   1. Update .env with your actual database password"
echo "   2. Replace 'yourdomain.com' with your actual domain"
echo "   3. Setup SSL certificate with certbot"
echo "   4. Configure your DNS to point to this server"