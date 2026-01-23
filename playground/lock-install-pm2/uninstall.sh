#!/bin/bash

if [ -f ~/pm2/node_modules/.bin/pm2 ]; then
    # 卸载 PM2 模块
    ~/pm2/node_modules/.bin/pm2 uninstall pm2-logrotate
    ~/pm2/node_modules/.bin/pm2 uninstall pm2-prom-module
    # 停止并删除所有应用
    ~/pm2/node_modules/.bin/pm2 delete all
    # 停止 PM2 守护进程
    ~/pm2/node_modules/.bin/pm2 kill
fi

# 删除 PM2 相关目录
rm -rf ~/pm2
rm -rf ~/.pm2