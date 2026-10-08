#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[watchdog $(date -u +%H:%M:%S)] starting dev server..."
  node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT=$?
  echo "[watchdog $(date -u +%H:%M:%S)] dev server exited with code $EXIT, restarting in 3s..."
  sleep 3
done
