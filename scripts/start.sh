#!/bin/bash
cd /home/ubuntu/app

# Run pm2 
pm2 start ecosystem.config.js || pm2 start index.js --name ZyloHR_Backend
