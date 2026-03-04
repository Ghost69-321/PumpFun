#!/usr/bin/env bash
# =============================================================================
# PumpFun — Fresh Ubuntu 22.04+ Server Setup Script
# =============================================================================
# Run this ONCE on a brand-new VPS before running deploy.sh.
# Must be executed as root.
#
# What it does:
#   1. Creates a 'deploy' user with sudo and SSH key authentication
#   2. Disables root SSH login and password-based authentication
#   3. Installs and configures fail2ban
#   4. Configures UFW firewall (22, 80, 443 only)
#   5. Installs Docker, Docker Compose plugin, Nginx, and Certbot
#   6. Creates the app directory structure at /opt/pumpfun
#
# Usage (from your local machine):
#   ssh root@<server-ip> 'bash -s' < scripts/setup-server.sh
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Color helpers
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }
section() { echo -e "\n${GREEN}==============================${NC}"; echo -e "${GREEN}  $*${NC}"; echo -e "${GREEN}==============================${NC}"; }

# ---------------------------------------------------------------------------
# Must run as root
# ---------------------------------------------------------------------------
if [[ $EUID -ne 0 ]]; then
  error "Please run as root: sudo $0"
fi

# ---------------------------------------------------------------------------
# Configurable variables
# ---------------------------------------------------------------------------
DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/opt/pumpfun"

section "Step 1 — System update"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl git ufw fail2ban \
  ca-certificates gnupg lsb-release \
  software-properties-common apt-transport-https

section "Step 2 — Create '${DEPLOY_USER}' user"

if id "${DEPLOY_USER}" &>/dev/null; then
  info "User '${DEPLOY_USER}' already exists."
else
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
  info "User '${DEPLOY_USER}' created."
fi

# Add to sudo and docker groups
usermod -aG sudo "${DEPLOY_USER}"

# Set up authorized_keys
DEPLOY_HOME=$(getent passwd "${DEPLOY_USER}" | cut -d: -f6)
mkdir -p "${DEPLOY_HOME}/.ssh"
chmod 700 "${DEPLOY_HOME}/.ssh"

# Copy root's authorized_keys if the deploy user has none yet
# (so you can SSH in immediately)
if [[ ! -s "${DEPLOY_HOME}/.ssh/authorized_keys" ]]; then
  if [[ -f /root/.ssh/authorized_keys ]]; then
    cp /root/.ssh/authorized_keys "${DEPLOY_HOME}/.ssh/authorized_keys"
    chmod 600 "${DEPLOY_HOME}/.ssh/authorized_keys"
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_HOME}/.ssh"
    info "Copied root's authorized_keys to ${DEPLOY_USER}."
  else
    warn "No SSH public key found. Add your public key to ${DEPLOY_HOME}/.ssh/authorized_keys before continuing."
  fi
fi

# Allow deploy user to run docker compose without sudo
# (docker group membership takes effect on next login)

section "Step 3 — Harden SSH"

SSHD_CONFIG="/etc/ssh/sshd_config"

# Disable root login
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' "${SSHD_CONFIG}"
# Disable password auth
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "${SSHD_CONFIG}"
# Disable challenge-response auth
sed -i 's/^#\?ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' "${SSHD_CONFIG}"

# Validate config before reloading
sshd -t
systemctl reload sshd
info "SSH hardened."

section "Step 4 — Configure fail2ban"

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled  = true
port     = ssh
logpath  = %(sshd_log)s
backend  = %(sshd_backend)s
EOF

systemctl enable --now fail2ban
info "fail2ban configured."

section "Step 5 — Configure UFW firewall"

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   comment "SSH"
ufw allow 80/tcp   comment "HTTP"
ufw allow 443/tcp  comment "HTTPS"
ufw --force enable
info "UFW configured (22/80/443 open)."

section "Step 6 — Install Docker"

if ! command -v docker &>/dev/null; then
  info "Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
  info "Docker installed: $(docker --version)"
else
  info "Docker already installed: $(docker --version)"
fi

# Add deploy user to docker group
usermod -aG docker "${DEPLOY_USER}"

section "Step 7 — Install Nginx"

if ! command -v nginx &>/dev/null; then
  apt-get install -y -qq nginx
  systemctl enable nginx
  info "Nginx installed."
else
  info "Nginx already installed: $(nginx -v 2>&1)"
fi

section "Step 8 — Install Certbot"

if ! command -v certbot &>/dev/null; then
  apt-get install -y -qq certbot python3-certbot-nginx
  info "Certbot installed: $(certbot --version)"
else
  info "Certbot already installed: $(certbot --version)"
fi

section "Step 9 — Create app directory structure"

mkdir -p "${APP_DIR}"/{nginx,scripts,public/uploads}
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
chmod 750 "${APP_DIR}"
info "App directory created at ${APP_DIR}."

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
section "Server setup complete!"
echo ""
echo -e "  ${GREEN}Deploy user:${NC}  ${DEPLOY_USER}"
echo -e "  ${GREEN}App dir:${NC}      ${APP_DIR}"
echo ""
echo -e "  Next steps:"
echo -e "  1. Log out of root and SSH in as '${DEPLOY_USER}':"
echo -e "     ssh ${DEPLOY_USER}@<server-ip>"
echo -e "  2. Run the deploy script:"
echo -e "     sudo ${APP_DIR}/scripts/deploy.sh"
echo -e "     (or clone the repo first and run: sudo bash scripts/deploy.sh)"
echo ""
warn "IMPORTANT: Before logging out of root, verify that you can SSH in as '${DEPLOY_USER}'."
echo ""
