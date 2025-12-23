# ========================================
# Dockerfile pour School 1cc
# ========================================
# Placer ce fichier dans: school-1cc/Dockerfile
# ========================================

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copie de la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copie des fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]

# ========================================
# Configuration Nginx pour School 1cc
# ========================================
# Placer ce fichier dans: school-1cc/nginx.conf
# ========================================

# user nginx;
# worker_processes auto;
# error_log /var/log/nginx/error.log warn;
# pid /var/run/nginx.pid;
# 
# events {
#     worker_connections 1024;
# }
# 
# http {
#     include /etc/nginx/mime.types;
#     default_type application/octet-stream;
# 
#     log_format main '$remote_addr - $remote_user [$time_local] "$request" '
#                     '$status $body_bytes_sent "$http_referer" '
#                     '"$http_user_agent" "$http_x_forwarded_for"';
# 
#     access_log /var/log/nginx/access.log main;
# 
#     sendfile on;
#     tcp_nopush on;
#     tcp_nodelay on;
#     keepalive_timeout 65;
#     types_hash_max_size 2048;
# 
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 10240;
#     gzip_proxied expired no-cache no-store private auth;
#     gzip_types text/plain text/css text/xml text/javascript 
#                application/x-javascript application/xml+rss 
#                application/json application/javascript;
#     gzip_disable "MSIE [1-6]\.";
# 
#     server {
#         listen 80;
#         server_name localhost;
#         root /usr/share/nginx/html;
#         index index.html;
# 
#         # Security headers
#         add_header X-Frame-Options "SAMEORIGIN" always;
#         add_header X-Content-Type-Options "nosniff" always;
#         add_header X-XSS-Protection "1; mode=block" always;
#         add_header Referrer-Policy "no-referrer-when-downgrade" always;
# 
#         # Gestion du routing React
#         location / {
#             try_files $uri $uri/ /index.html;
#         }
# 
#         # Cache pour les assets statiques
#         location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
#             expires 1y;
#             add_header Cache-Control "public, immutable";
#         }
# 
#         # Pas de cache pour index.html
#         location = /index.html {
#             add_header Cache-Control "no-cache, no-store, must-revalidate";
#             add_header Pragma "no-cache";
#             add_header Expires "0";
#         }
# 
#         # Healthcheck endpoint
#         location /health {
#             access_log off;
#             return 200 "healthy\n";
#             add_header Content-Type text/plain;
#         }
#     }
# }

# ========================================
# .dockerignore pour School 1cc
# ========================================
# Placer ce fichier dans: school-1cc/.dockerignore
# ========================================

# node_modules
# dist
# .git
# .gitignore
# README.md
# .env
# .env.local
# .env.*.local
# npm-debug.log*
# yarn-debug.log*
# yarn-error.log*
# .DS_Store
# Thumbs.db

# ========================================
# ========================================
# Dockerfile pour CRM Pro.cc
# ========================================
# Placer ce fichier dans: crm-pro/Dockerfile
# ========================================

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Arguments de build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLIC_KEY

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du code source
COPY . .

# Build de l'application avec les variables d'environnement
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copie de la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copie des fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]

# ========================================
# Configuration Nginx pour CRM Pro.cc
# ========================================
# Identique à School 1cc
# ========================================

# ========================================
# .dockerignore pour CRM Pro.cc
# ========================================
# Identique à School 1cc
# ========================================
