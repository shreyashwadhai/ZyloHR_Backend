#!/bin/bash
cd /home/ubuntu/app
pm2 start ecosystem.config.js || pm2 start index.js --name backend
