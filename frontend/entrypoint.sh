#!/bin/sh
# Generate /env.js with runtime environment variables before starting the server.
# This allows the frontend to read VITE_API_URL at runtime without a rebuild.
echo "window.__MELLOW_ENV__ = { VITE_API_URL: \"${VITE_API_URL:-}\" };" > /app/.output/public/env.js
echo "[entrypoint] Runtime env injected: VITE_API_URL=${VITE_API_URL:-}"
exec node /app/.output/server/index.mjs
