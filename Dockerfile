# =============================================================================
# Multi-stage Dockerfile for TrenchJobs (Backend + Frontend + PostgreSQL)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Go Backend
# -----------------------------------------------------------------------------
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy source code
COPY backend/ ./

# Download dependencies and build
RUN go mod tidy && \
    CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# -----------------------------------------------------------------------------
# Stage 2: Build React Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

# Install build dependencies for native modules (usb, node-gyp)
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev

WORKDIR /app

# Copy package files first for better caching
COPY frontend-new/package*.json ./
RUN npm ci

# Copy source code and build
COPY frontend-new/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runtime - All Services (PostgreSQL + Backend + Frontend)
# -----------------------------------------------------------------------------
FROM alpine:3.20

# Install runtime dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql16 \
    postgresql16-contrib \
    ca-certificates \
    tzdata \
    bash

# Create directories
RUN mkdir -p /app /var/log/supervisor /run/nginx /run/postgresql /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql

# Copy backend binary
COPY --from=backend-builder /app/main /app/backend

# Copy frontend build
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy database migrations
COPY backend/migrations/ /docker-entrypoint-initdb.d/

# Copy nginx configuration
COPY <<'EOF' /etc/nginx/http.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Copy startup script
COPY <<'EOF' /app/start.sh
#!/bin/bash
set -e

# Initialize PostgreSQL if needed
if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
    echo "Initializing PostgreSQL database..."
    su postgres -c "initdb -D /var/lib/postgresql/data"

    # Configure PostgreSQL
    echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
    echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf
fi

# Start PostgreSQL
su postgres -c "pg_ctl -D /var/lib/postgresql/data -l /var/log/postgresql.log start"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
until su postgres -c "pg_isready" > /dev/null 2>&1; do
    sleep 1
done

# Create database and user if they don't exist
su postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'trenchjob'\" | grep -q 1 || psql -c \"CREATE DATABASE trenchjob;\""
su postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""

# Run migrations
echo "Running database migrations..."
for f in /docker-entrypoint-initdb.d/*.sql; do
    if [ -f "$f" ]; then
        echo "Running migration: $f"
        su postgres -c "psql -d trenchjob -f $f" || true
    fi
done

echo "Starting supervisord..."
exec supervisord -c /etc/supervisord.conf
EOF

RUN chmod +x /app/start.sh

# Copy supervisord configuration
COPY <<'EOF' /etc/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
user=root

[program:backend]
command=/app/backend
directory=/app
environment=DB_HOST="127.0.0.1",DB_PORT="5432",DB_USER="postgres",DB_PASSWORD="postgres",DB_NAME="trenchjob",DB_SSLMODE="disable",SERVER_PORT="8080",SERVER_ENV="production",JWT_SECRET="%(ENV_JWT_SECRET)s",JWT_EXPIRE_HOURS="24",SOLANA_RPC_ENDPOINT="https://api.devnet.solana.com",SOLANA_NETWORK="devnet"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# Environment variables (can be overridden at runtime)
ENV JWT_SECRET=change-me-in-production

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/api/v1/health || exit 1

# Start all services
CMD ["/app/start.sh"]
