#!/bin/bash
cd "/run/media/shinehealthcare/a9496acd-4335-4f6b-9ef4-2a6d2c0ce9ad/Partner Portal/cascade-media-player"

if [ ! -f "node_modules/.bin/vite" ]; then
    echo "Vite not found, running npm install..."
    npm install
fi

echo "Starting dev server..."
npm run dev -- --host
