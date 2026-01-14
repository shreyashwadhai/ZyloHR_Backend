#!/bin/bash
export HOME=/home/ubuntu
cd /home/ubuntu/app

# Stop any existing PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Get environment variables from AWS Systems Manager Parameter Store
export PORT=$(aws ssm get-parameter --name "zylohr-PORT" --query "Parameter.Value" --output text --region ap-south-1 2>/dev/null || echo "5000")
export MONGO_URL=$(aws ssm get-parameter --name "zylohr-MONGO_URL" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
export JWT_SECRET=$(aws ssm get-parameter --name "zylohr-JWT_SECRET" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
export CLOUD_NAME=$(aws ssm get-parameter --name "zylohr-CLOUD_NAME" --query "Parameter.Value" --output text --region ap-south-1)
export CLOUD_API_KEY=$(aws ssm get-parameter --name "zylohr-CLOUD_API_KEY" --query "Parameter.Value" --output text --region ap-south-1)
export CLOUD_API_SECRET=$(aws ssm get-parameter --name "zylohr-CLOUD_API_SECRET" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
export ADMIN_SECRET_KEY=$(aws ssm get-parameter --name "zylohr-ADMIN_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
export MANAGER_SECRET_KEY=$(aws ssm get-parameter --name "zylohr-MANAGER_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
export REDIS_URL=$(aws ssm get-parameter --name "zylohr-REDIS_URL" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)
export SESSION_SECRET=$(aws ssm get-parameter --name "zylohr-SESSION_SECRET" --with-decryption --query "Parameter.Value" --output text --region ap-south-1)

# Create .env file
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

echo "✅ .env file created successfully!"
echo "First 3 lines of .env:"
head -n 3 .env

# Start PM2
if [ -f ecosystem.config.js ]; then
  pm2 start ecosystem.config.js
else
  pm2 start index.js --name ZyloHR-Backend
fi

pm2 save
pm2 list