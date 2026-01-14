#!/bin/bash
export HOME=/home/ubuntu
cd /home/ubuntu/app

# Stop any existing PM2 processes to avoid port conflicts
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Create .env from CodePipeline variables
cat > .env << EOF
PORT=${PORT}
MONGO_URL=${MONGO_URL}
JWT_SECRET=${JWT_SECRET}
CLOUD_NAME=${CLOUD_NAME}
CLOUD_API_KEY=${CLOUD_API_KEY}
CLOUD_API_SECRET=${CLOUD_API_SECRET}
ADMIN_SECRET_KEY=${ADMIN_SECRET_KEY}
MANAGER_SECRET_KEY=${MANAGER_SECRET_KEY}
REDIS_URL=${REDIS_URL}
SESSION_SECRET=${SESSION_SECRET}
EOF

# Verify .env was created
echo "✅ .env file created:"
cat .env

# Start PM2
if [ -f ecosystem.config.js ]; then
  pm2 start ecosystem.config.js
else
  pm2 start index.js --name ZyloHR-Backend
fi

# Save PM2 configuration
pm2 save