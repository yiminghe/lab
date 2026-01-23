#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create directory and install pm2
mkdir -p ~/pm2
cp "$SCRIPT_DIR/pm2/package.json" ~/pm2/
cp "$SCRIPT_DIR/pm2/package-lock.json" ~/pm2/
cd ~/pm2
npm install

# Add ~/pm2/node_modules/.bin to PATH
export PATH="$HOME/pm2/node_modules/.bin:$PATH"

# Set up pm2-logrotate
mkdir -p ~/.pm2/modules/pm2-logrotate
cp "$SCRIPT_DIR/pm2-logrotate/package.json" ~/.pm2/modules/pm2-logrotate/
cp "$SCRIPT_DIR/pm2-logrotate/package-lock.json" ~/.pm2/modules/pm2-logrotate/

# Set up pm2-prom-module
mkdir -p ~/.pm2/modules/pm2-prom-module
cp "$SCRIPT_DIR/pm2-prom-module/package.json" ~/.pm2/modules/pm2-prom-module/
cp "$SCRIPT_DIR/pm2-prom-module/package-lock.json" ~/.pm2/modules/pm2-prom-module/

# Install modules using the full path from PATH
pm2 install pm2-logrotate
pm2 install pm2-prom-module