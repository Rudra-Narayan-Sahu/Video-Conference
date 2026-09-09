# 🚀 AuraMeet Enterprise Production Deployment & Security Guide

This guide details how to deploy, secure, and scale the AuraMeet WebRTC Video Conferencing & Real-Time Collaboration platform in a production environment.

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────┐
                               │       Web Clients       │
                               │  (Browsers, Mobile Web) │
                               └────────────┬────────────┘
                                            │ HTTPS / WSS (Port 443)
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │        Nginx Reverse Proxy & LB         │
                       │  - SSL/TLS Termination (HTTP/2)         │
                       │  - Edge Rate Limiting Zones             │
                       │  - WebRTC Sticky IP Hashing             │
                       │  - Gzip & Immutable Static Cache        │
                       └────────────┬────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
       ┌──────────▼──────────┐             ┌──────────▼──────────┐
       │   Backend Node #1   │             │   Backend Node #2   │
       │   (Express + PM2)   │             │   (Express + PM2)   │
       │   - Helmet / CORS   │             │   - Helmet / CORS   │
       │   - Rate Limiters   │             │   - Rate Limiters   │
       │   - JWT Auth & San  │             │   - JWT Auth & San  │
       └──────────┬──────────┘             └──────────┬──────────┘
                  │                                   │
                  ├─────────────────┬─────────────────┤
                  │                 │                 │
       ┌──────────▼──────────┐      │      ┌──────────▼──────────┐
       │     Redis Store     │      │      │   MongoDB Cluster   │
       │  - Socket.IO PubSub │      │      │  - User Accounts    │
       │  - Signaling Sync   │      │      │  - Meeting History  │
       └─────────────────────┘      │      └─────────────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │      Frontend SPA       │
                       │ (High-speed Nginx Host) │
                       └─────────────────────────┘
```

---

## 🔒 Security Hardening Implemented

| Security Layer | Implementation Details |
| :--- | :--- |
| **HTTP Security Headers** | `helmet` configured with WebRTC CSP, strict HSTS, X-Content-Type-Options `nosniff`, X-Frame-Options `SAMEORIGIN`, and Cross-Origin Resource Policies. |
| **Rate Limiting** | Multi-tier rate limiting with `express-rate-limit`: Auth limit (15 attempts / 15m), Global API limit (150 req / 15m), Meeting actions (60 req / 5m). |
| **Edge Rate Limiting** | Nginx `limit_req_zone` dropping DDoS & brute-force packets before hitting Node.js. |
| **JWT Authentication** | HMAC-SHA256 tokens with strict signature validation, expiration checking, Bearer authorization header extraction, and automatic frontend invalidation interceptors. |
| **NoSQL Injection Defense** | `express-mongo-sanitize` sanitizing `$` and `.` operators on all incoming payloads. |
| **Parameter Pollution** | `hpp` middleware protection against repeated query parameters. |
| **CORS Whitelist** | Dynamic origin whitelist restricting cross-origin access exclusively to verified domains in production. |
| **Payload Capping** | JSON and URL-encoded body limits capped at 1MB to prevent memory exhaustion attacks. |
| **Signaling Throttling** | Socket.IO event throttling dropping excessive signaling messages (>50/sec) and oversized SDP/ICE messages (>64KB). |

---

## 📦 Deployment Method 1: Docker Compose (Recommended)

The easiest and most resilient way to launch the full multi-tier stack (Nginx Load Balancer, 2x Backend Nodes, Redis, MongoDB, and Frontend).

### Step 1: Clone and Configure Environment

```bash
# 1. Clone repository
git clone https://github.com/Rudra-Narayan-Sahu/Video-Conference.git
cd Video-Conference

# 2. Configure Backend environment
cp Backend/.env.example Backend/.env
# Open Backend/.env and set your production JWT_SECRET and ALLOWED_ORIGINS:
# JWT_SECRET=YOUR_SUPER_RANDOM_LONG_SECRET_KEY_HERE
```

### Step 2: Build & Start Containers

```bash
# Start the full stack in detached mode
docker compose up -d --build
```

### Step 3: Verify Status

```bash
# Inspect all running services
docker compose ps

# Check backend health
curl http://localhost/health
```

---

## ⚡ Deployment Method 2: Standalone PM2 + Nginx (Bare Metal / VM)

For deployment on Linux servers (Ubuntu/Debian) with Node.js and PM2.

### Step 1: Install Dependencies & Build Frontend

```bash
# Backend
cd Backend
npm ci --only=production

# Frontend
cd ../Frontend
npm ci
npm run build
```

### Step 2: Launch Backend in PM2 Cluster Mode

```bash
cd ../Backend
# Launch multi-core cluster across all CPU cores
npx pm2 start ecosystem.config.cjs --env production

# Save PM2 process list to restore on server reboot
npx pm2 save
npx pm2 startup
```

### Step 3: Configure System Nginx

Copy `nginx/nginx.conf` to `/etc/nginx/sites-available/aurameet`:

```bash
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔑 Setting up SSL/TLS with Let's Encrypt (Certbot)

To enable HTTPS and secure WebRTC video calls over public domains:

```bash
# 1. Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtain SSL Certificate
sudo certbot --nginx -d meet.yourdomain.com -d api.yourdomain.com

# 3. Verify Automatic Renewal
sudo certbot renew --dry-run
```

---

## 📡 WebRTC STUN/TURN Production Configuration

WebRTC peer connections require a **TURN server** to bypass symmetric NATs and restrictive firewalls (common in corporate and cellular networks).

Update `Frontend/src/utils/webrtcConfig.js`:

```javascript
export const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    {
      urls: 'turn:turn.yourdomain.com:3478',
      username: 'aurameet-user',
      credential: 'YOUR_SECURE_TURN_PASSWORD'
    }
  ],
  iceCandidatePoolSize: 10
};
```

---

## 📊 Health Probes & Monitoring Endpoints

| Endpoint | Method | Purpose | Response |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Container / Kubernetes Liveness Probe | Uptime, Memory RSS, Heap usage |
| `/ready` | `GET` | Container / Kubernetes Readiness Probe | MongoDB connection status, CPU count, Free RAM |
| `/status` | `GET` | Observability & Telemetry | Active WebRTC sockets, active rooms, PID |
| `/nginx-health` | `GET` | Load Balancer Health Probe | 200 OK |

---

## 🛠️ Operational Commands Cheat-Sheet

```bash
# View backend logs in real-time
docker compose logs -f backend-1 backend-2

# View Nginx access & error logs
docker compose logs -f loadbalancer

# Scale backend nodes dynamically
docker compose up -d --scale backend-1=4

# Restart all services with zero downtime
docker compose restart
```
