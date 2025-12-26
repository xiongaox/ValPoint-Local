# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build all applications
# Note: These scripts build into dist/user, dist/shared, dist/admin as configured in vite configs
RUN npm run build:user
RUN npm run build:shared
RUN npm run build:admin

# Production Stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist/user /usr/share/nginx/html/user
COPY --from=builder /app/dist/shared /usr/share/nginx/html/shared
COPY --from=builder /app/dist/admin /usr/share/nginx/html/admin

# Copy custom nginx configuration
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 3208 3209 3210

# Start with entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
