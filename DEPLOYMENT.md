# PumpFun — Production Deployment Guide

Self-hosted deployment on a VPS (DigitalOcean, AWS EC2, Hetzner, etc.).  
Everything runs inside Docker — no Vercel required.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start-one-command)
3. [Manual Step-by-Step Deployment](#3-manual-step-by-step-deployment)
4. [SSL Setup](#4-ssl-setup)
5. [Updating / Redeploying](#5-updating--redeploying)
6. [Monitoring & Logs](#6-monitoring--logs)
7. [Backup & Restore](#7-backup--restore)
8. [Troubleshooting](#8-troubleshooting)
9. [Security Hardening Checklist](#9-security-hardening-checklist)

---

## 1. Prerequisites

| Requirement | Details |
|---|---|
| **VPS** | Ubuntu 22.04 LTS, min 2 vCPU / 2 GB RAM (4 GB recommended) |
| **Domain** | A domain or subdomain pointing to your VPS IP (`A` record) |
| **Solana RPC** | Dedicated endpoint — **do not** use the public Solana RPC in production |
| **Local tools** | `ssh`, `git` |

### Recommended VPS providers

- [DigitalOcean](https://digitalocean.com) — Droplets from $12/mo
- [Hetzner](https://www.hetzner.com) — CPX21 (3 vCPU, 4 GB) from ~€5/mo
- [AWS EC2](https://aws.amazon.com/ec2/) — t3.small or larger

### Dedicated Solana RPC providers

- [Helius](https://helius.dev) (free tier available)
- [QuickNode](https://quicknode.com)
- [Triton](https://triton.one)

---

## 2. Quick Start (one command)

> **Warning:** Read through the script before running it. It will modify system configuration.

```bash
# 1. Prepare a fresh server (run as root)
ssh root@<your-vps-ip> 'bash -s' < scripts/setup-server.sh

# 2. SSH in as the deploy user
ssh deploy@<your-vps-ip>

# 3. Deploy the application
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/Ghost69-321/PumpFun/main/scripts/deploy.sh)"
```

The deploy script will:
- Install Docker, Nginx, and Certbot
- Clone the repository
- Prompt you for all required environment variables
- Start the containers
- Run database migrations
- Configure Nginx with SSL
- Set up automatic restart via systemd
- Configure the UFW firewall

---

## 3. Manual Step-by-Step Deployment

### 3.1 Prepare the server

```bash
# As root on the VPS:
curl -fsSL https://raw.githubusercontent.com/Ghost69-321/PumpFun/main/scripts/setup-server.sh | bash
```

### 3.2 Clone the repository

```bash
git clone https://github.com/Ghost69-321/PumpFun.git /opt/pumpfun
cd /opt/pumpfun
```

### 3.3 Create the environment file

```bash
cp .env.production.template .env.production
nano .env.production   # fill in all CHANGE_ME / GENERATE_ME values
chmod 600 .env.production
```

Key values to set:

| Variable | How to generate |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Your Helius/QuickNode endpoint |
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `DOMAIN` | `your-domain.com` |

### 3.4 Pull and start containers

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 3.5 Run database migrations

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec app npx prisma migrate deploy
```

### 3.6 Configure Nginx

```bash
# Replace 'your-domain.com' with your actual domain
sudo sed "s/your-domain.com/$(grep ^DOMAIN .env.production | cut -d= -f2)/g" \
  nginx/pumpfun.conf > /etc/nginx/sites-available/pumpfun

# Add connection upgrade map (needed for WebSocket/SSE)
sudo sed -i '/http {/a \\n    map $http_upgrade $connection_upgrade {\n        default upgrade;\n        '"''"'      close;\n    }' /etc/nginx/nginx.conf

sudo ln -sf /etc/nginx/sites-available/pumpfun /etc/nginx/sites-enabled/pumpfun
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. SSL Setup

Obtain a certificate with Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically:
- Obtain the certificate
- Update the Nginx config with the correct paths
- Set up automatic renewal via a systemd timer

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 5. Updating / Redeploying

### Via CI/CD (recommended)

Push to the `main` branch — GitHub Actions will:
1. Build and push a new Docker image to `ghcr.io`
2. SSH into your server and pull the new image
3. Restart the containers with zero-downtime
4. Run any new migrations automatically

**Required GitHub Secrets** (Settings → Secrets → Actions):

| Secret | Description |
|---|---|
| `SERVER_HOST` | VPS IP address |
| `SERVER_USER` | SSH user (`deploy`) |
| `SERVER_SSH_KEY` | Contents of `~/.ssh/id_rsa` (private key) |
| `DATABASE_URL` | Full PostgreSQL connection URL |
| `NEXTAUTH_SECRET` | Auth secret value |
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint |
| `PLATFORM_WALLET_ADDRESS` | `CfyjfkdfVchdvtKyPbBxBoScfSUPBVMwnGbYeXBs5uKw` |

### Manual update

```bash
cd /opt/pumpfun
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --remove-orphans
docker compose -f docker-compose.prod.yml --env-file .env.production exec app npx prisma migrate deploy
docker image prune -f
```

---

## 6. Monitoring & Logs

```bash
# Live logs from the Next.js app
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production logs -f app

# All services
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production logs -f

# Container status
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production ps

# Systemd service status
systemctl status pumpfun

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

---

## 7. Backup & Restore

### Backup PostgreSQL

```bash
# Create a timestamped dump
BACKUP_FILE="/opt/backups/pumpfun_$(date +%Y%m%d_%H%M%S).sql.gz"
mkdir -p /opt/backups

docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production \
  exec -T db pg_dump -U pumpfun pumpfun | gzip > "${BACKUP_FILE}"

echo "Backup saved to ${BACKUP_FILE}"
```

### Restore PostgreSQL

```bash
# Replace <backup-file> with your .sql.gz file
gunzip -c /opt/backups/<backup-file>.sql.gz | \
  docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production \
  exec -T db psql -U pumpfun pumpfun
```

### Automate daily backups (cron)

```bash
sudo crontab -e
# Add this line to run at 2 AM daily:
0 2 * * * docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production exec -T db pg_dump -U pumpfun pumpfun | gzip > /opt/backups/pumpfun_$(date +\%Y\%m\%d).sql.gz
```

---

## 8. Troubleshooting

### Containers won't start

```bash
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production logs
```

Common causes:
- Missing or incorrect values in `.env.production`
- Database password mismatch between `DATABASE_URL` and `POSTGRES_PASSWORD`
- Port 3000 already in use on the host

### Migrations fail

```bash
# Check if the db container is healthy
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production ps db

# Run migrations manually
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production \
  exec app npx prisma migrate deploy
```

### Nginx returns 502 Bad Gateway

The app container may still be starting. Check its health:

```bash
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production ps app
docker compose -f /opt/pumpfun/docker-compose.prod.yml --env-file /opt/pumpfun/.env.production logs app
```

### SSL certificate issues

```bash
sudo certbot certificates          # List certificates and expiry
sudo certbot renew --dry-run       # Test auto-renewal
sudo nginx -t && sudo systemctl reload nginx
```

### SSE (real-time trading feed) not working

Ensure `proxy_buffering off` is set in the `/api/` location block in Nginx.  
Check that the `connection_upgrade` map is present in `/etc/nginx/nginx.conf`.

---

## 9. Security Hardening Checklist

- [ ] Changed default `POSTGRES_PASSWORD` (not `pumpfun`)
- [ ] Generated a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Using a dedicated Solana RPC endpoint (not the public one)
- [ ] Root SSH login disabled (`PermitRootLogin no`)
- [ ] Password SSH authentication disabled (`PasswordAuthentication no`)
- [ ] fail2ban installed and running (`systemctl status fail2ban`)
- [ ] UFW firewall enabled, only ports 22/80/443 open (`ufw status`)
- [ ] SSL certificate obtained and auto-renewal working (`certbot renew --dry-run`)
- [ ] `.env.production` has restrictive permissions (`chmod 600 .env.production`)
- [ ] Regular database backups scheduled (see §7)
- [ ] Docker images regularly updated (`docker compose pull && docker image prune`)
- [ ] Monitoring / alerting configured (Uptime Robot, Grafana, etc.)
