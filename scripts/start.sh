#!/bin/bash
export HOME=/home/ubuntu
cd /home/ubuntu/app

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

# Start PM2
pm2 start ecosystem.config.js || pm2 start index.js --name ZyloHR_Backend || pm2 restart ZyloHR_Backend