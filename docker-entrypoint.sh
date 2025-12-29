#!/bin/sh

# Define config file path
CONFIG_FILE="env-config.js"

# Create config content
cat <<EOF > /tmp/${CONFIG_FILE}
window.__ENV__ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_SUPABASE_SHARE_URL: "${VITE_SUPABASE_SHARE_URL}",
  VITE_SUPABASE_SHARE_ANON_KEY: "${VITE_SUPABASE_SHARE_ANON_KEY}",
  VITE_SHARED_LIBRARY_URL: "${VITE_SHARED_LIBRARY_URL}",
  VITE_PERSONAL_LIBRARY_URL: "${VITE_PERSONAL_LIBRARY_URL}",
  VITE_ADMIN_ACCOUNT: "${VITE_ADMIN_ACCOUNT}",
  VITE_ADMIN_PASSWORD: "${VITE_ADMIN_PASSWORD}"
};
EOF

# Copy config to unified app root (MPA architecture)
cp /tmp/${CONFIG_FILE} /usr/share/nginx/html/${CONFIG_FILE}

# Generate valpoint.json (Domain Discovery Manifest)
MANIFEST_FILE="valpoint.json"
cat <<EOF > /usr/share/nginx/html/${MANIFEST_FILE}
{
  "name": "ValPoint Share",
  "description": "Shared Valorant Lineups",
  "api": {
    "supabaseUrl": "${VITE_SUPABASE_SHARE_URL}",
    "supabaseAnonKey": "${VITE_SUPABASE_SHARE_ANON_KEY}"
  },
  "version": "1.0.0"
}
EOF

# Start Nginx
exec "$@"
