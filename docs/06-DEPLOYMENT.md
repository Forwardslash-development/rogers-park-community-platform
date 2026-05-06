# Deployment & Operations
## Rogers Park Community Platform — Auth MVP (v1.0)

**Last Updated:** May 2026  
**Status:** Active  
**Audience:** Operators, developers

---

## Overview

This document covers deploying the Auth MVP to your Digital Ocean droplet and operating it in production.

**Architecture:** Single droplet, two processes (SvelteKit + Hono), shared PostgreSQL.

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally (`pnpm test`)
- [ ] Environment variables set correctly (`.env` for production)
- [ ] Database migrations applied to production DB
- [ ] SSL certificate ready (via Cloudflare)
- [ ] Domain registered (if using)
- [ ] Backups configured
- [ ] Monitoring set up (logs, uptime checks)
- [ ] Rate limiting configured
- [ ] Security headers configured

---

## Digital Ocean Droplet Setup

### Initial Droplet Configuration

**Specs for Auth MVP:**
- **Size:** $5–6/month droplet (cheapest works for MVP)
- **OS:** Ubuntu 22.04 LTS
- **Region:** Closest to Rogers Park (e.g., Chicago, if available; else Toronto)

### SSH Access

```bash
# From your laptop, add SSH key to droplet
# During droplet creation, add your public key (~/.ssh/id_rsa.pub)

# Test connection
ssh root@<droplet-ip>

# Add non-root user (for security)
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Switch to deploy user for all following commands
su - deploy
```

### System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL client (for local connections)
sudo apt install -y postgresql-client

# Install Git
sudo apt install -y git

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Supervisor (process management)
sudo apt install -y supervisor

# Install ufw (firewall)
sudo apt install -y ufw
```

### PostgreSQL Installation

**Option A: PostgreSQL on same droplet**

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create application user and database
sudo -u postgres createuser rogerspan_user -P
sudo -u postgres createdb rogerspan_db --owner rogerspan_user

# Test connection
psql -U rogerspan_user -d rogerspan_db -h localhost
```

**Option B: Managed database (recommended for production)**

Use DigitalOcean's managed PostgreSQL:
- More reliable (automated backups, failover)
- More expensive (~$12–15/month minimum)
- Better for scaling later

If using managed DB:
1. Create managed cluster in DigitalOcean console
2. Note connection string
3. Add it to `.env` as `DATABASE_URL`

For MVP, local PostgreSQL is fine.

---

## Application Deployment

### 1. Clone Repository

```bash
# Clone into /home/deploy/app
cd /home/deploy
git clone https://github.com/yourusername/rogers-park-community-platform.git app
cd app
```

### 2. Install Dependencies

```bash
pnpm install --prod
```

### 3. Set Environment Variables

Create `.env` (production):

```bash
sudo tee /home/deploy/app/.env > /dev/null <<EOF
# Database
DATABASE_URL=postgresql://rogerspan_user:YOUR_PASSWORD@localhost:5432/rogerspan_db

# API
API_PORT=3001
API_HOST=127.0.0.1
NODE_ENV=production

# Frontend
FRONTEND_URL=https://rogerspan.community
PUBLIC_API_URL=https://rogerspan.community/api

# Sessions
SESSION_SECRET=$(openssl rand -base64 32)

# Rate limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# Logging
LOG_LEVEL=info
EOF

sudo chown deploy:deploy /home/deploy/app/.env
sudo chmod 600 /home/deploy/app/.env
```

**Important:** Don't commit `.env` to Git. Use secret management in CI/CD instead.

### 4. Run Migrations

```bash
cd /home/deploy/app
pnpm run db:migrate
```

### 5. Build Application

```bash
pnpm build
```

---

## Process Management (Supervisor)

Supervisor manages the SvelteKit and Hono processes, restarting them if they crash.

### Create Supervisor Configuration

**API process** (`/etc/supervisor/conf.d/rogerspan-api.conf`):

```ini
[program:rogerspan-api]
directory=/home/deploy/app/api
command=npm run start
user=deploy
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/rogerspan-api.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
environment=NODE_ENV=production

; Graceful shutdown
startsecs=10
stopasgroup=true
killasgroup=true
```

**Frontend process** (`/etc/supervisor/conf.d/rogerspan-frontend.conf`):

```ini
[program:rogerspan-frontend]
directory=/home/deploy/app/frontend
command=npm run start
user=deploy
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/rogerspan-frontend.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
environment=NODE_ENV=production
```

### Start Processes

```bash
# Reload supervisor configs
sudo supervisorctl reread
sudo supervisorctl update

# Start processes
sudo supervisorctl start rogerspan-api
sudo supervisorctl start rogerspan-frontend

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/rogerspan-api.log
tail -f /var/log/supervisor/rogerspan-frontend.log
```

---

## Nginx Reverse Proxy

Nginx sits in front of SvelteKit and Hono, handling HTTPS (via Cloudflare), compression, caching.

### Create Nginx Configuration

**`/etc/nginx/sites-available/rogerspan`**:

```nginx
# Redirect HTTP to HTTPS (Cloudflare terminates HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name rogerspan.community www.rogerspan.community;
    
    # Cloudflare origin pull certificate
    return 301 https://$server_name$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rogerspan.community www.rogerspan.community;

    # SSL certificates (from Cloudflare or Let's Encrypt)
    ssl_certificate /etc/ssl/certs/rogerspan.crt;
    ssl_certificate_key /etc/ssl/private/rogerspan.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # HSTS header
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API routes → Hono (port 3001)
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Health check → Hono
    location /health {
        proxy_pass http://127.0.0.1:3001/api/v1/health;
        proxy_http_version 1.1;
        access_log off;
    }

    # Static assets (SvelteKit)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5173;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Everything else → SvelteKit (port 5173)
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

### Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/rogerspan /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Cloudflare Configuration

### DNS Setup

1. Add your domain to Cloudflare (if not already)
2. Update nameservers at registrar to Cloudflare's
3. Add DNS records:

```
Type  Name              Content              TTL
A     rogerspan.com     <droplet-ip>         Auto
CNAME www               rogerspan.com        Auto
```

### SSL/TLS Setup

1. Go to **SSL/TLS** → **Overview**
2. Set to **Full (Strict)** (requires valid cert on origin)
3. Generate Cloudflare Origin Pull Certificate:
   - **SSL/TLS** → **Origin Server**
   - Download certificate and key
   - Upload to `/etc/ssl/certs/rogerspan.crt` and `/etc/ssl/private/rogerspan.key`

### Security & Performance

**Firewall Rules:**
- Block known bots
- Allow Rogers Park traffic only (optional, for early beta)
- Rate limit API endpoints

**Caching:**
- Cache static assets (JS, CSS, images)
- Cache API responses that are marked cacheable

**Workers (optional, Phase 2+):**
- Add API key validation via Cloudflare Workers
- Implement webhook signing

---

## Database Backups

### Manual Backup

```bash
# Backup production database
pg_dump -U rogerspan_user -d rogerspan_db --clean > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U rogerspan_user -d rogerspan_db < backup_20260505_120000.sql
```

### Automated Backups (Cron)

```bash
# Add to crontab
crontab -e

# Add line (daily at 2 AM)
0 2 * * * pg_dump -U rogerspan_user -d rogerspan_db --clean > /home/deploy/backups/backup_$(date +\%Y\%m\%d).sql

# Keep only last 30 days
0 3 * * * find /home/deploy/backups -name "backup_*.sql" -mtime +30 -delete
```

### Off-Site Backups (S3)

For production, store backups off-site:

```bash
# Install S3 CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure credentials
aws configure

# Add to cron (daily)
0 2 * * * pg_dump -U rogerspan_user -d rogerspan_db | gzip | aws s3 cp - s3://rogerspan-backups/db_$(date +\%Y\%m\%d).sql.gz
```

---

## Monitoring & Logging

### Application Logs

Supervisor logs to `/var/log/supervisor/`:

```bash
# Watch API logs in real-time
tail -f /var/log/supervisor/rogerspan-api.log

# Search logs
grep "ERROR" /var/log/supervisor/rogerspan-api.log
```

### System Logs

```bash
# View all logs
journalctl -u supervisor

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Check

```bash
# Manual health check
curl http://localhost:3001/api/v1/health

# Via Nginx
curl https://rogerspan.community/health

# Scheduled check (cron, every 5 minutes)
*/5 * * * * curl -f http://127.0.0.1:3001/api/v1/health || systemctl restart supervisor
```

### Monitoring Tools (Future)

For Phase 2+, add:
- **Uptime monitoring:** Statuspage, Uptime Robot
- **Error tracking:** Sentry
- **Metrics:** Prometheus, Grafana
- **Log aggregation:** ELK Stack, Datadog

---

## Deployment Process

### Automated Deployment (via GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: rogerspan_test

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to DigitalOcean
        env:
          SSH_KEY: ${{ secrets.DROPLET_SSH_KEY }}
          DROPLET_IP: ${{ secrets.DROPLET_IP }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan $DROPLET_IP >> ~/.ssh/known_hosts

          ssh deploy@$DROPLET_IP << 'EOF'
          cd /home/deploy/app
          git fetch origin main
          git reset --hard origin/main
          pnpm install --prod
          pnpm build
          pnpm run db:migrate
          sudo supervisorctl restart rogerspan-api rogerspan-frontend
          EOF
```

### Manual Deployment

```bash
# From your laptop, SSH into droplet
ssh deploy@<droplet-ip>

# Update code
cd /home/deploy/app
git pull origin main

# Install dependencies
pnpm install --prod

# Build
pnpm build

# Run migrations
pnpm run db:migrate

# Restart services
sudo supervisorctl restart rogerspan-api rogerspan-frontend

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/rogerspan-api.log
```

---

## Scaling (Future)

### When to Scale

For Rogers Park (55k residents, 200-400 venues), single droplet handles:
- 1,000s of concurrent users
- 100s of requests/second
- Years of operational history

Scale when:
- Droplet consistently at >80% CPU or RAM
- Response times degrade
- Database queries become slow (add PostGIS indexes)
- Plan to expand to other neighborhoods

### Scaling Strategy

**Phase 2+:**
1. **Separate API & Frontend:** Different droplets
2. **Load balancing:** Nginx upstream balancing
3. **Database:** Managed PostgreSQL cluster (DigitalOcean)
4. **Caching:** Redis for sessions, rate limiting
5. **CDN:** Cloudflare Workers for edge compute

For now: Single droplet, monitor performance.

---

## Security Hardening

### Firewall (ufw)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny everything else
sudo ufw default deny incoming

# Check status
sudo ufw status
```

### SSH Security

```bash
# Disable root login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password auth (keys only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd
```

### Keep System Updated

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo systemctl enable unattended-upgrades
```

---

## Troubleshooting

### Services won't start

```bash
# Check supervisor status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/rogerspan-api.log

# Restart supervisor
sudo systemctl restart supervisor

# Check if port is in use
lsof -i :3001
lsof -i :5173
```

### Database connection fails

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U rogerspan_user -d rogerspan_db

# Check credentials in .env
cat /home/deploy/app/.env | grep DATABASE_URL
```

### Nginx not serving

```bash
# Check Nginx status
sudo systemctl status nginx

# Test config
sudo nginx -t

# View error logs
tail -f /var/log/nginx/error.log
```

### Out of disk space

```bash
# Check usage
df -h

# Find large files
du -sh /home/deploy/app/*
du -sh /var/log/*

# Clear old logs
sudo journalctl --vacuum=50M
```

---

## Disaster Recovery

### Restore from Backup

```bash
# Stop application
sudo supervisorctl stop rogerspan-api rogerspan-frontend

# Drop current database
sudo -u postgres dropdb rogerspan_db

# Restore from backup
sudo -u postgres createdb rogerspan_db --owner rogerspan_user
psql -U rogerspan_user -d rogerspan_db < backup_20260505_120000.sql

# Restart
sudo supervisorctl start rogerspan-api rogerspan-frontend
```

### Droplet Failure

1. Create snapshot of working droplet (via DO console)
2. If current droplet fails, spin up new droplet from snapshot
3. Update DNS to point to new IP
4. Services resume from last snapshot

---

## Cost Management

**Monthly breakdown:**
- **Droplet:** $5–6/month (minimal specs)
- **Database:** Included (local PostgreSQL)
- **Backups:** Free (S3: ~$1/month for storage)
- **Domain:** ~$12/year (registrar)
- **Cloudflare:** Free (or $20+/month for paid plans)

**Total:** ~$7–8/month + domain

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
